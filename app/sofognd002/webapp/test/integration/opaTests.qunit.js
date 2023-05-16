sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'sofognd002/test/integration/FirstJourney',
		'sofognd002/test/integration/pages/GastosNoDistribuiblesList',
		'sofognd002/test/integration/pages/GastosNoDistribuiblesObjectPage'
    ],
    function(JourneyRunner, opaJourney, GastosNoDistribuiblesList, GastosNoDistribuiblesObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('sofognd002') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheGastosNoDistribuiblesList: GastosNoDistribuiblesList,
					onTheGastosNoDistribuiblesObjectPage: GastosNoDistribuiblesObjectPage
                }
            },
            opaJourney.run
        );
    }
);