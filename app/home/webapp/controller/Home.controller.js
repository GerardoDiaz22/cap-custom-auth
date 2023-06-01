sap.ui.define(
  ['sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageToast',
    'sap/ui/core/Fragment',
    'sap/m/MenuItem'],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller,
    JSONModel,
    MessageToast,
    Fragment,
    MenuItem) {
    'use strict';

    return Controller.extend('home.home.controller.Home', {
      onInit: async function () {
        try {
          /* Get user info */
          const { '@odata.context': context, ...oUser } = await $.get('/service/users/userInfo()');
          
          //example user info
          oUser.attr.centros = ["1001","1003"]
          oUser.attr.sociedades = ["1001","1002"]
          oUser.attr.oficinas = ["1001","1004"]

          //get user initials
          oUser.initials = getInitials(oUser.username);
          
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
        MessageToast.show("user panel")
      },
      onLogoutPress: async function () {
        try {
          /* Send DELETE request */
          await $.ajax({
            url: '/logout',
            type: 'DELETE',
            dataType: 'json',
          });

          //navigate to login
          navigateTo("/authentication/webapp/index.html");

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
        const sUrl = '/' + oTile.name + '/webapp/index.html';

        /* Go to url */
        navigateTo(sUrl)
      },
      onPressSrvTile: function (oEvent) {
        /* Get pressed tile object */
        const oTile = oEvent.getSource().getBindingContext('tiles').getObject();

        /* Set service url with tile information */
        const sUrl = '/service/products/' + oTile.url;

        /* Go to url */
        navigateTo(sUrl)
      },
      onPressAvatar: function () {
        var oView = this.getView(),
          oButton = oView.byId("userAvatar");

        if (!this._oMenuFragment) {
          this._oMenuFragment = Fragment.load({
            id: oView.getId(),
            name: "home.home.view.Menu",
            controller: this
          }).then(function (oMenu) {
            oMenu.openBy(oButton);
            this._oMenuFragment = oMenu;
            return this._oMenuFragment;
          }.bind(this));
        } else {
          this._oMenuFragment.openBy(oButton);
        }
      },
      onUserInfoPress: function () {
        var oView = this.getView(),
          oButton = oView.byId("userAvatar");

        if (!this._oInfoDialog) {
          Fragment.load({
            id: oView.getId(),
            name: "home.home.view.InfoDialog",
            controller: this
          }).then(function (dialog) {
            this.getView().addDependent(dialog)
            dialog .open();
            this._oInfoDialog = dialog
            return dialog;
          }.bind(this));
        }else{
          this._oInfoDialog.open();
        }
      },
      onMenuAction: function (oEvent) {
        var oItem = oEvent.getParameter("item"),
          sItemPath = "";

        while (oItem instanceof MenuItem) {
          sItemPath = oItem.getText() + " > " + sItemPath;
          oItem = oItem.getParent();
        }

        sItemPath = sItemPath.substring(0, sItemPath.lastIndexOf(" > "));

        //comment this
        // MessageToast.show("Action triggered on item: " + sItemPath);
      },
      onCloseInfoBtnPress: function() {
        this._oInfoDialog.close();
      }
    });
  }
);

//navigates to baseURl + url passed to the function
function navigateTo(url) {
  const baseURL = new URL(window.location.href).origin;
  const win = window.open(`${baseURL}${url}`, '_self');
  win.focus();
}


function getInitials(name) {
  // Split the full name into an array of words.
  const words = name.split(' ');

  // Initialize the initials variable.
  let initials = '';
  // Loop through the words and get the first letter of each word.
  for (let i = 0; i < words.length; i++) {
    initials += words[i][0];
    if (i == 1) break;
  }
  // Return the initials.
  return initials.toUpperCase();
}