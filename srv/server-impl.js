require('dotenv').config();
const express = require('express');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const { router: authRoutes, requireAuthentication } = require('./auth-routes'); // TODO: to auth/

const impl = async (app) => {
  /* Parse application/json */
  app.use(express.json());

  /* Parse cookies */
  app.use(cookieParser());

  /* Initialize passport */
  app.use(passport.initialize());

  /* Include passport strategies */
  require('../auth/passport')(passport);

  /* Set static folder */
  app.use(express.static(path.join(__dirname, '..', 'public')));

  /* Helper functions */
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

  /* Logging */
  app.use((req, res, next) => {
    console.log(req.method, '-', req.url);
    return next();
  });

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

  /* Authentication Routes */
  app.use('/', authRoutes);

  /* Only Unauthenticated -> redirects to Home */
  app.get('/authentication/webapp/*', requireAuthentication({ goToHomeOnAuth: true }));

  /* Only Authenticated -> redirects to Login */
  app.get('/', requireAuthentication({ goToLoginOnUnauth: true }));

  /* Always Protected */
  app.use(requireAuthentication());

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
