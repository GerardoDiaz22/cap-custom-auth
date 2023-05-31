namespace sofos.finance;

using {
    managed,
    cuid
} from '@sap/cds/common';

entity Products : cuid {
    sociedad : String;
    name     : String;
    stock    : Integer;
    price    : Decimal(10, 2);
}

entity Sales : cuid {
    sociedad : String;
    centro   : String;
    oficina  : String;
    name     : String;
    price    : Decimal(10, 2);
}