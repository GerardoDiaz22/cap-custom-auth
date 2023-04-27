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
        {grant: ['*'], to: ['admin']},
        {grant: ['READ'], to: ['common']}
    ])
    as projection on my.Users;

    entity GastosNoDistribuibles @(restrict: [ 
        {grant: ['*'], to: ['admin']},
        {grant: ['READ'], to: ['common'], where: 'codestorg = $user.codestorg'}
    ])
    as projection on my.GastosNoDistribuibles;

    entity Ejercicio @(restrict: [ 
        {grant: ['*'], to: ['admin']},
        {grant: ['READ'], to: ['common']}
    ])
    as projection on my.GastosNoDistribuibles;
}