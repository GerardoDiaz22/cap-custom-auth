namespace sap.jwt.products;
using { managed, cuid } from '@sap/cds/common';

entity Products : cuid {
    name : String;
    stock : Integer;
    price : Decimal(10,2);
}

entity Sales : cuid {
    name : String;
    price : Decimal(10,2);
}

entity Users : cuid {
    username : String NOT NULL;
    email : String NOT NULL;
    password : String NOT NULL;
    role : String NOT NULL;
}