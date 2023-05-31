using {sofos.users as my} from '../db/users-schema';

@path: 'service/users'
service UsersService @(requires: 'authenticated-user'){

    entity Apps as projection on my.Apps;

    entity WorkstationApps as projection on my.WorkstationApps;

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