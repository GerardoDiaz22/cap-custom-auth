sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'sofos.sales.dummy.sales',
            componentId: 'SalesObjectPage',
            entitySet: 'Sales'
        },
        CustomPageDefinitions
    );
});