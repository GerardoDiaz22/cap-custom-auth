require('dotenv').config();
const express = require('express');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_USERS_DB,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const impl = async (app) => {
  // parse application/json
  app.use(express.json());

  // parse application/x-www-form-urlencoded
  app.use(express.urlencoded({ extended: false }));

  // parse cookies
  app.use(cookieParser());

  // initialize passport
  app.use(passport.initialize());

  // include passport strategies
  require('../auth/passport')(passport);

  // set view engine
  app.set('view engine', 'ejs');

  // set static folder
  app.use(express.static(path.join(__dirname, '..', 'public')));

  const generateAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
    });
  };

  const generateRefreshToken = (user) => {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
    });
  };

  const requireAuthentication = (returnToLaunchpad) => (req, res, next) => {
    passport.authenticate(['jwt', 'refreshJWT'], (err, payload, info) => {
      if (err || !payload) {
        if (!returnToLaunchpad) {
          const errorMessage = info.message || 'Invalid Token';
          return res.redirect(`/error?message=${encodeURIComponent(errorMessage)}`);
        }
        return next();
      }

      req.user = payload.user;

      if (payload.flag) {
        const accessToken = generateAccessToken({ user: { id: payload.user.id } });
        res.cookie('jwt', accessToken, {
          httpOnly: true,
          // secure: true, Uncomment this on production
        });
      }

      if (returnToLaunchpad) {
        return res.redirect('/launchpad');
      }
      return next();
    })(req, res, next);
  };

  // include routes
  app.get('/', (req, res, next) => {
    return res.redirect('/login');
  });

  app.get('/error', (req, res, next) => {
    const message = req.query.message ? decodeURIComponent(req.query.message) : null;
    return res.render('error.ejs', { error: message });
  });

  app.post('/logout', async (req, res) => {
    const client = await pool.connect();
    try {
      res.clearCookie('jwt');
      res.clearCookie('refreshJwt');
      await client.query('DELETE FROM refresh_tokens WHERE token = $1', [req.cookies.refreshJwt]);
      return res.redirect('/login');
    } catch (err) {
      return res.redirect(`/error?message=${encodeURIComponent(err)}`);
    } finally {
      client.release();
    }
  });

  app.get('/register', requireAuthentication(true), (req, res) => {
    const message = req.query.message ? decodeURIComponent(req.query.message) : null;
    return res.render('register.ejs', { error: message });
  });

  app.get('/login', requireAuthentication(true), (req, res) => {
    const message = req.query.message ? decodeURIComponent(req.query.message) : null;
    return res.render('login.ejs', { error: message });
  });

  app.post('/api/login', (req, res, next) => {
    passport.authenticate('login', { session: false }, (err, user, info) => {
      if (err) {
        const message = info.message || 'Unexpected error';
        return res.status(500).json({ error: message });
      }

      if (!user) {
        const message = info.message || 'Login failed';
        return res.status(401).json({ error: message });
      }

      req.login(user, { session: false }, async (err) => {
        if (err) {
          return res.status(500).send(err);
        }

        const client = await pool.connect();
        try {
          // Get user from database
          const result = await client.query('SELECT id FROM users WHERE email = $1', [user.email]);
          // Get user ID
          const userID = result.rows[0];

          // Generate access token
          const accessToken = generateAccessToken({ user: userID });

          // Generate refresh token
          const refreshToken = generateRefreshToken({ user: userID });
          await client.query('INSERT INTO refresh_tokens (token) VALUES ($1)', [refreshToken]);

          return res.status(201).json({ accessToken, refreshToken });
        } catch (err) {
          return res.status(500).json({ error: err });
        } finally {
          client.release();
        }
      });
    })(req, res, next);
  });

  app.post('/login', (req, res, next) => {
    // This call the local strategy first
    passport.authenticate('login', { session: false }, (err, user, info) => {
      if (err || !user) {
        const message = info ? info.message : 'Login failed';
        return res.redirect(`/login?message=${encodeURIComponent(message)}`);
      }
      /* This triggers passport to create an user session object, it won't be used, but it's needed for the JWT strategy to work */
      req.login(user, { session: false }, async (err) => {
        if (err) {
          return res.send(err);
        }
        /* The client is created before the try block so it can be used in the finally block (if an error occurs no one will catch it here) */
        const client = await pool.connect();
        try {
          // Get user from database
          const result = await client.query('SELECT id FROM users WHERE email = $1', [user.email]);
          // Get user ID
          const userID = result.rows[0];

          // Generate access token
          const accessToken = generateAccessToken({ user: userID });
          res.cookie('jwt', accessToken, {
            httpOnly: true,
            // secure: true, // Uncomment this on production
          });

          // Generate refresh token
          const refreshToken = generateRefreshToken({ user: userID });
          await client.query('INSERT INTO refresh_tokens (token) VALUES ($1)', [refreshToken]);
          res.cookie('refreshJwt', refreshToken, {
            httpOnly: true,
            // secure: true, // Uncomment this on production
          });

          // return res.json({ token });
          return res.redirect('/launchpad');
        } catch (err) {
          return res.redirect(`/login?message=${encodeURIComponent(err)}`);
        } finally {
          client.release();
        }
      });
    })(req, res, next);
  });

  app.post('/api/register', async (req, res, next) => {
    const client = await pool.connect();
    try {
      const { username, email, role, workstation, password } = req.body;

      // Check if user already exists
      const existingUser = await client.query('SELECT * FROM users WHERE email = $1', [
        req.body.email,
      ]);
      if (existingUser.rowCount) {
        const message = 'Email already exists';
        return res.status(409).json({ error: message });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Save user to database
      const result = await client.query(
        'INSERT INTO users (username, email, password, role, workstation) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [username, email, hashedPassword, role, workstation]
      );
      // Get user ID
      const userID = result.rows[0];

      // Generate access token
      const accessToken = generateAccessToken({ user: userID });

      // Generate refresh token
      const refreshToken = generateRefreshToken({ user: userID });
      await client.query('INSERT INTO refresh_tokens (token) VALUES ($1)', [refreshToken]);

      return res.status(201).json({ accessToken, refreshToken });
    } catch (err) {
      return res.status(500).json({ error: err });
    } finally {
      client.release();
    }
  });

  app.post('/register', async (req, res, next) => {
    /* The client is created before the try block so it can be used in the finally block (if an error occurs no one will catch it here) */
    const client = await pool.connect();
    try {
      const { username, email, role, workstation, password } = req.body;

      // Check if user already exists
      const existingUser = await client.query('SELECT * FROM users WHERE email = $1', [
        req.body.email,
      ]);
      if (existingUser.rowCount) {
        const message = 'Email already exists';
        return res.redirect(`/register?message=${encodeURIComponent(message)}`);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Save user to database
      const result = await client.query(
        'INSERT INTO users (username, email, password, role, workstation) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [username, email, hashedPassword, role, workstation]
      );
      // Get user ID
      const userID = result.rows[0];

      // Generate access token
      const accessToken = generateAccessToken({ user: userID });
      res.cookie('jwt', accessToken, {
        httpOnly: true,
        // secure: true, // Uncomment this on production
      });

      // Generate refresh token
      const refreshToken = generateRefreshToken({ user: userID });
      await client.query('INSERT INTO refresh_tokens (token) VALUES ($1)', [refreshToken]);
      res.cookie('refreshJwt', refreshToken, {
        httpOnly: true,
        // secure: true, // Uncomment this on production
      });

      // return res.json({ token });
      return res.redirect('/login');
    } catch (err) {
      return res.redirect(`/register?message=${encodeURIComponent(err)}`);
    } finally {
      client.release();
    }
  });

  app.post('/api/token', async (req, res, next) => {
    passport.authenticate(['refreshJWT'], (err, payload, info) => {
      if (err || !payload) {
        const message = info.message || 'Invalid Token';
        return res.status(401).json({ error: message });
      }
      const accessToken = generateAccessToken({ user: { id: payload.user.id } });
      return res.status(201).json({ accessToken });
    })(req, res, next);
  });

  app.use(requireAuthentication(false));

  app.get('/launchpad', (req, res, next) => {
    const user = req.user;
    return res.render('launchpad.ejs', { username: user.username, role: user.role });
  });

  app.get('/workstations', async (req, res, next) => {
    const workstationHub = [
      {
        ID: '1',
        sociedades: ['1001'],
        centros: ['1001'],
        oficinas: ['1001'],
      },
      {
        ID: '2',
        sociedades: ['1002'],
        centros: ['1002'],
        oficinas: ['1002'],
      },
      {
        ID: '3',
        sociedades: ['1003'],
        centros: ['1001'],
        oficinas: ['1004'],
      },
      {
        ID: '4',
        sociedades: ['1004'],
        centros: ['1003'],
        oficinas: ['1006'],
      },
    ];
    if (req.query?.ID) {
      return res.json(workstationHub.filter((workstation) => workstation.ID === req.query.ID));
    }
    return res.json(workstationHub);
  });
};

module.exports = { impl };
