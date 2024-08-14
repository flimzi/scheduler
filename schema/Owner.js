import users, { Roles, User } from './Users.js'
import transporter from '../config/mail.js'
import { sql, sqlDelete, sqlInsert, sqlTransaction, sqlUpdate, sqlUsing } from '../sql/helpers.js'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { relationships, RelationshipTypes } from './Relationships.js'
import { ArgumentError, isStrongPassword, isValidEmail } from '../helpers.js'

export default class Owner extends User {
    role = Roles.Carer

    sendVerificationEmail() {
        if (this.verified)
            return

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

        // await sql`UPDATE ${users} SET ${users.verified} = 1 WHERE ${users.verification_token} = ${token}`
        await sqlUpdate(users, { [users.verified.name]: 1 })`WHERE ${users.verification_token} = ${token}`
        return true
    }

    async register() {
        const model = await this.getUpdateModel()
        model.id = await users.add(model)
        await model.sendVerificationEmail()

        return model
    }

    async addOwned(owned) {
        await sqlTransaction(async t => {
            owned.id = await users.add(owned, t)
            await relationships.add(this.id, owned.id, RelationshipTypes.Owner, t)
        })

        return owned
    }

    getInfo() {
        return super.getInfo()
    }

    async getUpdateModel() {
        const model = super.getUpdateModel()

        if (!isValidEmail(model.email))
            throw new ArgumentError(`${model.email} is not a valid email`)
        
        if (!process.env.DEBUG && !isStrongPassword(model.password))
            throw new ArgumentError(`${model.password} is not a strong password`)

        if (await users.emailExists(model.email))
            throw new ArgumentError(`user ${model.email} already exists`)

        model.first_name = model.first_name?.toLettersOnly().capitalFirst()
        model.last_name = model.last_name?.toLettersOnly().capitalFirst()
        model.verified = !!process.env.DEBUG
        model.role = Roles.Carer
        model.verification_token = crypto.randomBytes(20).toString('hex')
        model.password = await bcrypt.hash(model.password, 10)

        return model
    }

    static fake() {
        return User.fake().as(Owner)
    }

    // both of those could probably go directly to user
    // same with addOwned
    deleteOwned(transaction) {
        return sqlUsing(transaction)`
            DELETE u FROM ${users} u
            JOIN ${relationships} r ON u.${users.id} = r.${relationships.patient_id}
            WHERE ${relationships.carer_id} = ${this.id} AND ${relationships.type} = ${RelationshipTypes.Owner}
        `
    }
 
    delete(transaction) {
        return sqlTransaction(async t => {
            await this.deleteOwned()
            await super.delete(t)
        }, transaction)
    }
}