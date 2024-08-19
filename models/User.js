import { fakerPL as faker } from '@faker-js/faker'
import accessTokens, { AccessToken } from '../schema/AccessTokens.js'
import { getEvents, getPrimaries, getSecondaries } from '../schema/functions.js'
import users from '../schema/Users.js'
import { Genders } from '../util/definitions.js'
import { sql, sqlInsert } from '../util/sql.js'
import Model from './Model.js'

export default class User extends Model {
    constructor({ id, role, created_at, email, password, first_name, last_name, gender, birth_date, phone_number, verification_token, verified, height_cm, weight_kg, fcm_token }) {
        // convert createdat to js datetime
        super({ id, role, created_at, email, password, first_name, last_name, gender, birth_date, phone_number, verification_token, verified, height_cm, weight_kg, fcm_token })
    }

    static async authenticate(token) {
        const accessToken = await AccessToken.verify(token)
        
        if (!accessToken)
            return

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

    // this as well as delete update could be handled by a optional parameter in model
    async fetch() {
        return users.getId(this.id) // this could also be new this.constructor() but its irrelevant i think
    }

    async delete(transaction) {
        await users.deleteId(this, transaction)
    }

    full_name() {
        return `${this.first_name} ${this.last_name}`
    }
    
    getInfo() {
        const user = Object.clone(this)
        delete user.password
        delete user.verification_token
        delete user.verified
        delete user.tokenHash
        delete user.fcm_token
        return user
    }

    async getUpdateModel() {
        const user = Object.clone(this)
        delete user.id
        delete user.created_at
        delete user.verified
        delete user.verification_token
        delete user.tokenHash
        delete user.fcm_token

        return user
    }

    static fake() {
        const gender = Genders.random()
        const sexType = gender === Genders.Female ? 'female' : 'male'

        return new this.prototype.constructor({
            gender,
            first_name: faker.person.firstName(sexType),
            last_name: faker.person.lastName(sexType),
            email: faker.internet.email(),
            password: faker.internet.password(),
            phone_number: faker.phone.number(),
            birth_date: faker.date.birthdate(),
            height_cm: faker.number.int(140, 210),
            weight_kg: faker.number.int(40, 200),
        })
    }

    async getPrimaries(...relationshipTypes) {
        return sql`SELECT ${users.minInfo()} FROM ${getPrimaries(this.id, relationshipTypes)}`
    }

    async getSecondaries(...relationshipTypes) {
        return sql`SELECT ${users.minInfo()} FROM ${getSecondaries(this.id, relationshipTypes)}`
    }

    async getReceivedEvents({ giverId, eventType, status }) {
        return sql`SELECT * FROM ${getEvents({ receiverId: this.id, giverId, eventType, status})}`
    }

    async getGivenEvents({ receiverId, eventType, status }) {
        return sql`SELECT * FROM ${getEvents({ giverId: this.id, receiverId, eventType, status })}`
    }

    async updateFcmToken(token) {
        return users.updateId(this, { [users.fcm_token.name]: token })
    }
}