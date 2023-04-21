const cds = require('@sap/cds');

module.exports = (req, res, next) => {
  if (req?.user) {
    console.log('Old user:', req.user);
    req.user = new cds.User(req.user);
    console.log('New user:', req.user);
    next();
  } else {
    res.status(401).send();
  }
};
