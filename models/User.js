import { fakerPL as faker } from '@faker-js/faker'
import accessTokens, { AccessToken } from '../schema/AccessTokens.js'
import { getEvents, getPrimaries, getSecondaries } from '../schema/functions.js'
import users from '../schema/Users.js'
import { Genders } from '../interface/definitions.js'
import { sql, sqlInsert } from '../util/sql.js'
import Model from './Model.js'
import FCMessaging from '../firebase/FCMessaging.js'
import relationships from '../schema/Relationships.js'
import transporter from '../config/mail.js'
import strings from '../resources/strings.en.js'

export default class User extends Model {
    constructor({ id, role, created_at, email, password, first_name, last_name, gender, birth_date, phone_number, verification_token, verified, height_cm, weight_kg, fcm_token }) {
        // todo convert createdat to js datetime
        super({ id, role, created_at, email, password, first_name, last_name, gender, birth_date, phone_number, verification_token, verified, height_cm, weight_kg, fcm_token })
    }

    getTable() { return users }

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

    static async login({ email, password }) {
        if (!email || !password)
            return undefined

        const user = await users.getByEmail(email)

        if (!user?.verified || !await bcrypt.compare(password, user.password))
            return undefined
    
        return user.generateAccessToken()
    }

    async logout() {
        await accessTokens.delete(this.id, this.tokenHash)
        delete this.tokenHash
    }

    async logoutAll() {
        await accessTokens.deleteForUser(this)
        delete this.tokenHash
    }

    sendVerificationEmail() {
        // if (this.verified)
        //     return

        const mailOptions = {
            to: this.email,
            subject: strings.verificationSubject,
            html: strings.verificationHtmlBody.format(process.env.WEBSITE, this.verification_token)
        }

        return transporter.sendMail(mailOptions)
    }

    static async verify(token) {
        if (!token)
            return false

        const user = users.getByVerificationToken(token)

        if (user === undefined)
            return false

        if (user.verified)
            return true

        await sqlUpdate(users, { [users.verified.name]: 1 })`WHERE ${users.verification_token} = ${token}`
        return true
    }

    full_name() {
        return `${this.first_name} ${this.last_name}`
    }
    
    getInfo() {
        const user = this.clone()
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

    async getReceivedEvents({ giverId, type, status }) {
        return sql`SELECT * FROM ${getEvents({ receiverId: this.id, giverId, type, status})}`
    }

    async getGivenEvents({ receiverId, type, status }) {
        return sql`SELECT * FROM ${getEvents({ giverId: this.id, receiverId, type, status })}`
    }

    // async updateMessageToken(token) {
    //     return users.updateId(this, { [users.fcm_token.name]: token })
    // }

    async sendFCM(data) {
        return FCMessaging.message({ data })
    }

    async relateToPrimary(primary, relationshipType, transaction) {
        return relationships.add(primary, this, relationshipType, transaction)
    }

    async relateToSecondary(secondary, relationshipType, transaction) {
        return relationships.add(this, secondary, relationshipType, transaction)
    }
}