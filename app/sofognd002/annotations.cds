using ProductsService as service from '../../srv/products-service';

annotate service.GastosNoDistribuibles with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'estorg',
            Value : estorg,
        },
        {
            $Type : 'UI.DataField',
            Label : 'codestorg',
            Value : codestorg,
        },
        {
            $Type : 'UI.DataField',
            Label : 'moneda',
            Value : moneda,
        },
        {
            $Type : 'UI.DataField',
            Label : 'codcuentacontable',
            Value : codcuentacontable,
        },
        {
            $Type : 'UI.DataField',
            Label : 'importemes01',
            Value : importemes01,
        },
    ]
);
annotate service.GastosNoDistribuibles with @(
    UI.FieldGroup #GeneratedGroup1 : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'estorg',
                Value : estorg,
            },
            {
                $Type : 'UI.DataField',
                Label : 'codestorg',
                Value : codestorg,
            },
            {
                $Type : 'UI.DataField',
                Label : 'moneda',
                Value : moneda,
            },
            {
                $Type : 'UI.DataField',
                Label : 'codcuentacontable',
                Value : codcuentacontable,
            },
            {
                $Type : 'UI.DataField',
                Label : 'importemes01',
                Value : importemes01,
            },
            {
                $Type : 'UI.DataField',
                Label : 'importemes02',
                Value : importemes02,
            },
            {
                $Type : 'UI.DataField',
                Label : 'importemes03',
                Value : importemes03,
            },
            {
                $Type : 'UI.DataField',
                Label : 'importemes04',
                Value : importemes04,
            },
            {
                $Type : 'UI.DataField',
                Label : 'mes01',
                Value : mes01,
            },
            {
                $Type : 'UI.DataField',
                Label : 'mes02',
                Value : mes02,
            },
            {
                $Type : 'UI.DataField',
                Label : 'mes03',
                Value : mes03,
            },
            {
                $Type : 'UI.DataField',
                Label : 'mes04',
                Value : mes04,
            },
            {
                $Type : 'UI.DataField',
                Label : 'ejercicio',
                Value : ejercicio,
            },
            {
                $Type : 'UI.DataField',
                Label : 'ejerciciobase',
                Value : ejerciciobase,
            },
            {
                $Type : 'UI.DataField',
                Label : 'bloqueadousuario',
                Value : bloqueadousuario,
            },
            {
                $Type : 'UI.DataField',
                Label : 'bloqueadoadmin',
                Value : bloqueadoadmin,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup1',
        },
    ]
);
