const cds = require('@sap/cds');
const { default: axios } = require('axios');

module.exports = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).send('Unauthorized');
    }
    // Get workstation data from SAP Workspaces (local endpoint for now)
    const { ID, ...workstation } = await axios
      .get(`http://localhost:4004/workstations?ID=${req.user.workstation}`, {
        headers: {
          Authorization: `Bearer ${req.cookies.jwtAccessToken}`, // FIXME: This weird auth header is just for this demo
        },
      })
      .then((res) => res.data[0]);

    if (!workstation) {
      return res.status(401).send('Workstation not found');
    }

    // Fulfill the req.user contract for CDS
    req.user = new cds.User({
      id: req.user.id,
      username: req.user.username,
      roles: [req.user.role],
      attr: workstation,
    });
    // req.tenant is for different companies (running a multitenant environment)

    next();
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};
