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
    importemes01 : Decimal(10,2);
    importemes02 : Decimal(10,2);
    importemes03 : Decimal(10,2);
    importemes04 : Decimal(10,2);
    mes01 : Integer;
    mes02 : Integer;
    mes03 : Integer;
    mes04 : Integer;
    ejercicio : Integer;
    ejerciciobase : Integer;
    bloqueadousuario : Boolean;
    bloqueadoadmin : Boolean;
}

entity Ejercicio : cuid {
    ejercicio : Integer;
    mes01 : Integer;
    mes02 : Integer;
    mes03 : Integer;
    mes04 : Integer;
}

/*entity EstructuraOrganizativa : cuid {
    codigo : String NOT NULL;
    nombre : String NOT NULL;
    tipo : String NOT NULL;
    padre : String NULL;
    key TipoEstructuraOrganizativaId : Association to one TipoEstructuraOrganizativa
        @assert.integrity;
}

entity TipoEstructuraOrganizativa : cuid {
    codigo : String NOT NULL;
    nombre : String NOT NULL;
    to_DocumentItems : Association to many EstructuraOrganizativa
        @assert.integrity;
}*/