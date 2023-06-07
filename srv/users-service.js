const bcrypt = require('bcrypt');

module.exports = cds.service.impl(async function () {
  this.on('userInfo', (req) => {
    const { id, username, roles, attr } = req.user;
    const parseRoles = Object.keys(roles);
    return { id, username, roles: parseRoles, attr };
  });

  this.before('UPDATE', 'Users', async (req) => {
    req.data.password = await bcrypt.hash(req.data.password, 10); // TODO: add error handling
  });
});
