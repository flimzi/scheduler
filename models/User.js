import Model from './Model.js'
import { fakerPL as faker } from '@faker-js/faker'
import { Genders } from '../util/definitions.js'
import accessTokens, { AccessToken } from '../schema/AccessTokens.js'
import users from '../schema/Users.js'
import { sqlInsert } from '../util/sql.js'

export default class User extends Model {
    constructor({ id, role, created_at, email, password, first_name, last_name, gender, birth_date, phone_number, verification_token, verified, height_cm, weight_kg }) {
        // convert createdat to js datetime
        super({ id, role, created_at, email, password, first_name, last_name, gender, birth_date, phone_number, verification_token, verified, height_cm, weight_kg })
    }

    static async authenticate(token) {
        const accessToken = await AccessToken.verify(token)
        const tokenHash = AccessToken.hash(token)

        if (!await accessTokens.get(accessToken.id, tokenHash))
            return

        const user = User.from(accessToken)
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
        await accessTokens.delete(this.id, this.tokenHash)
        delete this.tokenHash
    }

    async logoutAll() {
        await accessTokens.deleteForUser(this)
        delete this.tokenHash
    }

    async delete(transaction) {
        await users.delete(this, transaction)
    }

    full_name() {
        return `${this.first_name} ${this.last_name}`
    }

    fetch() {
        return users.get(this.id) 
    }
    
    getInfo() {
        const user = Object.clone(this)
        delete user.password
        delete user.verification_token
        delete user.verified
        delete user.tokenHash
        return user
    }

    async getUpdateModel() {
        const user = Object.clone(this)
        delete user.id
        delete user.created_at
        delete user.verified
        delete user.verification_token
        delete user.tokenHash

        return user
    }

    static fake() {
        return new User({
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            gender: Genders.random(),
            phone_number: faker.phone.number(),
            birth_date: faker.date.birthdate(),
            height_cm: faker.number.int(140, 210),
            weight_kg: faker.number.int(40, 200),
        })
    }
}