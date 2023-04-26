require('dotenv').config();
const express = require('express');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');


module.exports = async (app) => {
  // parse application/json
  app.use(express.json());

  // parse application/x-www-form-urlencoded
  app.use(express.urlencoded({ extended: false }));

  // parse cookies
  app.use(cookieParser());

  // Initialize the SQLite database connection
  const { createUsersTable } = require('./db_setup');
  console.log("require('./db_setup')", require('./db_setup'))
  console.log("require('./db_setup_pg')", require('./db_setup_pg'))

  const { createUsersTablepg } = require('./db_setup_pg');

  console.log("entro")

  const { Client } = require('pg');

  const client = new Client({
    host: '127.0.0.1',
    user: 'postgres',
    database: 'usuario_db',
    password: '123456',
    port: 5432,
  });

  const { Pool } = require('pg')

  const pool = new Pool({
    host: '127.0.0.1',
    user: 'postgres',
    database: 'usuario_db',
    password: '123456',
    port: 5432,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })

  const execute = async (query) => {
    try {
      await client.connect();     // gets connection
      await client.query(query);  // sends queries
      return true;
    } catch (error) {
      console.error("error execute cliente", error.stack);
      return false;
    } finally {
      await client.end();         // closes connection
    }
  };


  //Creata tabla en postgres si no existe
  //createUsersTablepg(execute)


  /*const db = new sqlite3.Database('./db/data/users.db', (err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
    } else {
      console.log('Connected to the SQLite database');
      // Call the createUsersTable function after connecting to the database
      createUsersTable(db);
    }
  });*/

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
      console.log("isAuthorized")
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
      console.log("isNotAuthorized")
      if (user) {
        req.user = user;
        next();
      } else {
        // This was the only way i found to change the default err message of JwtStrategy
        console.log("info",info)
        console.log("user",user)
        console.log("err",err)
        // This was the only way i found to change the default err message of JwtStrategy
        //info.message = info.message === 'No auth token' ? 'Forbidden Access' : info.message;
        res.redirect(`/error?message=${encodeURIComponent("error sin usuario")}`);
        //res.redirect(`/error?message=${encodeURIComponent(info.message)}`)
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
      console.log("app.post('/login'")
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
        const idpg = await new Promise(function (resolve, reject) {
          //console.log("user", user)
          pool.connect((err, client, release) => {
            if (err) {
              return console.error('Error acquiring client', err.stack)
            }
            pool.query('SELECT id FROM sap_jwt_products_users WHERE email = $1', [user.email], (err, rows) => {
              if (err) {
                console.error('Error executing query', err.stack)
                return reject(err);
              }
              //const userId = rows.rows[0].id
              const userId = rows.rows[0]
              resolve(userId);
            })

          })

        });
        console.log("igpg <<<<<", idpg)

        const token = jwt.sign({ user: idpg }, process.env.ACCESS_TOKEN_SECRET);
        console.log("token <<<<<", token)
        res.cookie('jwt', token, {
          httpOnly: true,
        });
        return res.redirect('/launchpad');
      });
    })(req, res, next);
  });

  app.post('/register', async (req, res, next) => {
    const existingUser = await new Promise(function (resolve, reject) {

      pool.connect((err, client, release) => {
        if (err) {
          return console.error('Error acquiring client', err.stack)
        }
        pool.query('SELECT * FROM sap_jwt_products_users WHERE email = $1', [req.body.email], (err, rows) => {
          if (err) {
            console.error('Error executing query', err.stack)
            return reject(err);
          }
          const userId = rows.rows[0]
          resolve(userId);
        })

      })
      /*db.get('SELECT * FROM users WHERE email = ?', [req.body.email], function (err, rows) {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });*/
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
      const idcod =  crypto.randomUUID();
      pool.connect((err, client, release) => {
        if (err) {
          return console.error('Error acquiring client', err.stack)
        }
        //pool.query('INSERT INTO sap_jwt_products_users (username, email, password, role) VALUES ($1, $2, $3, $4)  RETURNING id', [username, email, password, role], (err, rows) => {
          pool.query('INSERT INTO sap_jwt_products_users (id, username, email, password, role) VALUES ($1, $2, $3, $4, $5)  RETURNING id', [idcod, username, email, password, role], (err, rows) => {
          if (err) {
            console.error('Error executing query', err.stack)
            return reject(err);
          }
          console.log("rows",rows.rows[0].id)
          resolve(rows.rows[0].id);
        })
      })
      /*db.run(
        'INSERT INTO sap_jwt_products_users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, password, role],
        function (err) {
          if (err) {
            return reject(err);
          }
          console.log("this.lastID222",this.lastID)
          resolve(this.lastID);
        }
      );*/
    });
    // Generate and return JWT token
    console.log("token id",id)
    const token = jwt.sign({ user: id }, process.env.ACCESS_TOKEN_SECRET);
    console.log("token",token)
    res.cookie('jwt', token, { httpOnly: true });
    // return res.json({ token });
    return res.redirect('/login');
  });

  // This is a catch-all route that check if the user is authorized
  // Probably going to use app.use for this later...
  app.use('*', isNotAuthorized, (req, res, next) => next());
};
