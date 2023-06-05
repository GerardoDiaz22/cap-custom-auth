using {sofos.users as my} from '../db/users-schema';

@path: 'service/users'
service UsersService @(requires: 'authenticated-user'){

    entity Users @(restrict: [
        {
            grant: ['*'],
            to   : ['admin']
        }
    ]) as projection on my.Users excluding { password };

    entity RefreshTokens @(restrict: [
        {
            grant: ['*'],
            to   : ['admin']
        }
    ]) as projection on my.RefreshTokens;

    entity Apps @(restrict: [
        {
            grant: ['*'],
            to   : ['admin']
        }
    ]) as projection on my.Apps ;

    entity WorkstationApps @(restrict: [
        {
            grant: ['*'],
            to   : ['admin']
        }
    ]) as projection on my.WorkstationApps;

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
        apps       : array of String;
    }
}