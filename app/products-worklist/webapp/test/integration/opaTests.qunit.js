sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'sap/jwt/app/worklist/productsworklist/test/integration/FirstJourney',
		'sap/jwt/app/worklist/productsworklist/test/integration/pages/ProductsList',
		'sap/jwt/app/worklist/productsworklist/test/integration/pages/ProductsObjectPage'
    ],
    function(JourneyRunner, opaJourney, ProductsList, ProductsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('sap/jwt/app/worklist/productsworklist') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheProductsList: ProductsList,
					onTheProductsObjectPage: ProductsObjectPage
                }
            },
            opaJourney.run
        );
    }
);