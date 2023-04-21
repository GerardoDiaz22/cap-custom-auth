namespace sap.jwt.products;
using { managed, cuid } from '@sap/cds/common';

entity Products : cuid {
    name : String;
    stock : Integer;
    price : Decimal(10,2);
}