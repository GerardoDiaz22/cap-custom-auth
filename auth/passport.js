const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg')

  const pool = new Pool({
    host: '127.0.0.1',
    user: 'postgres',
    database: 'formulador_db',
    password: '123456',
    port: 5432,
    max: 2000,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })
  //console.log("pool passport",pool)

const db = new sqlite3.Database('./db/data/users.db', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  }
  //console.log('Connected to the database.');
});

module.exports = function (passport) {
  // Local Strategy
  passport.use(
    'login',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          // Find the user associated with the email provided by the user
          const user = await new Promise(function (resolve, reject) {

            pool.connect((err, client, release) => {
              if (err) {
                return console.error('Error acquiring client', err.stack)
              }
              pool.query('SELECT * FROM sap_jwt_products_users WHERE email = $1', [email], (err, rows) => {
                if (err) {
                  console.error('Error executing query', err.stack)
                  return reject(err);
                }
                const userId = rows.rows[0]
                //console.error('userId passport.js', userId)
                resolve(userId);
              })
  
            })

          });

          console.error('user', user)
          if (!user) {
            return done(null, false, { message: 'User not found' });
          }
          // Validate password and make sure it matches with the corresponding hash stored in the database
          const validate = await bcrypt.compare(password, user.password);
          console.error('validate', validate)
          if (!validate) {
            return done(null, false, { message: 'Wrong Password' });
          }
          return done(null, user, {
            message: 'Logged in Successfully',
          });
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  // JWT Strategy
  passport.use(
    'jwt',
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([
          (req) => {
            return req.cookies.jwt || null;
          },
        ]),
        secretOrKey: process.env.ACCESS_TOKEN_SECRET,
      },
      async (jwt_payload, done) => {
        // jwt_payload is the token payload
        try {
          const user = await new Promise(function (resolve, reject) {
            pool.connect((err, client, release) => {
              if (err) {
                return console.error('Error acquiring client', err.stack)
              }
              console.log('jwt_payload.user.id passport.js', jwt_payload.user.id)
              pool.query('SELECT * FROM sap_jwt_products_users WHERE id = $1', [jwt_payload.user.id], (err, rows) => {
                if (err) {
                  console.error('Error executing query', err.stack)
                  return reject(err);
                }
                console.log('rows.rows passport.js', rows.rows)
                const userId = rows.rows[0]
                console.log('userId passport.js', userId)
                resolve(userId);
              })
  
            })

          });
          if (user) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'User not found' });
          }
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
};
