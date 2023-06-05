sap.ui.define(
  ['sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel', 'sap/m/MessageToast'],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, MessageToast) {
    'use strict';

    return Controller.extend('auth.authentication.controller.Login', {
      onInit: function () {
        // Define named model
        const oModel = new JSONModel();
        // Set model in view
        this.getView().setModel(oModel);
      },
      onLoginPress: async function () {
        // Retrieve input values
        const email = this.getView().byId('emailInput').getValue().trim();
        const password = this.getView().byId('passwordInput').getValue().trim();

        const oModel = this.getView().getModel();
        const oRouter = this.getOwnerComponent().getRouter();

        // Validate email
        if (!email) {
          oModel.setProperty('/emailValidationState', 'Error');
          oModel.setProperty('/emailValidationMessage', 'Email is required');
          return;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
          oModel.setProperty('/emailValidationState', 'Error');
          oModel.setProperty('/emailValidationMessage', 'Invalid email format');
          return;
        } else {
          oModel.setProperty('/emailValidationState', 'None');
          oModel.setProperty('/emailValidationMessage', '');
        }

        // Validate password
        if (!password) {
          oModel.setProperty('/passwordValidationState', 'Error');
          oModel.setProperty('/passwordValidationMessage', 'Password is required');
          return;
        } else {
          oModel.setProperty('/passwordValidationState', 'None');
          oModel.setProperty('/passwordValidationMessage', '');
        }

        // Create data object
        const data = { email, password, setCookies: true };

        // Send POST request to API endpoint
        try {
          const response = await $.ajax({
            url: '/login',
            method: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            dataType: 'json',
          });
          // Navigate to home page
          //window.location.href = 'http://localhost:4004/'; // TODO: think of a better way to do this
          navigateTo("/home/webapp/index.html")
        } catch (err) {
          const errorMessage =
            err.responseJSON.message && typeof err.responseJSON.message === 'string'
              ? err.responseJSON.message
              : 'Something went wrong';
          MessageToast.show(errorMessage);
        }
      },
      onSignupLinkPress: function () {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo('signup');
      },
    });
  }
);

//navigates to baseURl + url passed to the function
function navigateTo(url) {
  const baseURL = new URL(window.location.href).origin;
  const win = window.open(`${baseURL}${url}`, '_self');
  win.focus();
}