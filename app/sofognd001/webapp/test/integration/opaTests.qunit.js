sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'sofognd001/test/integration/FirstJourney',
		'sofognd001/test/integration/pages/GastosNoDistribuiblesList',
		'sofognd001/test/integration/pages/GastosNoDistribuiblesObjectPage'
    ],
    function(JourneyRunner, opaJourney, GastosNoDistribuiblesList, GastosNoDistribuiblesObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('sofognd001') + '/index.html'
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