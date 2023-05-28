require('dotenv').config();
const cds = require('@sap/cds');
const { default: axios } = require('axios');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 }); // 5min: 300

module.exports = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Current cache is based on the user's workstation
    const cacheKey = `clientWorkstation_${req.user.workstation}`;

    // Check if the workstation information is in the cache
    let clientWorkstation = cache.get(cacheKey);

    if (!clientWorkstation) {
      // Request configuration
      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${process.env.CLIENT_URL}Z_OD_PFCG_SRV/ROLSet?$filter=Objid eq '${req.user.workstation}'&$format=json&$expand=SOCIEDADSet,CENTROSet`,
        headers: {
          'X-Csrf-Token': 'Fetch',
          Authorization: 'Basic U09GT1M6c29mb3NAdGVhbTIwMjM=',
          Cookie: 'SAP_SESSIONID_R3Q_400=YHKcO80a9Mwm_GNbmlVk1nDp1sPzMxHtn4cAUFaGQqI%3d; sap-usercontext=sap-client=400',
        },
      };
      try {
        // Make the request to the SAP Gateway
        const { data } = await axios.request(config);

        // Parse the response
        const workstationInfo = data.d.results[0];

        console.log(workstationInfo);

        // Build the workstation object
        clientWorkstation = {
          id: workstationInfo.Objid,
          sociedades: workstationInfo.SOCIEDADSet.results.map((sociedad) => sociedad.Bukrs),
          centros: workstationInfo.CENTROSet.results.map((centro) => centro.Werks),
          oficinas: null,
        };

        // Store the workstation in the cache
        cache.set(cacheKey, clientWorkstation);
      } catch (err) {
        // Build the workstation object with the default values
        clientWorkstation = {
          id: req.user.workstation,
          sociedades: null,
          centros: null,
          oficinas: null,
        };
      }
    }

    // Connect to user service
    const srv = await cds.connect.to('UsersService');

    const query = cds.parse.cql(
      `SELECT from WorkstationApps { workstation, app { name } } WHERE workstation = ${clientWorkstation.id}`
    );

    const srvResponse = await srv.run(query);

    const apps = srvResponse.length === 0 ? null : srvResponse.map((item) => item.app.name);

    const userWorkstation = {
      ...clientWorkstation,
      apps,
    };

    // Fulfill the req.user contract for CDS
    req.user = new cds.User({
      id: req.user.id,
      username: req.user.username,
      roles: [req.user.role],
      attr: userWorkstation,
    });
    // req.tenant is for different companies (running a multitenant environment)

    return next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error', error: err });
  }
};
