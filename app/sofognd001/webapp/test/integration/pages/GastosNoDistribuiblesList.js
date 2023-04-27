sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'sofognd001',
            componentId: 'GastosNoDistribuiblesList',
            entitySet: 'GastosNoDistribuibles'
        },
        CustomPageDefinitions
    );
});