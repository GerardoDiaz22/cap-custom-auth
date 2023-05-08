sap.ui.define(
  ['sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel', 'sap/m/MessageToast'],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, MessageToast) {
    'use strict';

    return Controller.extend('auth.authentication.controller.Signup', {
      onInit: function () {
        // Define named model
        const oModel = new JSONModel({ data: {} });
        // Set model in view
        this.getView().setModel(oModel);
      },
      onSignupPress: async function () {
        // Retrieve input values
        const username = this.getView().byId('nameInput').getValue().trim();
        const email = this.getView().byId('emailInput').getValue().trim();
        const password = this.getView().byId('passwordInput').getValue().trim();
        const workstation = this.getView().byId('workstationInput').getValue().trim();
        const roleText = this.getView().byId('roleInput').getSelectedButton().getText().trim();

        const oModel = this.getView().getModel();
        const oRouter = this.getOwnerComponent().getRouter();

        // Validate name
        if (!username) {
          oModel.setProperty('/nameValidationState', 'Error');
          oModel.setProperty('/nameValidationMessage', 'Name is required');
          return;
        } else {
          oModel.setProperty('/nameValidationState', 'None');
          oModel.setProperty('/nameValidationMessage', '');
        }

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

        // Validate workstation
        if (!workstation) {
          oModel.setProperty('/workstationValidationState', 'Error');
          oModel.setProperty('/workstationValidationMessage', 'Workstation is required');
          return;
        } else if (isNaN(workstation)) {
          oModel.setProperty('/workstationValidationState', 'Error');
          oModel.setProperty('/workstationValidationMessage', 'Workstation must be a number');
          return;
        } else {
          oModel.setProperty('/workstationValidationState', 'None');
          oModel.setProperty('/workstationValidationMessage', '');
        }

        // Validate role
        if (!roleText) {
          oModel.setProperty('/roleValidationState', 'Error');
          return;
        } else {
          oModel.setProperty('/roleValidationState', 'None');
        }

        // Create data object
        const role = roleText === 'Administrator' ? 'admin' : 'common';
        const data = { username, email, password, role, workstation };

        // Send POST request to API endpoint
        try {
          const response = await $.ajax({
            url: '/api/register', // TODO: change register to signup?
            method: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            dataType: 'json',
          });
          // Set cookies
          // document.cookie = `jwt=${response.accessToken}; path=/`;
          // document.cookie = `refreshJwt=${response.refreshToken}; path=/`;
          MessageToast.show(response.message); //TODO: really need to think how to handle this messages
          oRouter.navTo('login');
        } catch (err) {
          console.error(err);
          const errorMessage =
            typeof err.responseJSON.message === 'string'
              ? err.responseJSON.message
              : err.statusText;
          MessageToast.show(errorMessage);
        }
      },
      onLoginLinkPress: function () {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo('login');
      },
    });
  }
);
