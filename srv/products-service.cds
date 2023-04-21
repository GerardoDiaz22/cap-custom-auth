using { sap.jwt.products as my } from '../db/schema';

@path: 'service/products'
service ProductsService{
    entity Products
        as projection on my.Products;
}