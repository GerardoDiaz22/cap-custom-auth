sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'sofos.sales.dummy.sales',
            componentId: 'SalesList',
            entitySet: 'Sales'
        },
        CustomPageDefinitions
    );
});