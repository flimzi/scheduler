import { createRequest, sql, sqlExists, sqlFirst, sqlInsert } from '../sql/helpers.js'
import DbObject from './DbObject.js'
import { relationships, RelationshipTypes } from './Relationships.js'
import { fakerPL as faker } from '@faker-js/faker'
import accessTokens, { AccessToken } from './AccessTokens.js'


class Users extends DbObject {
    constructor() {
        super('users')
    }

    id = new DbObject('id')
    role = new DbObject('role')
    created_at = new DbObject('created_at')
    email = new DbObject('email')
    password = new DbObject('password')
    first_name = new DbObject('first_name')
    last_name = new DbObject('last_name')
    access_token = new DbObject('access_token')
    verified = new DbObject('verified')
    verification_token = new DbObject('verification_token')

    get(id) {
        return sqlFirst`SELECT * FROM ${this} WHERE ${this.id} = ${id}`.as(User)
    }

    getByEmail(email) {
        return sqlFirst`SELECT * FROM ${this} WHERE ${this.email} = ${email}`.as(User)
    }

    getByVerificationToken(token) {
        return sqlFirst`SELECT * FROM ${this} WHERE ${this.verification_token} = ${token}`.as(User)
    }

    async emailExists(email) {
        return await this.getByEmail(email) !== undefined
    }

    add(user, transaction) {
        return sqlInsert(this, user, transaction)
    }

    update(user, transaction) {
        return createRequest(transaction).inputQuery(r => `
            UPDATE ${this} SET ${r.addUpdateList(user)}
            WHERE ${this.id} = ${user.id}
        `)
    }

    delete(user) {
        return sql`DELETE FROM ${this} WHERE ${this.id} = ${user.id}`
    }
}

const users = new Users()

export class Roles {
    static Carer = 1
    static Patient = 2
}

export class Genders {
    static Male = 0
    static Female = 0
}

export class User {
    constructor({ id, role, created_at, email, password, first_name, last_name, gender, birth_date, phone_number, verification_token, verified, height_cm, weight_kg }) {
        this.id = id
        this.role = role
        this.created_at = created_at // i need to cast this to javasript datetime
        this.email = email
        this.first_name = first_name
        this.verification_token = verification_token
        this.verified = verified || false
        this.password = password
        this.last_name = last_name
        this.gender = gender
        this.birth_date = birth_date
        this.phone_number = phone_number
        this.height_cm = height_cm
        this.weight_kg = weight_kg
        // this.deleteUndefinedProperties() // not sure where this should be or is it needed
    }

    static async authenticate(token) {
        const accessToken = await AccessToken.verify(token)
        const tokenHash = AccessToken.hash(token)

        // this is honestly pretty bad because it runs for every authenticated request but there is no other way to check this as far as im concerned
        if (!await accessTokens.get(accessToken.id, tokenHash))
            return

        const user = accessToken.convert(this.conversion)
        user.tokenHash = tokenHash
        return user
    }

    async generateAccessToken() {
        const accessToken = new AccessToken(this)
        const signed = accessToken.sign()
        await sqlInsert(accessTokens, { user_id: this.id, hash: AccessToken.hash(signed) })
        return signed
    }

    async logout() {
        await accessTokens.remove(this.tokenHash)
        delete this.tokenHash
    }

    async logoutAll() {
        await accessTokens.removeForUser(this)
        delete this.tokenHash
    }

    async delete() {
        // await this.logoutAll() // trigger does this
        await users.delete(this)
    }

    fetch() {
        return users.get(this.id) 
    }

    clone() {
        return new this.constructor(this)
    }

    getInfo() {
        const user = this.clone()
        delete user.password
        delete user.verification_token
        delete user.verified
        delete user.tokenHash
        return user
    }

    getUpdateModel() {
        const user = this.clone()
        delete user.id
        delete user.created_at

        return user
    }

    static fake() {
        return new User({
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            gender: Object.values(Genders).random(),
            phone_number: faker.phone.number(),
            birth_date: faker.date.birthdate(),
            height_cm: faker.number.int(140, 210),
            weight_kg: faker.number.int(40, 200),
        })
    }
}

export default users