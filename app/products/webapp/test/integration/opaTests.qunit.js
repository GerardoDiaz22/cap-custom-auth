sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'sofos/products/dummy/products/test/integration/FirstJourney',
		'sofos/products/dummy/products/test/integration/pages/ProductsList',
		'sofos/products/dummy/products/test/integration/pages/ProductsObjectPage'
    ],
    function(JourneyRunner, opaJourney, ProductsList, ProductsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('sofos/products/dummy/products') + '/index.html'
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