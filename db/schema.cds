namespace sap.jwt.products;

using {
    managed,
    cuid
} from '@sap/cds/common';

entity Workstations {
    key codigo : Integer;
    sociedades : array of String;
    centros    : array of String;
    oficinas   : array of String;
    apps       : Association to many WorkstationApps on apps.workstation = $self;
}

entity WorkstationApps : cuid {
  key workstation : Association to Workstations;
  key app         : Association to Apps;
}

entity Apps {
    key codigo   : String;
    status       : Boolean;
    workstations : Association to many WorkstationApps on workstations.app = $self;
}

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

entity GastosNoDistribuibles : cuid {
    key ID: UUID;
    codestorg         : String(5) NOT null;
    moneda            : String(5) NOT null;
    codcuentacontable : String(20) NOT null;
    importemes01      : Decimal(13, 2);
    importemes02      : Decimal(13, 2);
    importemes03      : Decimal(13, 2);
    importemes04      : Decimal(13, 2);
    importemes05      : Decimal(13, 2);
    importemes06      : Decimal(13, 2);
    importemes07      : Decimal(13, 2);
    importemes08      : Decimal(13, 2);
    importemes09      : Decimal(13, 2);
    importemes10      : Decimal(13, 2);
    importemes11      : Decimal(13, 2);
    importemes12      : Decimal(13, 2);
    importetotal      : Decimal(13, 2) default 0.0;
    mes01             : Integer;
    mes02             : Integer;
    mes03             : Integer;
    mes04             : Integer;
    ejercicio         : Integer;
    ejerciciobase     : Integer;
    bloqueadousuario  : Boolean;
    bloqueadoadmin    : Boolean;
}

entity GastosNoDistribuiblesAg as projection on GastosNoDistribuibles {
    codestorg,        
    moneda,          
    codcuentacontable,
    importemes01,
    importemes02,
    importemes03,
    importemes04,
    importemes05,
    importemes06,
    importemes07,
    importemes08,
    importemes09,
    importemes10,
    importemes11,
    importemes12,
    importetotal,
    ejercicio,
    ejerciciobase,
    bloqueadousuario,
    bloqueadoadmin,
}

entity estorg : cuid {
    codestorg : String(5) NOT null;
    estorg    : String;
}

entity varianteejercicio : cuid {
    sociedadco : String(5) NOT null;
    mes01 : String;
    mes02 : String;
    mes03 : String;
    mes04 : String;
    mes05 : String;
    mes06 : String;
    mes07 : String;
    mes08 : String;
    mes09 : String;
    mes10 : String;
    mes11 : String;
    mes12 : String;
}

define view gastosConsolidadosview as
        select from GastosNoDistribuibles as g {
            g.codcuentacontable as codcuentacontable,
            g.moneda            as moneda,
            SUM(importetotal)   as importetotal : String,
            SUM(importemes01)   as importemes01 : String,
            SUM(importemes02)   as importemes02 : String,
            SUM(importemes03)   as importemes03 : String,
            SUM(importemes04)   as importemes04 : String,
            SUM(importemes05)   as importemes05 : String,
            SUM(importemes06)   as importemes06 : String,
            SUM(importemes07)   as importemes07 : String,
            SUM(importemes08)   as importemes08 : String,
            SUM(importemes09)   as importemes09 : String,
            SUM(importemes10)   as importemes10 : String,
            SUM(importemes11)   as importemes11 : String,
            SUM(importemes12)   as importemes12 : String
        }
        group by
            g.codcuentacontable,
            g.moneda;