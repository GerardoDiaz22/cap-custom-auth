const cds = require('@sap/cds');
const { impl } = require('./server-impl');

cds.on('bootstrap', async (app) => await impl(app));

module.exports = cds.server;
