sap.ui.define(
  ['sap/ui/core/mvc/Controller'],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller) {
    'use strict';

    return Controller.extend('sofos.users.management.usersmanagement.controller.Users', {
      onInit: function () {},
      formatRoles: function (roles) {
        console.log(roles);
        return roles.join(', ');
      },
    });
  }
);
