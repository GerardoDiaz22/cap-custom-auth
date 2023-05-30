require('dotenv').config();
const express = require('express');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
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

  const cookieOptions = (time, unit) => {
    const millisPerUnit = {
      seconds: 1000,
      minutes: 60 * 1000,
      hours: 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000,
    };

    const maxAge = time * millisPerUnit[unit];

    return {
      maxAge,
      httpOnly: true,
      /* secure: false, // allows the cookie to be sent over an insecure HTTP connection (localhost)
       sameSite: 'none', // allows the cookie to be sent in cross-site requests */
    };
  };

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

  const requireAuthentication =
    ({ goToLoginOnUnauth = false, goToHomeOnAuth = false } = {}) =>
    (req, res, next) => {
      passport.authenticate(['jwtAccess', 'jwtRefresh'], (err, payload, info) => {
        if (err || !payload) {
          // Go to login page if unauthenticated
          if (goToLoginOnUnauth) {
            return res.redirect('/authentication/webapp/index.html');
          }
          // If already on login or error page, go to next middleware FIXME: There should be a cleaner way to do this
          if (req.originalUrl.startsWith('/authentication/webapp/') || req.originalUrl.startsWith('/error/webapp/')) {
            return next();
          }
          // Go to error page
          const errorMessage = info?.message || 'Token not found or invalid';
          const statusCode = info?.statusCode || 401;
          return res.redirect(
            `/error?statusCode=${encodeURIComponent(statusCode)}&message=${encodeURIComponent(errorMessage)}`
          );
        }

        // Set user in request
        req.user = payload.user;
        const id = payload.user.id;

        // Set new access token if refresh token is valid
        if (payload.flag) {
          const accessToken = generateAccessToken({ id });
          res.cookie('jwtAccessToken', accessToken, cookieOptions(1, 'hours'));
        }

        // Go to home page if authenticated
        if (goToHomeOnAuth) {
          return res.redirect('/');
        }
        // Go to next middleware
        return next();
      })(req, res, next);
    };

  const logRequest = (req, res, next) => {
    console.log(req.method, '-', req.url);
    return next();
  };

  app.use(logRequest);

  /* Always Unprotected */
  app.get('/error', (req, res, next) => {
    const message = req.query.message ? decodeURIComponent(req.query.message) : null;
    const statusCode = req.query.statusCode ? decodeURIComponent(req.query.statusCode) : null;
    return res.redirect(
      `http://localhost:4004/error/webapp/index.html?statusCode=${encodeURIComponent(
        statusCode
      )}&message=${encodeURIComponent(message)}`
    );
  });

  // TODO: maybe i should make redirects from /login to the webapp login page

  /* This should be a DELETE request, but we need to send the clearCookie option in the body */
  app.post('/logout', async (req, res) => {
    const client = await pool.connect();
    try {
      const refreshToken = req.cookies.jwtRefreshToken;
      await client.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
      // Clear cookies if requested
      if (req.body.clearCookies) {
        res.clearCookie('jwtAccessToken');
        res.clearCookie('jwtRefreshToken');
      }
      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
      return res.status(500).json({ message: 'Unexpected error' });
    } finally {
      client.release();
    }
  });

  app.post('/login', (req, res, next) => {
    passport.authenticate('login', { session: false }, async (err, user, info) => {
      if (err) {
        const message = info.message || 'Unexpected error';
        return res.status(500).json({ message });
      }

      if (!user) {
        const message = info.message || 'Login failed';
        return res.status(401).json({ message });
      }

      const client = await pool.connect(); //TODO: check how to handle an error here
      try {
        // Get user from database
        const result = await client.query('SELECT id FROM users WHERE email = $1', [user.email]);
        // Get user ID
        const id = result.rows[0].id;

        // Generate access token
        const accessToken = generateAccessToken({ id });

        // Generate refresh token
        const refreshToken = generateRefreshToken({ id }); // TODO: hash refrshtokens?
        await client.query('INSERT INTO refresh_tokens (token) VALUES ($1)', [refreshToken]);

        const message = info.message || 'Logged in Successful'; // TODO: think how to better handle this messages

        // Set cookies if requested
        if (req.body.setCookies) {
          res.cookie('jwtAccessToken', accessToken, cookieOptions(1, 'hours'));
          res.cookie('jwtRefreshToken', refreshToken, cookieOptions(90, 'days'));
          return res.status(201).json({ message });
        }
        return res.status(201).json({ message, accessToken, refreshToken });
      } catch (err) {
        return res.status(500).json({ message: err });
      } finally {
        client.release();
      }
    })(req, res, next);
  });

  app.post('/signup', async (req, res, next) => {
    const client = await pool.connect();
    try {
      const { username, email, role, workstation, password } = req.body;

      // Check if user already exists
      const existingUser = await client.query('SELECT * FROM users WHERE email = $1', [email]);
      if (existingUser.rowCount) {
        const message = 'Email already exists';
        return res.status(409).json({ message });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Save user to database
      const result = await client.query(
        'INSERT INTO users (username, email, password, role, workstation) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [username, email, hashedPassword, role, workstation]
      );
      // Get user ID
      const id = result.rows[0];

      // Generate access token
      const accessToken = generateAccessToken({ id });

      // Generate refresh token
      const refreshToken = generateRefreshToken({ id });
      await client.query('INSERT INTO refresh_tokens (token) VALUES ($1)', [refreshToken]);

      const message = 'Signup Successful';

      // Set cookies if requested
      if (req.body.setCookies) {
        res.cookie('jwtAccessToken', accessToken, cookieOptions(1, 'hours'));
        res.cookie('jwtRefreshToken', refreshToken, cookieOptions(90, 'days'));
        return res.status(201).json({ message });
      }
      return res.status(201).json({ accessToken, refreshToken, message });
    } catch (err) {
      return res.status(500).json({ message: err });
    } finally {
      client.release();
    }
  });

  app.post('/token', async (req, res, next) => {
    passport.authenticate(['jwtRefresh'], (err, payload, info) => {
      if (err || !payload) {
        const message = info.message || 'Invalid Token';
        return res.status(401).json({ message });
      }
      const id = payload.user.id;
      const accessToken = generateAccessToken({ id });
      const message = info.message || 'Refresh Token Created Successfully'; // TODO: Not sure about this message
      return res.status(201).json({ message, accessToken });
    })(req, res, next);
  });

  /* Only Unauthenticated -> redirects to Home */
  app.get('/authentication/webapp/*', requireAuthentication({ goToHomeOnAuth: true }));

  /* Only Authenticated -> redirects to Login */
  app.get('/', requireAuthentication({ goToLoginOnUnauth: true }));

  /* Always Protected */
  app.use(requireAuthentication());

  const getDirs = async (directory) => {
    return new Promise((resolve, reject) => {
      const directoryPath = path.join(__dirname, '..', directory);
      fs.readdir(directoryPath, { withFileTypes: true }, (err, files) => {
        if (err) {
          reject(err);
        } else {
          const dirs = files.filter((file) => file.isDirectory()).map((dir) => dir.name);
          resolve(dirs);
        }
      });
    });
  };

  app.get('/apps', async (req, res, next) => {
    if (req.user.role != 'admin') {
      const errorMessage = 'Restricted to admin users only'; // TODO: really need to standardize this messages
      const statusCode = 403;
      return res.redirect(`/error?statusCode=${encodeURIComponent(statusCode)}&message=${encodeURIComponent(errorMessage)}`);
    }
    try {
      const appsDirs = await getDirs('app');
      const apps = appsDirs.map((item) => ({ name: item }));
      return res.status(200).json({ apps });
    } catch (err) {
      return res.status(500).json({ message: 'Error reading directory', error: err });
    }
  });

  app.get('/users', async (req, res, next) => {
    if (req.user.role != 'admin') {
      const errorMessage = 'Restricted to admin users only'; // TODO: really need to standardize this messages
      const statusCode = 403;
      return res.redirect(`/error?statusCode=${encodeURIComponent(statusCode)}&message=${encodeURIComponent(errorMessage)}`);
    }
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT id, username, email, role, workstation FROM users');
      const users = result.rows;
      return res.status(200).json({ users });
    } catch (err) {
      return res.status(500).json({ message: err });
    } finally {
      client.release();
    }
  });

  /* Not found route */
  /* /app, /service/ and / are generated by CAP */
  app.use(async (req, res, next) => {
    try {
      const apps = await getDirs('app');
      if (
        apps.some((app) => req.originalUrl.startsWith(`/${app}`)) ||
        req.originalUrl.startsWith(`/service/`) ||
        req.originalUrl === '/'
      ) {
        return next();
      }
      const statusCode = 404;
      const errorMessage = 'Requested resource not found';
      return res.redirect(`/error?statusCode=${encodeURIComponent(statusCode)}&message=${encodeURIComponent(errorMessage)}`);
    } catch (err) {
      return res.status(500).json({ message: 'Internal Server Error', error: err });
    }
  });
};

module.exports = { impl };
