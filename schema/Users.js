import { sql, sqlExists, sqlFirst, sqlInsert } from '../sql/helpers.js'
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

    // things like this need a transaction fosho
    // addPatient(carer, patient) {
    //     const patientId = sqlInsert(this, { ...patient, role: Roles.Patient }, true)
    //     patient.id = sqlInsert(relationships, { carer_id: carer.id, patient_id: patientId, type: RelationshipTypes.Owner }, true)
    
    //     return patient
    // }

    get(id) {
        return sqlFirst`SELECT * FROM ${this} WHERE ${this.id} = ${id}`.asAsync(User)
    }

    getByEmail(email) {
        return sqlFirst`SELECT * FROM ${this} WHERE ${this.email} = ${email}`.asAsync(User)
    }

    getByVerificationToken(token) {
        return sqlFirst`SELECT * FROM ${this} WHERE ${this.verification_token} = ${token}`.asAsync(User)
    }

    async emailExists(email) {
        return await this.getByEmail(email) !== undefined
    }

    add(user) {
        delete user.id
        delete user.created_at
        return sqlInsert(this, user, true)
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
    }

    static async authenticate(token) {
        const accessToken = await AccessToken.verify(token)
        const tokenHash = AccessToken.hash(token)

        // this is honestly pretty bad because it runs for every authenticated request but there is no other way to check this as far as im concerned
        if (!await accessTokens.get(tokenHash))
            return

        // convertAsync introduces a possibility for runtime errors but a method from carer shouldnt be ran on a patient anyway and vice versa so its good
        // with the already relatively heavy access_tokens query above, a user fetch from the database seems not so unreasonable, but that should be reserved only
        // for requests that really require detailed user data, as most of them only need the information in the token
        const user = accessToken.convertAsync(this.conversion)
        user.tokenHash = tokenHash
        return user
    }

    async generateAccessToken() {
        const token = AccessToken.sign(this)
        await sqlInsert(accessTokens, { user_id: this.id, hash: AccessToken.hash(token) })
        return token
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
        await this.logoutAll()
        await users.delete(this)
    }

    getInfo() {
        const user = new User(this)
        delete user.password
        delete user.verification_token
        delete user.verified
        delete user.tokenHash
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