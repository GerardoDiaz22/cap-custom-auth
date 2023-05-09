module.exports = cds.service.impl(async function () {
  this.on('userInfo', (req) => {
    const { id, username, roles, attr } = req.user;
    const parseRoles = Object.keys(roles);
    return { id, username, roles: parseRoles, attr };
  });
});
