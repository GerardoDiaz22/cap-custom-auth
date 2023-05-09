sap.ui.define(
  ['sap/ui/core/mvc/Controller', 'sap/ui/model/odata/v4/ODataModel', 'sap/m/MessageToast'],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, ODataModel, MessageToast) {
    'use strict';

    return Controller.extend('home.home.controller.Home', {
      onInit: async function () {},
      onLogoutPress: async function () {},
    });
  }
);
