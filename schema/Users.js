import User from '../models/User.js'
import { sqlExists } from '../util/sql.js'
import { IdModelTable, Column } from './DbObject.js'

class Users extends IdModelTable {
    constructor() {
        super('users', () => User)
    }

    role = new Column('role')
    created_at = new Column('created_at')
    email = new Column('email')
    password = new Column('password')
    first_name = new Column('first_name')
    last_name = new Column('last_name')
    access_token = new Column('access_token')
    verified = new Column('verified')
    verification_token = new Column('verification_token')

    async getByEmail(email) {
        if (email === undefined)
            return undefined

        return this.sqlModel`SELECT * FROM ${this} WHERE ${this.email} = ${email}`
    }

    async getByVerificationToken(token) {
        if (token === undefined)
            return undefined

        return this.sqlModel`SELECT * FROM ${this} WHERE ${this.verification_token} = ${token}`
    }

    async emailExists(email) {
        return sqlExists`SELECT 1 FROM ${this} WHERE ${this.email} = ${email}`
    }
}

const users = new Users()
export default users