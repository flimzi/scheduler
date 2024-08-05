export class DbObject {
    constructor(name) {
        this.name = name
    }
}

class Users extends DbObject {
    constructor() {
        super('users')
    }

    id = new DbObject('id')
    role = new DbObject('role')
    email = new DbObject('email')
    password = new DbObject('password')
}

export const users = new Users()