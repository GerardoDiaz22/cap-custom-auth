require('dotenv').config();
const express = require('express');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = async (app) => {
  // parse application/json
  app.use(express.json());

  // parse application/x-www-form-urlencoded
  app.use(express.urlencoded({ extended: false }));

  // parse cookies
  app.use(cookieParser());

  // Initialize the SQLite database connection
  const { createUsersTable } = require('./db_setup');
  const db = new sqlite3.Database('./db/data/users.db', (err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
    } else {
      console.log('Connected to the SQLite database');
      // Call the createUsersTable function after connecting to the database
      createUsersTable(db);
    }
  });

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
    return res.render('launchpad.ejs', { username: user.username });
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
        // Generate and return JWT token
        const id = await new Promise(function (resolve, reject) {
          db.get('SELECT id FROM users WHERE email = ?', [user.email], function (err, rows) {
            if (err) {
              return reject(err);
            }
            resolve(rows);
          });
        });
        const token = jwt.sign({ user: id }, process.env.ACCESS_TOKEN_SECRET);
        res.cookie('jwt', token, {
          httpOnly: true,
        });
        // return res.json({ token });
        return res.redirect('/launchpad');
      });
    })(req, res, next);
  });

  app.post('/register', async (req, res, next) => {
    const existingUser = await new Promise(function (resolve, reject) {
      db.get('SELECT * FROM users WHERE email = ?', [req.body.email], function (err, rows) {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
    if (existingUser) {
      const message = 'Email already exists';
      return res.redirect(`/register?message=${encodeURIComponent(message)}`);
    }
    const username = req.body.name;
    const email = req.body.email;
    const role = req.body.role;
    const password = await bcrypt.hash(req.body.password, 10);
    // Save user to database
    const id = await new Promise(function (resolve, reject) {
      db.run(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, password, role],
        function (err) {
          if (err) {
            return reject(err);
          }
          resolve(this.lastID);
        }
      );
    });
    // Generate and return JWT token
    const token = jwt.sign({ user: id }, process.env.ACCESS_TOKEN_SECRET);
    res.cookie('jwt', token, { httpOnly: true });
    // return res.json({ token });
    return res.redirect('/login');
  });

  // This is a catch-all route that check if the user is authorized
  // Probably going to use app.use for this later...
  app.use('*', isNotAuthorized, (req, res, next) => next());
};
