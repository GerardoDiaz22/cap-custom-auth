const cds = require('@sap/cds');

module.exports = (req, res, next) => {
  console.log("req.user",req.user) 
  if (req?.user) {
    req.user = new cds.User({
      id: req.user.id,
      roles: [req.user.role],
      attr: {
            sales : ["Electronics","Clothes"],
            products : ["Phone"],
            codestorg : ["1101","1102"]
          }
    });
    console.log('req.user', req.user);
    next();
  } else {
    console.log('Error', req.user);
    res.status(401).send();
  }
};
