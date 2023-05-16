module.exports = cds.service.impl(async function () {
  this.on('userInfo', (req) => {
    const { id, username, roles, attr } = req.user;
    const parseRoles = Object.keys(roles);
    return { id, username, roles: parseRoles, attr };
  });

  this.after('READ', 'gastosConsolidados', (gastosConsolidadosview, req) => {
    gastosConsolidadosview.forEach((element) => {
      let fSum = 0;
      fSum =
        parseFloat(element.importemes01) +
        parseFloat(element.importemes02) +
        parseFloat(element.importemes03) +
        parseFloat(element.importemes04) +
        parseFloat(element.importemes05) +
        parseFloat(element.importemes06) +
        parseFloat(element.importemes07) +
        parseFloat(element.importemes08) +
        parseFloat(element.importemes09) +
        parseFloat(element.importemes10) +
        parseFloat(element.importemes11) +
        parseFloat(element.importemes12);
      element.importetotal = parseFloat(fSum).toFixed(2);
    });
    console.log('gastosConsolidadosview', gastosConsolidadosview[0].codcuentacontable);
    return gastosConsolidadosview;
  });
});
