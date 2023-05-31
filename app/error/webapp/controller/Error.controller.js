sap.ui.define(
  ['sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel'],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel) {
    'use strict';

    return Controller.extend('error.error.controller.Error', {
      onInit: function () {
        /* Get the URI parameters */
        const oUriParams = jQuery.sap.getUriParameters();

        /* Get values from the URI parameters. */
        const sStatusParam = oUriParams.get('statusCode');
        const sMessage = oUriParams.get('message');

        /* Define status messages */
        const statusMessages = {
          401: '401: Unauthorized',
          403: '403: Forbidden',
          404: '404: Not Found',
        };

        /* Get the status message from the status code. */
        const sStatusCode = statusMessages[sStatusParam] || 'Unknown';

        const iconNames = {
          401: 'sap-icon://locked',
          403: 'sap-icon://sys-cancel-2',
          404: 'sap-icon://document',
        };

        const sIcon = iconNames[sStatusParam] || 'sap-icon://error';

        /* Define model */
        const oModel = new JSONModel({
          icon: sIcon,
          statusCode: sStatusCode,
          message: sMessage,
        });

        /* Set named model in view */
        this.getView().setModel(oModel, 'error');
      },
    });
  }
);
