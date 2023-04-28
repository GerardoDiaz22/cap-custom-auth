using { sap.jwt.products as my } from '../db/schema';

@path: 'service/products'
service ProductsService @(requires : 'authenticated-user'){
    entity Products @(restrict: [ 
        { grant: ['*'], to: ['admin'] },
        { grant: ['READ'], to: ['common'], where: 'sociedad = $user.sociedades' }
    ])
    as projection on my.Products;

    entity Sales @(restrict: [ 
        { grant: ['*'], to: ['admin'] },
        { grant: ['READ'], to: ['common'], where: 'sociedad = $user.sociedades and centro = $user.centros and oficina = $user.oficinas' }
    ])
    as projection on my.Sales;
}