import users, { Roles, User } from './Users.js'
import transporter from '../config/mail.js'
import { sql, sqlInsert } from '../sql/helpers.js'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { relationships, RelationshipTypes } from './Relationships.js'

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
        this.first_name = this.first_name?.toLettersOnly()
        this.last_name = this.last_name?.toLettersOnly()
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
        patient.role = Roles.Patient
        patient.verified = true
        // this NEEDS to be in a transaction because we do not know about the actual state of this object so we cannot even assume that the id is correct
        // and checking all of that all of the time is out of the question (assign transaction to req so that the error middleware can roll it back)
        patient.id = await users.add(patient)
        await relationships.add(this.id, patient.id, RelationshipTypes.Owner)

        return patient
    }

    getInfo() {
        return super.getInfo()
    }

    static fake() {
        return User.fake().as(Carer)
    }
}