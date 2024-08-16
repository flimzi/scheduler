import User from '../models/User.js'
import { sqlExists } from '../util/sql.js'
import DbObject, { IdModelTable, DbColumn } from './DbObject.js'

class Users extends IdModelTable {
    constructor() {
        super('users', () => User)
    }

    role = new DbColumn('role')
    created_at = new DbColumn('created_at')
    email = new DbColumn('email')
    password = new DbColumn('password')
    first_name = new DbColumn('first_name')
    last_name = new DbColumn('last_name')
    access_token = new DbColumn('access_token')
    verified = new DbColumn('verified')
    verification_token = new DbColumn('verification_token')

    minInfo() {
        return [ this.id, this.role, this.email, this.first_name, this.last_name ]
    }

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