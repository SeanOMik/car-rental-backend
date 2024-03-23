export class User {
    uid: number;
    email: string;
    uty: UserType;

    constructor(uid: number, email: string, uty: UserType) {
        this.uid = uid;
        this.email = email;
        this.uty = uty;
    }
}

export enum UserType {
    Customer = 0,
    Vendor = 1,
}