namespace sofos.users;

using {
    managed,
    cuid
} from '@sap/cds/common';

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