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

  // include routes
  const isAuthorized = (req, res, next) => {
    passport.authenticate('jwt', (err, user, info) => {
      if (user) {
        req.user = user;
        res.redirect('/launchpad');
      } else {
        next();
      }
    })(req, res, next);
  };

  const isNotAuthorized = (req, res, next) => {
    passport.authenticate('jwt', (err, user, info) => {
      if (user) {
        req.user = user;
        next();
      } else {
        // This was the only way i found to change the default err message of JwtStrategy
        info.message = info.message ? info.message : 'Unkown error';
        info.message = info.message === 'No auth token' ? 'Forbidden Access' : info.message;
        res.redirect(`/error?message=${encodeURIComponent(info.message)}`);
      }
    })(req, res, next);
  };

  app.get('/', (req, res, next) => {
    return res.redirect('/login');
  });

  app.get('/launchpad', isNotAuthorized, (req, res, next) => {
    const user = req.user;
    return res.render('launchpad.ejs', { username: user.username, role: user.role });
  });

  app.get('/error', (req, res, next) => {
    const message = req.query.message ? decodeURIComponent(req.query.message) : null;
    return res.render('error.ejs', { error: message });
  });

  app.post('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.redirect('/login');
  });

  app.get('/register', isAuthorized, (req, res) => {
    const message = req.query.message ? decodeURIComponent(req.query.message) : null;
    res.render('register.ejs', { error: message });
  });

  app.get('/login', isAuthorized, (req, res) => {
    const message = req.query.message ? decodeURIComponent(req.query.message) : null;
    res.render('login.ejs', { error: message });
  });

  app.post('/login', (req, res, next) => {
    // This call the local strategy first
    passport.authenticate('login', { session: false }, (err, user, info) => {
      if (err || !user) {
        const message = info ? info.message : 'Login failed';
        return res.redirect(`/login?message=${encodeURIComponent(message)}`);
      }
      // This creates a session for the user
      req.login(user, { session: false }, async (err) => {
        if (err) {
          res.send(err);
        }
        const client = await pool.connect();
        try {
          // Generate and return JWT token
          const userID = await client.query('SELECT id FROM users WHERE email = $1', [user.email]);
          const token = jwt.sign({ user: userID.rows[0] }, process.env.ACCESS_TOKEN_SECRET);
          res.cookie('jwt', token, {
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

  app.post('/register', async (req, res, next) => {
    const client = await pool.connect();
    try {
      const existingUser = await client.query('SELECT * FROM users WHERE email = $1', [
        req.body.email,
      ]);
      if (existingUser.rowCount) {
        const message = 'Email already exists';
        return res.redirect(`/register?message=${encodeURIComponent(message)}`);
      }
      const username = req.body.name;
      const email = req.body.email;
      const role = req.body.role;
      const workstation = req.body.workstation;
      const password = await bcrypt.hash(req.body.password, 10);
      // Save user to database
      const userID = await client.query(
        'INSERT INTO users (username, email, password, role, workstation) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [username, email, password, role, workstation]
      );
      // Generate and return JWT token
      const token = jwt.sign({ user: userID.rows[0] }, process.env.ACCESS_TOKEN_SECRET);
      res.cookie('jwt', token, {
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

  app.get('/workstations', isNotAuthorized, async (req, res, next) => {
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

  // This is a catch-all route that check if the user is authorized
  // Probably going to use app.use for this later...
  app.use('*', isNotAuthorized, (req, res, next) => next());
};

module.exports = { impl };
