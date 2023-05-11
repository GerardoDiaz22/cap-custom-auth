sap.ui.define(
  ['sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel', 'sap/m/MessageToast'],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, MessageToast) {
    'use strict';

    return Controller.extend('home.home.controller.Home', {
      onInit: async function () {
        try {
          const { '@odata.context': context, ...oUser } = await $.get('/service/products/userInfo()');
          console.log(oUser);
          const oModel = new JSONModel(oUser);
          console.log(oModel);
          this.getView().setModel(oModel, 'user');
        } catch (err) {
          console.error(err);
          MessageToast.show(err);
        }
      },
      onLogoutPress: async function () {
        try {
          await $.post({
            url: '/logout',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({ clearCookies: true }),
          });
          // TODO: look for a better way to do this redirect
          window.location.href = 'http://localhost:4004/authentication/webapp/index.html';
        } catch (err) {
          const errorMessage =
            err.responseJSON.message && typeof err.responseJSON.message === 'string'
              ? err.responseJSON.message
              : 'Something went wrong';
          MessageToast.show(errorMessage);
        }
      },
      formatRoles: function (roles) {
        return roles.join(', ');
      },
    });
  }
);
