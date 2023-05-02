const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
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
        const client = await pool.connect();
        try {
          // Find the user associated with the email provided by the user
          const user = await client.query('SELECT * FROM users WHERE email = $1', [email]);
          if (!user.rowCount) {
            return done(null, false, { message: 'User not found' });
          }
          // Validate password and make sure it matches with the corresponding hash stored in the database
          const validate = await bcrypt.compare(password, user.rows[0].password);
          if (!validate) {
            return done(null, false, { message: 'Wrong Password' });
          }
          return done(null, user.rows[0], {
            message: 'Logged in Successfully',
          });
        } catch (error) {
          return done(error);
        } finally {
          client.release();
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
          (req) => req.cookies.jwt || null,
          // ExtractJwt.fromCookie('jwt')
          ExtractJwt.fromAuthHeaderAsBearerToken(),
        ]),
        secretOrKey: process.env.ACCESS_TOKEN_SECRET,
      },
      async (jwt_payload, done) => {
        // jwt_payload is the token payload
        const client = await pool.connect();
        try {
          const user = await client.query('SELECT * FROM users WHERE id = $1', [
            jwt_payload.user.id,
          ]);
          if (user.rowCount) {
            return done(null, user.rows[0]);
          } else {
            return done(null, false, { message: 'User not found' });
          }
        } catch (error) {
          return done(error, false);
        } finally {
          client.release();
        }
      }
    )
  );
};
