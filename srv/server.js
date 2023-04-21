const cds = require('@sap/cds');
const impl = require('./serverImpl');

cds.on('bootstrap', async (app) => await impl(app));

module.exports = cds.server;
