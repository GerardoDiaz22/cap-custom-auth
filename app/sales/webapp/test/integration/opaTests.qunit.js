sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'sap/sales/sales/test/integration/FirstJourney',
		'sap/sales/sales/test/integration/pages/SalesList',
		'sap/sales/sales/test/integration/pages/SalesObjectPage'
    ],
    function(JourneyRunner, opaJourney, SalesList, SalesObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('sap/sales/sales') + '/index.html'
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