const cds = require('@sap/cds');
const { default: axios } = require('axios');
const { use } = require('passport');

module.exports = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const srv = await cds.connect.to('ProductsService');

    const query = cds.parse.cql(
      `SELECT from Workstations { codigo, sociedades, centros, oficinas, apps { app { codigo, status }}} where codigo = ${req.user.workstation}`
    );

    const srvResponse = await srv.run(query);

    const workstation = srvResponse[0] || null;

    if (!workstation) {
      return res.status(401).json({ message: 'Workstation not found' });
    }

    const userWorkstation = {
      ...workstation,
      apps: workstation.apps.map((app) => app.app.codigo),
    };

    console.log(userWorkstation);

    /*
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: process.env.SAPURL + '/Z_OD_FORM_MASTERDATA_SRV/PLANCUENTASet?$format=json',
      headers: {
        'X-Csrf-Token': 'Fetch',
        Authorization: 'Basic U09GT1M6c29mb3NAdGVhbTIwMjM=',
        Cookie: 'SAP_SESSIONID_R3Q_400=YHKcO80a9Mwm_GNbmlVk1nDp1sPzMxHtn4cAUFaGQqI%3d; sap-usercontext=sap-client=400',
      },
    };
    const clientResponse = await axios.request(config);
    console.log(clientResponse.data);
    */

    // Fulfill the req.user contract for CDS
    req.user = new cds.User({
      id: req.user.id,
      username: req.user.username,
      roles: [req.user.role],
      attr: userWorkstation,
    });
    // req.tenant is for different companies (running a multitenant environment)

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
