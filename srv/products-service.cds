using { sap.jwt.products as my } from '../db/schema';

@path: 'service/products'
service ProductsService @(requires : 'authenticated-user'){
    entity Products @(restrict: [ 
        {grant: ['READ', 'WRITE'], to: 'admin'}
    ])
    as projection on my.Products;

    entity Sales @(restrict: [ 
        {grant: ['READ', 'WRITE'], to: ['admin', 'common']}
    ])
    as projection on my.Sales;
}