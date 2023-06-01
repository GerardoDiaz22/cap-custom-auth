require('dotenv').config();
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const cds = require('@sap/cds');

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
        const srv = await cds.connect.to('UsersService');
        const tx = srv.tx({ user: { roles: ['admin'] } });
        try {
          // Find the user associated with the email provided by the user
          const user = await tx.run(SELECT.from('Users').where({ email }));
          if (!user.length) {
            return done(null, false, { message: 'User not found' });
          }
          // Validate password and make sure it matches with the corresponding hash stored in the database
          const validate = await bcrypt.compare(password, user[0].password);
          if (!validate) {
            return done(null, false, { message: 'Wrong Password' });
          }
          await tx.commit();
          return done(null, user[0], { message: 'Logged in Successfully' });
        } catch (err) {
          await tx.rollback();
          return done(err, false, { message: 'Internal server error' });
        }
      }
    )
  );
  // JWT Strategy
  passport.use(
    'jwtAccess',
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([
          (req) => req.cookies.jwtAccessToken || null,
          // ExtractJwt.fromCookie('jwtAccessToken')
          ExtractJwt.fromAuthHeaderAsBearerToken(),
        ]),
        secretOrKey: process.env.ACCESS_TOKEN_SECRET,
      },
      async (tokenPayload, done) => {
        const srv = await cds.connect.to('UsersService');
        const tx = srv.tx({ user: { roles: ['admin'] } });
        try {
          // Get the user from the database
          const user = await tx.run(SELECT.from('Users').where({ ID: tokenPayload.ID }));
          // Check if the user exists
          if (user.length) {
            return done(null, { user: user[0], flag: false }, { message: 'Valid Token' });
          } else {
            return done(null, false, { message: 'User not found' });
          }
        } catch (err) {
          await tx.rollback();
          return done(err, false, { message: 'Internal server error' });
        }
      }
    )
  );

  passport.use(
    'jwtRefresh',
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([
          (req) => req.cookies.jwtRefreshToken || null,
          // ExtractJwt.fromCookie('jwtRefreshToken')
          ExtractJwt.fromAuthHeaderAsBearerToken(),
        ]),
        secretOrKey: process.env.REFRESH_TOKEN_SECRET,
        passReqToCallback: true,
      },
      async (req, tokenPayload, done) => {
        const srv = await cds.connect.to('UsersService');
        const tx = srv.tx({ user: { roles: ['admin'] } });
        try {
          // Get the refresh token from the request
          const refreshToken = req.cookies.jwtRefreshToken || req.headers.authorization.split(' ')[1];

          // Check if the refresh token is valid
          const validate = await tx.run(SELECT.from('RefreshTokens').where({ token: refreshToken }));
          if (!validate.length) {
            return done(null, false, { message: 'Refresh Token Expired' });
          }

          // Get the user from the database
          const user = await tx.run(SELECT.from('Users').where({ ID: tokenPayload.ID }));

          // Check if the user exists
          if (user.length) {
            return done(null, { user: user[0], flag: true }, { message: 'Valid Token' });
          } else {
            return done(null, false, { message: 'User not found' });
          }
        } catch (err) {
          await tx.rollback();
          return done(err, false, { message: 'Internal server error' });
        }
      }
    )
  );
};
