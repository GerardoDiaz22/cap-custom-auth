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
          const { '@odata.context': context, ...oUser } = await $.get(
            '/service/products/userInfo()'
          );
          console.log(oUser);
          const oModel = new JSONModel(oUser);
          console.log(oModel);
          this.getView().setModel(oModel, 'user');
        } catch (err) {
          console.error(err);
          MessageToast.show(err);
        }
      },
      onLogoutPress: async function () {},
      formatRoles: function (roles) {
        return roles.join(', ');
      },
    });
  }
);
