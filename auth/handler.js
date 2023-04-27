const cds = require('@sap/cds');

module.exports = (req, res, next) => {
  if (req?.user) {
    req.user = new cds.User({
      id: req.user.id,
      roles: [req.user.role],
      attr: {
          sales : ["Electronics","Clothes"],
          products : ["Phone"]
        }
    });
    console.log('req.user', req.user);
    next();
  } else {
    console.log('Error', req.user);
    res.status(401).send();
  }
};
