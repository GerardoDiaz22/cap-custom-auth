using ProductsService as service from '../../srv/products-service';

annotate service.GastosNoDistribuibles with @(UI.SelectionFields: [codcuentacontable]);

annotate service.GastosNoDistribuibles with @(UI.LineItem: [

    {
        $Type: 'UI.DataField',
        Label: 'moneda',
        Value: moneda,
    },
    {
        $Type: 'UI.DataField',
        Label: 'codcuentacontable',
        Value: codcuentacontable,
    },
    {
        $Type: 'UI.DataField',
        Label: '{@i18n>importetotal}',
        Value: importetotal,
    },
    {
        $Type: 'UI.DataField',
        Label: '{@i18n>importemes01}',
        Value: importemes01,
    },
    {
        $Type: 'UI.DataField',
        Label: '{@i18n>importemes02}',
        Value: importemes02,

    },
    {
        $Type: 'UI.DataField',
        Label: '{@i18n>importemes03}',
        Value: importemes03,

    },
    {
        $Type: 'UI.DataField',
        Label: '{@i18n>importemes04}',
        Value: importemes04,

    },
    {
        $Type: 'UI.DataField',
        Label: '{@i18n>importemes05}',
        Value: importemes05,
    },
    {
        $Type: 'UI.DataField',
        Label: '{@i18n>importemes06}',
        Value: importemes06,

    },
    {
        $Type: 'UI.DataField',
        Label: '{@i18n>importemes07}',
        Value: importemes07,

    },
    {
        $Type: 'UI.DataField',
        Label: '{@i18n>importemes08}',
        Value: importemes08,

    },
    {
        $Type: 'UI.DataField',
        Label: '{@i18n>importemes09}',
        Value: importemes09,
    },
    {
        $Type: 'UI.DataField',
        Label: '{@i18n>importemes10}',
        Value: importemes10,
    },
    {
        $Type: 'UI.DataField',
        Label: '{@i18n>importemes11}',
        Value: importemes11,
    },
    {
        $Type: 'UI.DataField',
        Label: '{@i18n>importemes12}',
        Value: importemes12,
    },
]);

annotate service.gastosConsolidados with @(UI.LineItem: [
    {
        $Type: 'UI.DataField',
        Label: 'codcuentacontable',
        Value: codcuentacontable,
    },
    {
        $Type: 'UI.DataField',
        Label: 'moneda',
        Value: moneda,
    },
    {
        $Type: 'UI.DataField',
        Label: '{@i18n>importetotal}',
        Value: importetotal,
    },
    {
        $Type: 'UI.DataField',
        Label: '{@i18n>importemes01}',
        Value: importemes01,
    },
    {
        $Type: 'UI.DataField',
        Label: '{@i18n>importemes02}',
        Value: importemes02,

    },
    {
        $Type: 'UI.DataField',
        Label: '{@i18n>importemes03}',
        Value: importemes03,

    },
    {
        $Type: 'UI.DataField',
        Label: '{@i18n>importemes04}',
        Value: importemes04,

    },
    {
        $Type: 'UI.DataField',
        Label: '{@i18n>importemes05}',
        Value: importemes05,
    },
    {
        $Type: 'UI.DataField',
        Label: '{@i18n>importemes06}',
        Value: importemes06,

    },
    {
        $Type: 'UI.DataField',
        Label: '{@i18n>importemes07}',
        Value: importemes07,

    },
    {
        $Type: 'UI.DataField',
        Label: '{@i18n>importemes08}',
        Value: importemes08,

    },
    {
        $Type: 'UI.DataField',
        Label: '{@i18n>importemes09}',
        Value: importemes09,
    },
    {
        $Type: 'UI.DataField',
        Label: '{@i18n>importemes10}',
        Value: importemes10,
    },
    {
        $Type: 'UI.DataField',
        Label: '{@i18n>importemes11}',
        Value: importemes11,
    },
    {
        $Type: 'UI.DataField',
        Label: '{@i18n>importemes12}',
        Value: importemes12,
    },
]);



annotate service.GastosNoDistribuibles with @(
    UI.FieldGroup #GeneratedGroup1: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'moneda',
                Value: moneda,
            },
            {
                $Type: 'UI.DataField',
                Label: 'codcuentacontable',
                Value: codcuentacontable,
            },
            {
                $Type: 'UI.DataField',
                Label: '{@main>/varianteejercicio/0/mes01}',
                Value: importemes01,
            },
            {
                $Type: 'UI.DataField',
                Label: 'importemes02',
                Value: importemes02,
            },
            {
                $Type: 'UI.DataField',
                Label: 'importemes03',
                Value: importemes03,
            },
            {
                $Type: 'UI.DataField',
                Label: 'importemes04',
                Value: importemes04,
            },
            {
                $Type: 'UI.DataField',
                Label: 'mes01',
                Value: mes01,
            },
            {
                $Type: 'UI.DataField',
                Label: 'mes02',
                Value: mes02,
            },
            {
                $Type: 'UI.DataField',
                Label: 'mes03',
                Value: mes03,
            },
            {
                $Type: 'UI.DataField',
                Label: 'mes04',
                Value: mes04,
            },
            {
                $Type: 'UI.DataField',
                Label: 'ejercicio',
                Value: ejercicio,
            },
            {
                $Type: 'UI.DataField',
                Label: 'ejerciciobase',
                Value: ejerciciobase,
            },
            {
                $Type: 'UI.DataField',
                Label: 'bloqueadousuario',
                Value: bloqueadousuario,
            },
            {
                $Type: 'UI.DataField',
                Label: 'bloqueadoadmin',
                Value: bloqueadoadmin,
            },
        ],
    },
    //agregado
    UI.LineItem #estorgGroup: [ {
        $Type: 'UI.DataField',
        Label: '{@i18n>importetotal}',
        Value: importetotal
    },
    {
        $Type: 'UI.DataField',
        Label: '{@i18n>cuentacontable}',
        Value: codcuentacontable
    }],
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'GeneratedFacet1',
            Label : '{@i18n>@informacionGeneral}',
            Target: '@UI.FieldGroup#GeneratedGroup1',
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'detalleForecast',
            Label : '{@i18n>@detalleForecast}',
            //Ajustado
            Target: '@UI.LineItem#estorgGroup'
        }
    ]

);

annotate service.estorg with @(UI: {LineItem #estorgGroup1: [
    {
        $Type: 'UI.DataField',
        Value: codestorg
    },
    {
        $Type: 'UI.DataField',
        Value: estorg
    }
]});

annotate service.estorg with @(UI.SelectionFields: [estorg, ]);
