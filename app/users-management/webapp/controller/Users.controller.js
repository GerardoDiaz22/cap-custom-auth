sap.ui.define(
  ['sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel', 'sap/m/MessageToast', 'sap/m/MessageBox'],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, MessageToast, MessageBox) {
    'use strict';

    return Controller.extend('sofos.users.management.usersmanagement.controller.Users', {
      onInit: function () {
        // Mock data
        const oData = {
          Workstations: [{ code: '10' }, { code: '20' }, { code: '100000' }], // For testing
        };
        // Define named model
        const oModel = new JSONModel(oData);
        // Set model in view
        this.getView().setModel(oModel, 'usersModel');
      },
      formatRoles: function (aRoles) {
        return aRoles.join(', ');
      },
      onRefreshPress: function () {
        // Get table binding
        const oBinding = this.byId('usersTable').getBinding('items');
        // Check if there are pending changes
        if (oBinding.hasPendingChanges()) {
          // Show message if there are pending changes
          MessageBox.error(this._getText('refreshNotPossibleMessage'));
          return;
        }
        // Refresh table
        oBinding.refresh();
        // Show success message
        MessageToast.show(this._getText('refreshSuccessMessage'));
      },
      _getText: function (sTextId, aArgs) {
        return this.getOwnerComponent().getModel('i18n').getResourceBundle().getText(sTextId, aArgs);
      },
      onDeletePress: function () {
        // Get selected item
        const oSelected = this.byId('usersTable').getSelectedItem();
        // Check if item is selected
        if (oSelected) {
          // Show confirmation dialog
          MessageBox.confirm(this._getText('deleteConfirmationMessage'), async (oAction) => {
            if (oAction === 'OK') {
              // Get selected item ID
              const sID = oSelected.getBindingContext().getProperty('ID');
              try {
                // Send DELETE request
                await $.ajax({ url: `/service/users/Users/${sID}`, method: 'DELETE' });
                // Show success message
                MessageToast.show(this._getText('deleteSuccessMessage'));
                // Refresh table
                this.byId('usersTable').getBinding('items').refresh();
              } catch (err) {
                const sMessage = err.statusText || 'UnknownError';
                // Show error message
                MessageToast.show(this._getText('deleteErrorMessage', [sMessage]));
              }
            }
          });
        } else {
          // Show message if no item is selected
          MessageToast.show(this._getText('deleteNotPossibleMessage'));
        }
      },
      _validateInput: function (oModel, oUser) {
        const { username, email, password, roles, workstation } = oUser;

        // Validate name
        if (!username) {
          oModel.setProperty('/NameValidationState', 'Error');
          oModel.setProperty('/NameValidationMessage', 'Name is required');
          return;
        } else {
          oModel.setProperty('/NameValidationState', 'None');
          oModel.setProperty('/NameValidationMessage', '');
        }

        // Validate email
        if (!email) {
          oModel.setProperty('/EmailValidationState', 'Error');
          oModel.setProperty('/EmailValidationMessage', 'Email is required');
          return;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
          oModel.setProperty('/EmailValidationState', 'Error');
          oModel.setProperty('/EmailValidationMessage', 'Invalid email format');
          return;
        } else {
          oModel.setProperty('/EmailValidationState', 'None');
          oModel.setProperty('/EmailValidationMessage', '');
        }

        // Validate password
        if (!password) {
          oModel.setProperty('/PasswordValidationState', 'Error');
          oModel.setProperty('/PasswordValidationMessage', 'Password is required');
          return;
        } else {
          oModel.setProperty('/PasswordValidationState', 'None');
          oModel.setProperty('/PasswordValidationMessage', '');
        }

        // Validate workstation
        if (!workstation) {
          oModel.setProperty('/WorkstationValidationState', 'Error');
          oModel.setProperty('/WorkstationValidationMessage', 'Workstation is required');
          return;
        } else {
          oModel.setProperty('/WorkstationValidationState', 'None');
          oModel.setProperty('/WorkstationValidationMessage', '');
        }

        // Validate roles
        if (!roles.length) {
          oModel.setProperty('/AdminRoleValidationState', 'Error');
          oModel.setProperty('/CommonRoleValidationState', 'Error');
          return;
        } else {
          oModel.setProperty('/AdminRoleValidationState', 'None');
          oModel.setProperty('/CommonRoleValidationState', 'None');
        }

        return true;
      },
      onCreatePress: function () {
        if (!this.createDialog) {
          this.createDialog = this.loadFragment({
            name: 'sofos.users.management.usersmanagement.view.CreateDialog',
          });
        }
        this.createDialog.then(function (oDialog) {
          oDialog.open();
        });
      },
      onCreateUserPress: async function () {
        // Get model
        const oModel = this.getView().getModel('usersModel');

        // Get input values
        const oData = oModel.getData();
        const {
          UserName: username,
          UserEmail: email,
          UserPassword: password,
          UserWorkstation: workstation,
          AdminRole: bAdminCheck,
          CommonRole: bCommonCheck,
        } = oData;

        // Create user object
        const roles = [];
        if (bAdminCheck) {
          roles.push('admin');
        }
        if (bCommonCheck) {
          roles.push('common');
        }
        const oUser = { username, email, password, roles, workstation, setCookies: false };

        // Validate input
        if (!this._validateInput(oModel, oUser)) return;

        // Show confirmation dialog
        MessageBox.confirm(this._getText('createConfirmationMessage'), async (oAction) => {
          if (oAction === 'OK') {
            try {
              // Send POST request
              await $.ajax({
                url: '/signup',
                method: 'POST',
                data: JSON.stringify(oUser),
                contentType: 'application/json',
                dataType: 'json',
              });

              // Show success message
              MessageToast.show(this._getText('createSuccessMessage'));

              // Clear input values
              oModel.setProperty('/UserName', '');
              oModel.setProperty('/UserEmail', '');
              oModel.setProperty('/UserPassword', '');
              oModel.setProperty('/UserWorkstation', '');
              oModel.setProperty('/AdminRole', false);
              oModel.setProperty('/CommonRole', false);

              // Refresh table
              this.byId('usersTable').getBinding('items').refresh();

              // Close dialog
              this.byId('createDialog').close();
            } catch (err) {
              // Get error message
              const sMessage = err.statusText || 'UnknownError';
              // Show error message
              MessageToast.show(this._getText('createErrorMessage', [sMessage]));
            }
          }
        });
      },
      onCloseCreatePress: function () {
        // Close dialog
        this.byId('createDialog').close();
      },
      onEditPress: function () {
        // Get selected item
        const oSelected = this.byId('usersTable').getSelectedItem();
        // Check if item is selected
        if (oSelected) {
          // Get selected item information
          const oUser = oSelected.getBindingContext().getObject();

          // Get model
          const oModel = this.getView().getModel('usersModel');

          // Set model data
          oModel.setProperty('/UserID', oUser.ID);
          oModel.setProperty('/UserName', oUser.username);
          oModel.setProperty('/UserEmail', oUser.email);
          oModel.setProperty('/UserPassword', oUser.password);
          oModel.setProperty('/UserWorkstation', oUser.workstation);

          // Set roles
          oUser.roles.forEach((role) => {
            if (role === 'admin') {
              oModel.setProperty('/AdminRole', true);
            }
            if (role === 'common') {
              oModel.setProperty('/CommonRole', true);
            }
          });

          // Open edit dialog
          if (!this.editDialog) {
            this.editDialog = this.loadFragment({
              name: 'sofos.users.management.usersmanagement.view.EditDialog',
            });
          }
          this.editDialog.then(function (oDialog) {
            oDialog.open();
          });
        } else {
          // Show message if no item is selected
          MessageToast.show(this._getText('editNotPossibleMessage'));
        }
      },
      onEditUserPress: async function () {
        // Get model
        const oModel = this.getView().getModel('usersModel');

        // Get input values
        const oData = oModel.getData();
        const {
          UserID: ID,
          UserName: username,
          UserEmail: email,
          UserPassword: password,
          UserWorkstation: workstation,
          AdminRole: bAdminCheck,
          CommonRole: bCommonCheck,
        } = oData;

        // Create user object
        const roles = [];
        if (bAdminCheck) {
          roles.push('admin');
        }
        if (bCommonCheck) {
          roles.push('common');
        }
        const oUser = { username, email, password, roles, workstation };

        // Only validate email input
        if (!/\S+@\S+\.\S+/.test(email)) {
          oModel.setProperty('/EmailValidationState', 'Error');
          oModel.setProperty('/EmailValidationMessage', 'Invalid email format');
          return;
        } else {
          oModel.setProperty('/EmailValidationState', 'None');
          oModel.setProperty('/EmailValidationMessage', '');
        }

        // Show confirmation dialog
        MessageBox.confirm(this._getText('editConfirmationMessage'), async (oAction) => {
          if (oAction === 'OK') {
            try {
              // Send PATCH request
              await $.ajax({
                url: `/service/users/Users/${ID}`,
                method: 'PATCH',
                data: JSON.stringify(oUser),
                contentType: 'application/json',
                dataType: 'json',
              });

              // Show success message
              MessageToast.show(this._getText('editSuccessMessage'));

              // Clear input values
              oModel.setProperty('/UserName', '');
              oModel.setProperty('/UserEmail', '');
              oModel.setProperty('/UserPassword', '');
              oModel.setProperty('/UserWorkstation', '');
              oModel.setProperty('/AdminRole', false);
              oModel.setProperty('/CommonRole', false);

              // Refresh table
              this.byId('usersTable').getBinding('items').refresh();

              // Close dialog
              this.byId('editDialog').close();
            } catch (err) {
              console.error(err);
              // Get error message
              const sMessage = err.statusText || 'UnknownError';
              // Show error message
              MessageToast.show(this._getText('editErrorMessage', [sMessage]));
            }
          }
        });
      },
      onCloseEditPress: function () {
        // Get model
        const oModel = this.getView().getModel('usersModel');
        // Clear input values
        oModel.setProperty('/UserName', '');
        oModel.setProperty('/UserEmail', '');
        oModel.setProperty('/UserPassword', '');
        oModel.setProperty('/UserWorkstation', '');
        oModel.setProperty('/AdminRole', false);
        oModel.setProperty('/CommonRole', false);
        // Close dialog
        this.byId('editDialog').close();
      },
    });
  }
);
