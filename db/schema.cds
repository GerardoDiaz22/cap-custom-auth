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

entity GastosNoDistribuibles : cuid {
    estorg : String NOT NULL;
    codestorg : String NOT NULL;
    moneda : String NOT NULL;
    codcuentacontable : String NOT NULL;
    mes01 : Decimal(10,2);
    mes02 : Decimal(10,2);
    mes03 : Decimal(10,2);
    mes04 : Decimal(10,2);
}