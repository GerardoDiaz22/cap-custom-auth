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
          /* Get user info */
          const { '@odata.context': context, ...oUser } = await $.get('/service/users/userInfo()');

          /* Set user info to model */
          const oModel = new JSONModel(oUser);

          /* Set user model to view */
          this.getView().setModel(oModel, 'user');

          /* Get apps */
          const apps = oUser.attr.apps.map((app) => ({ name: app }));

          /* Get services */
          const { value: services } = await $.get('/service/finance');

          /* Set apps and services to model */
          const oTiles = new JSONModel({ apps, services });

          /* Set tile model to view */
          this.getView().setModel(oTiles, 'tiles');
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
      onPressAppTile: function (oEvent) {
        /* Get pressed tile object */
        const oTile = oEvent.getSource().getBindingContext('tiles').getObject();

        /* Set app url with tile information */
        const sUrl = oTile.name + '/webapp/index.html';

        /* Go to url */
        $(location).attr('href', 'http://localhost:4004/' + sUrl); // window.location.href = 'http://localhost:4004/' + sUrl;
      },
      onPressSrvTile: function (oEvent) {
        /* Get pressed tile object */
        const oTile = oEvent.getSource().getBindingContext('tiles').getObject();

        /* Set service url with tile information */
        const sUrl = 'service/products/' + oTile.url;

        /* Go to url */
        $(location).attr('href', 'http://localhost:4004/' + sUrl); // window.location.href = 'http://localhost:4004/' + sUrl;
      },
    });
  }
);
