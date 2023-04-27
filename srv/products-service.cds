using { sap.jwt.products as my } from '../db/schema';

@path: 'service/products'
service ProductsService @(requires : 'authenticated-user'){
    entity Products @(restrict: [ 
        {grant: ['*'], to: ['admin']},
        {grant: ['READ'], to: ['common'], where: 'name = $user.products'}
    ])
    as projection on my.Products;

    entity Sales @(restrict: [ 
        {grant: ['*'], to: ['admin']},
        {grant: ['READ'], to: ['common'], where: 'name = $user.sales'}
    ])
    as projection on my.Sales;

       entity Users @(restrict: [ 
        {grant: ['*'], to: ['admin', 'common']},
        {grant: ['READ'], to: ['common']}
    ])
    as projection on my.Users;
}