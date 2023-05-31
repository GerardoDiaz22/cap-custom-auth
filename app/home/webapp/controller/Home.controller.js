sap.ui.define(
  ['sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel', 'sap/m/MessageToast', 'sap/ui/commons/ComboBox', 'sap/ui/core/ListItem'],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, MessageToast, ComboBox, ListItem) {
    'use strict';

    return Controller.extend('home.home.controller.Home', {
      onInit: async function () {

        var oComboBox1 = new ComboBox("ComboBox1");
        oComboBox1.setTooltip("Country");
        oComboBox1.setEditable(false)
        oComboBox1.setValue("India");
        oComboBox1.setWidth("200px")

        var oItem = new ListItem("Country1");
        oItem.setText("France");
        oComboBox1.addItem(oItem);

        oItem = new ListItem("Country2");
        oItem.setText("India");
        oComboBox1.addItem(oItem);

        oItem = new ListItem("Country3");
        oItem.setText("Japan");
        oComboBox1.addItem(oItem);

        oItem = new ListItem("Country4");
        oItem.setText("China");
        oComboBox1.addItem(oItem);

        // oComboBox1.placeAt("content");

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
          //const { value: services } = await $.get('/service/finance');

          /* Set apps and services to model */
          //const oTiles = new JSONModel({ apps, services });
          const oTiles = new JSONModel({ apps });

          /* Set tile model to view */
          this.getView().setModel(oTiles, 'tiles');
        } catch (err) {
          console.error(err);
          MessageToast.show(err);
        }
      },
      onUserPanelPress: async function () {
        MessageToast.show("user panel pressed")
      },
      onLogoutPress: async function () {
        try {
          await $.post({
            url: '/logout',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({ clearCookies: true }),
          });
          
          const win = window.open("http://localhost:4004/authentication/webapp/index.html", '_self');
          win.focus();
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
