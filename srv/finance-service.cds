using {sofos.finance as my} from '../db/finance-schema';

@path: 'service/finance'
service FinanceService @(requires: 'authenticated-user') {

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
    ])
    as projection on my.Products;

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
    ])
    as projection on my.Sales;
}