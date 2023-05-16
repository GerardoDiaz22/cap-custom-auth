using {sap.jwt.products as my} from '../db/schema';

@path: 'service/products'
service ProductsService @(requires: 'authenticated-user') {
    entity Products @(restrict: [
        {
            grant: ['*'],
            to   : ['admin']
        },
        {
            grant: ['READ'],
            to   : ['common'],
            where: 'sociedad = $user.sociedades'
        }
    ])                             as projection on my.Products;

    entity Sales @(restrict: [
        {
            grant: ['*'],
            to   : ['admin']
        },
        {
            grant: ['READ'],
            to   : ['common'],
            where: 'sociedad = $user.sociedades and centro = $user.centros and oficina = $user.oficinas'
        }
    ])                             as projection on my.Sales;

    function userInfo() returns User;

    type User {
        id       : String;
        username : String;
        roles    : array of String;
        attr     : Attributes;
    }

    type Attributes {
        sociedades : array of String;
        centros    : array of String;
        oficinas   : array of String;
    }


    entity GastosNoDistribuibles   as projection on my.GastosNoDistribuibles;
    entity estorg                  as projection on my.estorg;
    entity varianteejercicio       as projection on my.varianteejercicio;
    entity gastosConsolidadosview as projection on my.gastosConsolidadosview;
    entity GastosNoDistribuiblesAg as projection on my.GastosNoDistribuiblesAg;

    /*annotate ProductsService.GastosNoDistribuiblesAg with @(Aggregation.ApplySupported) {
        importetotal  @Analytics.Measure  @Aggregation.default: #SUM
    }*/

    view gastosConsolidados as
        select from my.GastosNoDistribuibles as g {
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
            SUM(importemes12)   as importemes12 : String,
        }
        group by
            g.codcuentacontable,
            g.moneda;

    view gastosConsolidadosDetalle as
        select from my.GastosNoDistribuibles as g {
            g.codcuentacontable as codcuentacontable,
            g.codestorg         as codestorg,
            g.moneda            as moneda,
            importetotal        as importetotal : String,
            importemes01        as importemes01 : String,
            importemes02        as importemes02 : String,
            importemes03        as importemes03 : String,
            importemes04        as importemes04 : String,
            importemes05        as importemes05 : String,
            importemes06        as importemes06 : String,
            importemes07        as importemes07 : String,
            importemes08        as importemes08 : String,
            importemes09        as importemes09 : String,
            importemes10        as importemes10 : String,
            importemes11        as importemes11 : String,
            importemes12        as importemes12 : String,
        }
}
