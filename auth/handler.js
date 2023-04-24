const cds = require('@sap/cds');

module.exports = (req, res, next) => {
  if (req?.user) {
    req.user = new cds.User({
      id: req.user.id,
      roles: [req.user.role],
    });
    next();
  } else {
    console.log('Error', req.user);
    res.status(401).send();
  }
};
