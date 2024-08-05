import { sql } from '../sql/helpers.js'
import bcrypt from 'bcryptjs'
import DbObject from './DbObject.js'

// probably should operate on user objects but whatever
class Users extends DbObject {
    constructor() {
        super('users')
    }

    id = new DbObject('id')
    role = new DbObject('role')
    email = new DbObject('email')
    password = new DbObject('password')
    
    users_full = new DbObject('users_full')

    // async exist(email) {
    //     return (await sql`SELECT 1 FROM ${this} WHERE ${this.email} = ${email}`).recordset.length > 0
    // }

    async add(email, password, role) {
        return sql`INSERT INTO ${this} (${this.email}, ${this.password}, ${this.role}) VALUES (${email}, ${await bcrypt.hash(password, 10)}, ${role})`
    }

    async get(email, full) {
        return (await sql`SELECT * FROM ${full ? this.users_full : this} WHERE ${this.email} = ${email}`).recordset[0]
    }

    async exist(email) {
        return (await this.get(email)) !== undefined
    }

    getInfo(email) {
        return this.get(email, true)
    }
}

const users = new Users()
export default users