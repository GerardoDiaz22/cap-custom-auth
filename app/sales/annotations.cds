using FinanceService as service from '../../srv/finance-service';

annotate service.Sales with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'sociedad',
            Value : sociedad,
        },
        {
            $Type : 'UI.DataField',
            Label : 'centro',
            Value : centro,
        },
        {
            $Type : 'UI.DataField',
            Label : 'oficina',
            Value : oficina,
        },
        {
            $Type : 'UI.DataField',
            Label : 'name',
            Value : name,
        },
        {
            $Type : 'UI.DataField',
            Label : 'price',
            Value : price,
        },
    ]
);
annotate service.Sales with @(
    UI.FieldGroup #GeneratedGroup1 : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'sociedad',
                Value : sociedad,
            },
            {
                $Type : 'UI.DataField',
                Label : 'centro',
                Value : centro,
            },
            {
                $Type : 'UI.DataField',
                Label : 'oficina',
                Value : oficina,
            },
            {
                $Type : 'UI.DataField',
                Label : 'name',
                Value : name,
            },
            {
                $Type : 'UI.DataField',
                Label : 'price',
                Value : price,
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
