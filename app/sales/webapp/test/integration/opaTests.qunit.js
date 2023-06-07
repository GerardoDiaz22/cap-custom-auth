sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'sofos/sales/dummy/sales/test/integration/FirstJourney',
		'sofos/sales/dummy/sales/test/integration/pages/SalesList',
		'sofos/sales/dummy/sales/test/integration/pages/SalesObjectPage'
    ],
    function(JourneyRunner, opaJourney, SalesList, SalesObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('sofos/sales/dummy/sales') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheSalesList: SalesList,
					onTheSalesObjectPage: SalesObjectPage
                }
            },
            opaJourney.run
        );
    }
);