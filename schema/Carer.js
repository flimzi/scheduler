import users, { Roles, User } from './Users.js'
import transporter from '../config/mail.js'
import { sql, sqlInsert, sqlTransaction } from '../sql/helpers.js'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { relationships, RelationshipTypes } from './Relationships.js'
import { ArgumentError, isStrongPassword, isValidEmail } from '../helpers.js'

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

        await sql`UPDATE ${users} SET ${users.verified} = 1 WHERE ${users.verification_token} = ${token}`
        return true
    }

    async register() {
        this.first_name = this.first_name?.toLettersOnly().capitalFirst()
        this.last_name = this.last_name?.toLettersOnly().capitalFirst()
        this.verified = !!process.env.DEBUG
        this.role = Roles.Carer
        this.verification_token = crypto.randomBytes(20).toString('hex')
        this.password = await bcrypt.hash(this.password, 10)

        this.id = await users.add(this)
        await this.sendVerificationEmail()

        return this.id
    }

    async addPatient(patient) {
        delete patient.email
        delete patient.password
        delete patient.verification_token
        patient.first_name = patient.first_name?.toLettersOnly().capitalFirst()
        patient.last_name = patient.last_name?.toLettersOnly().capitalFirst()
        patient.role = Roles.Patient
        patient.verified = true

        await sqlTransaction(async t => {
            patient.id = await users.add(patient, t)
            await relationships.add(this.id, patient.id, RelationshipTypes.Owner, t)
        })

        return patient
    }

    getInfo() {
        return super.getInfo()
    }

    getUpdateModel() {
        const model = super.getUpdateModel()

        if (!isValidEmail(model.email) || users.emailExists(model.email))
            throw new ArgumentError('wrong email for carer')
    
        if (!isStrongPassword(model.password))
            throw new ArgumentError('wrong password for carer')

        

        return model
    }

    static fake() {
        return User.fake().as(Carer)
    }
}