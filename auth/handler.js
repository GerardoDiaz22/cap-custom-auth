require('dotenv').config();
const cds = require('@sap/cds');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour

module.exports = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Current cache is based on the user's workstation
  const cacheKey = `sapWorkstation_${req.user.workstation}`;

  // Check if the workstation information is in the cache
  let sapWorkstation = cache.get(cacheKey);

  // If the workstation information is not in the cache, make the request to SAP
  if (!sapWorkstation) {
    // SAP Gateway URL
    const sapURL = `${process.env.SAP_URL}Z_OD_PFCG_SRV/ROLSet?$filter=Objid eq '${req.user.workstation}'&$format=json&$expand=SOCIEDADSet,CENTROSet`;
    // Request configuration
    const sapConfig = {
      method: 'GET',
      headers: {
        'X-Csrf-Token': 'Fetch',
        Authorization: 'Basic U09GT1M6c29mb3NAdGVhbTIwMjM=',
        Cookie: 'SAP_SESSIONID_R3Q_400=YHKcO80a9Mwm_GNbmlVk1nDp1sPzMxHtn4cAUFaGQqI%3d; sap-usercontext=sap-client=400',
      },
    };

    // Make the request to the SAP Gateway
    const sapResponse = await fetch(sapURL, sapConfig).catch((err) => Response.error());

    /**
     * The fetch function attempts to resolve into a Response object, even if it encounters HTTP errors.
     * However, if there are network issues, it will throw a rejected promise.
     * To handle this scenario, we use Response.error() to ensure that the fetch function resolves to a default error.
     * This error will not pass the sapResponse.ok check, so it is a reliable solution.
     */

    // Check if the request was successful
    if (sapResponse.ok) {
      // Parse the response
      const data = await sapResponse.json(); // FIX: add error handling if the response is a malformed or empty JSON

      // Parse the workstation information
      const workstationInfo = data.d.results[0];

      // Build the workstation object
      sapWorkstation = {
        id: workstationInfo.Objid,
        sociedades: workstationInfo.SOCIEDADSet.results.map((sociedad) => sociedad.Bukrs),
        centros: workstationInfo.CENTROSet.results.map((centro) => centro.Werks),
        oficinas: null,
      };

      // Store the workstation in the cache
      cache.set(cacheKey, sapWorkstation);
    } else {
      // Build the workstation object with the default values
      sapWorkstation = {
        id: req.user.workstation,
        sociedades: null,
        centros: null,
        oficinas: null,
      };
    }
  }

  try {
    // Connect to user service
    const srv = await cds.connect.to('UsersService');

    // Get the apps assigned to the workstation
    const query = cds.parse.cql(
      `SELECT from WorkstationApps { workstation, app { name } } WHERE workstation = ${sapWorkstation.id}`
    );
    const srvResponse = await srv.run(query);

    // Get the apps names
    const apps = srvResponse.length === 0 ? null : srvResponse.map((item) => item.app.name);

    // Build the user workstation object
    const userWorkstation = {
      ...sapWorkstation,
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
    return res.status(500).json({ message: 'Internal Server Error', error: err });
  }
};
