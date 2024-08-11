import users, { User } from './Users.js'
import transporter from '../config/mail.js'
import { sql } from '../sql/helpers.js'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

export default class Carer extends User {
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
        delete this.id
        delete this.created_at
        this.first_name = this.first_name?.toLettersOnly()
        this.last_name = this.last_name?.toLettersOnly()
        this.verified = !!process.env.DEBUG
        this.role = Roles.Carer
        this.verification_token = crypto.randomBytes(20).toString('hex')
        this.password = await bcrypt.hash(this.password, 10)

        this.id = await sqlInsert(users, this, true)
        await this.sendVerificationEmail()

        return this.id
    }
}