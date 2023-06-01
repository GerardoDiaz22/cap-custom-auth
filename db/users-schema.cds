namespace sofos.users;

using {
    managed,
    cuid
} from '@sap/cds/common';

entity Users : cuid {
    username    : String;
    email       : String;
    password    : String;
    roles       : array of String;
    workstation : Integer;
}

entity RefreshTokens : cuid {
    token : String;
}

entity WorkstationApps : cuid {
    workstation : Integer;
    app         : Association to Apps;
}

entity Apps {
    key appKey   : Integer;
    name         : String;
    status       : Boolean;
    workstations : Association to many WorkstationApps on workstations.app = $self;
}