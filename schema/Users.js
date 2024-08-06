import { sql, sqlFirst } from '../sql/helpers.js'
import bcrypt from 'bcryptjs'
import DbObject from './DbObject.js'
import Roles from './Roles.js'

class Users extends DbObject {
    constructor() {
        super('users')
    }

    id = new DbObject('id')
    role = new DbObject('role')
    createdAt = new DbObject('created_at')

    userCredentials = new UserCredentials()
    userDetails = new UserDetails()
    usersFull = new DbObject('users_full')

    add(role) {
        return sqlFirst`INSERT INTO ${this} (${this.role}) VALUES (${role}); SELECT SCOPE_IDENTITY() AS id`.then(r => r.id)
    }

    get(id) {
        return sqlFirst`SELECT * FROM ${this.usersFull} WHERE ${this.id} = ${id}`
    }

    getByEmail(email) {
        return sqlFirst`SELECT * FROM ${this.usersFull} WHERE ${this.userCredentials.email} = ${email}`
    }

    async emailExists(email) {
        return await this.getByEmail(email) !== undefined
    }
}

class Carers extends Users {
    async add(email, password) {
        return this.userCredentials.add(await super.add(Roles.Carer), email, password)
    }
}

class Patients extends Users {

}

class UserCredentials extends DbObject {
    constructor() {
        super('user_credentials')
    }

    email = new DbObject('email')
    userId = new DbObject('user_id')
    password = new DbObject('password')

    async add(userId, email, password) {
        return sql`INSERT INTO ${this} (${this.userId}, ${this.email}, ${this.password}) VALUES (${userId}, ${email}, ${await bcrypt.hash(password, 10)})`
    }
}

class UserDetails extends DbObject {
    constructor() {
        super('user_details')
    }

    firstName = new DbObject('first_name')
    lastName = new DbObject('last_name')
}

export const users = new Users()
export const carers = new Carers()
export const patients = new Patients()