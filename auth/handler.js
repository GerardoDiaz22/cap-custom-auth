const cds = require('@sap/cds');

// the workstation id is the same as the array index + 1 for the sake of simplicity
const workstationHub = [
  {
    id: 1,
    sociedades: ['1001', '1002'],
    centros: ['1001', '1002', '1003'],
    oficinas: ['1001', '1002', '1003', '1004'],
  },
  {
    id: 2,
    sociedades: ['1001', '1003'],
    centros: ['1001', '1003', '1004'],
    oficinas: ['1001', '1004'],
  },
  {
    id: 3,
    sociedades: ['1002', '1003'],
    centros: ['1001', '1003', '1004'],
    oficinas: ['1002', '1003', '1004'],
  },
  {
    id: 4,
    sociedades: ['1002', '1004'],
    centros: ['1002', '1003', '1004'],
    oficinas: ['1001', '1003', '1004'],
  },
  {
    id: 5,
    sociedades: ['1001', '1004'],
    centros: ['1001', '1002', '1003'],
    oficinas: ['1002', '1003', '1004'],
  },
  {
    id: 6,
    sociedades: ['1001', '1002', '1003', '1004'],
    centros: ['1001', '1002', '1003', '1004'],
    oficinas: ['1001', '1002', '1003', '1004'],
  },
];

module.exports = (req, res, next) => {
  if (req?.user) {
    req.user = new cds.User({
      id: req.user.id,
      roles: [req.user.role],
      attr: workstationHub[req.user.workstation - 1], // This would be a request to SAP Workspaces?
    });
    // req.tenant is for different companies
    next();
  } else {
    console.log('Error', req.user);
    res.status(401).send();
  }
};
