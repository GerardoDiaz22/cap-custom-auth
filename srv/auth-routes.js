require('dotenv').config();
const express = require('express');
const cds = require('@sap/cds');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();

/* Helper functions */
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
    /*
      secure: false, // allows the cookie to be sent over an insecure HTTP connection (localhost)
      sameSite: 'none', // allows the cookie to be sent in cross-site requests
      */
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
      const ID = payload.user.ID;

      // Set new access token if refresh token is valid
      if (payload.flag) {
        const accessToken = generateAccessToken({ ID });
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

/* Routes */

/**
 * This was a POST request, we needed to send the clearCookie option in the request body to clear the cookies on the client side (browser)
 * but now it tries to always do it.
 */
router.delete('/logout', async (req, res) => {
  const srv = await cds.connect.to('UsersService');
  const tx = srv.tx({ user: { roles: ['admin'] } });
  try {
    const refreshToken = req.cookies.jwtRefreshToken || null;
    if (refreshToken) {
      await tx.run(DELETE.from('RefreshTokens').where({ token: refreshToken }));
    }
    await tx.commit();
    res.clearCookie('jwtAccessToken');
    res.clearCookie('jwtRefreshToken');
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    await tx.rollback();
    return res.status(500).json({ message: 'Internal Servel Error', error: err });
  }
});

router.post('/signup', async (req, res, next) => {
  const srv = await cds.connect.to('UsersService');
  const tx = srv.tx({ user: { roles: ['admin'] } });
  try {
    const { username, email, roles, workstation, password } = req.body;

    // Look user up by email
    const existingUser = await tx.run(SELECT.from('Users').where({ email }));

    // Check if user already exists
    if (existingUser.length) {
      await tx.rollback();
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to database
    const createdUser = await tx.run(
      INSERT.into('Users', { username, email, password: hashedPassword, roles, workstation })
    );

    // Get user ID
    const ID = createdUser.ID;

    // Generate access token
    const accessToken = generateAccessToken({ ID });

    // Generate refresh token
    const refreshToken = generateRefreshToken({ ID });
    await tx.run(INSERT.into('RefreshTokens', { token: refreshToken }));

    // Close connection on success
    await tx.commit();
    // Set tokens as cookies if requested
    if (req.body.setCookies) {
      res.cookie('jwtAccessToken', accessToken, cookieOptions(1, 'hours'));
      res.cookie('jwtRefreshToken', refreshToken, cookieOptions(90, 'days'));
      return res.status(201).json({ message: 'Signup Successful' });
    }
    // Return tokens otherwise
    return res.status(201).json({ message: 'Signup Successful', accessToken, refreshToken });
  } catch (err) {
    // Close connection on failure
    await tx.rollback();
    return res.status(500).json({ message: 'Internal Server Error', error: err });
  }
});

router.post('/login', (req, res, next) => {
  passport.authenticate('login', { session: false }, async (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: info.message, error: err });
    }

    if (!user) {
      return res.status(401).json({ message: info.message });
    }

    const srv = await cds.connect.to('UsersService');
    const tx = srv.tx({ user: { roles: ['admin'] } });
    try {
      // Get user ID
      const ID = user.ID;

      // Generate access token
      const accessToken = generateAccessToken({ ID });

      // Generate refresh token
      const refreshToken = generateRefreshToken({ ID });
      await tx.run(INSERT.into('RefreshTokens', { token: refreshToken }));

      // Close connection on success
      await tx.commit();
      // Set tokens as cookies if requested
      if (req.body.setCookies) {
        res.cookie('jwtAccessToken', accessToken, cookieOptions(1, 'hours'));
        res.cookie('jwtRefreshToken', refreshToken, cookieOptions(90, 'days'));
        return res.status(201).json({ message: info.message });
      }
      // Return tokens otherwise
      return res.status(201).json({ message: info.message, accessToken, refreshToken });
    } catch (err) {
      await tx.rollback();
      console.log(err);
      return res.status(500).json({ message: 'Internal Servel Error', error: err });
    }
  })(req, res, next);
});

module.exports = { router, requireAuthentication };
