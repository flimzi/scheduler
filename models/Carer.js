import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import transporter from '../config/mail.js'
import relationships from '../schema/Relationships.js'
import users from '../schema/Users.js'
import { RelationshipTypes, Roles } from '../util/definitions.js'
import { isStrongPassword, isValidEmail } from '../util/helpers.js'
import { sqlTransaction, sqlUpdate } from '../util/sql.js'
import { Patient, User } from './users.js'
import { Http } from '../util/http.js'
import { ArgumentError } from '../util/errors.js'

export default class Carer extends User {
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

        await sqlUpdate(users, { [users.verified.name]: 1 })`WHERE ${users.verification_token} = ${token}`
        return true
    }

    async register() {
        const carer = await this.getUpdateModel()
        carer.id = await users.add(carer)
        await carer.sendVerificationEmail()

        return carer
    }

    static async login({ email, password }) {
        if (!email || !password)
            return undefined

        const user = await users.getByEmail(email)

        if (!user?.verified || !await bcrypt.compare(password, user.password))
            return undefined
    
        return user.generateAccessToken()
    }

    getInfo() {
        return super.getInfo()
    }

    async getUpdateModel() {
        const model = await super.getUpdateModel()

        // ideally this would be a result object so 
        if (!isValidEmail(model.email))
            throw new ArgumentError(`${model.email} is not a valid email`)
        
        if (!process.env.DEBUG && !isStrongPassword(model.password))
            throw new ArgumentError(`${model.password} is not a strong password`)

        if (await users.emailExists(model.email))
            throw new ArgumentError(`user ${model.email} already exists`, Http.Status.Conflict)

        model.first_name = model.first_name?.toLettersOnly().capitalFirst()
        model.last_name = model.last_name?.toLettersOnly().capitalFirst()
        model.verified = !!process.env.DEBUG
        model.role = Roles.Carer
        model.verification_token = crypto.randomBytes(20).toString('hex')
        model.password = await bcrypt.hash(model.password, 10)

        return model
    }

    async addPatient(user, transaction) {
        const patient = await user.cast(Patient).getUpdateModel()

        await sqlTransaction(async t => {
            patient.id = await users.add(patient, t)
            await relationships.add(this, patient, RelationshipTypes.Owner, t)
        }, transaction)

        return patient
    }
}