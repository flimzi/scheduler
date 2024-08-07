import { sql, sqlFirst, sqlInsert } from '../sql/helpers.js'
import DbObject from './DbObject.js'
import { relationships, RelationshipTypes } from './Relationships.js'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import transporter from '../config/mail.js'
import { sanitizeLetters } from '../helpers.js'

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
    
    // things like this need a transaction fosho
    addPatient(carer, patient) {
        const patientId = sqlInsert(this, { ...patient, role: Roles.Patient }, true)
        patient.id = sqlInsert(relationships, { carer_id: carer.id, patient_id: patientId, type: RelationshipTypes.Owner }, true)
    
        return patient
    }

    // let Users have some logic as well for tradition sake
    get(id) {
        return sqlFirst`SELECT * FROM ${this} WHERE ${this.id} = ${id}`.asAsync(User)
    }

    getByEmail(email) {
        return sqlFirst`SELECT * FROM ${this} WHERE ${this.email} = ${email}`.asAsync(User)
    }

    async emailExists(email) {
        return await this.getByEmail(email) !== undefined
    }
}

const users = new Users()

export class Roles {
    static Carer = 1
    static Patient = 2
}

export class User {
    constructor({ id, role, created_at, email, password, first_name, last_name, gender, birth_date, phone_number, access_token, verification_token, verified }) {
        this.id = id
        this.role = role
        this.created_at = created_at // not sure about the type of this we are probably going to cast this in weird ways
        this.email = email
        this.first_name = first_name
        this.access_token = access_token // not sure if this maybe shouldnt be a getter
        this.verification_token = verification_token // not sure if this maybe shouldnt be a getter
        this.verified = verified
        this.password = password
        this.last_name = last_name
        this.gender = gender
        this.birth_date = birth_date
        this.phone_number = phone_number
    }

    async generateAccessToken() {
        const data = { id: this.id, email: this.email, role: this.role, first_name: this.first_name }
        const token = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '365d' })

        await sql`UPDATE TABLE ${users} SET ${users.access_token} = ${token} WHERE ${users.id} = ${this.id}`
        return this.access_token = token
    }

    // i guess we should somehow check if the address is invalid because rn every error from this is potentially a 500 so not a lot of information
    // this is also going to be a challenge because we need to at least set up a possibility of having resource strings for this
    // also i need 
    sendVerificationEmail() {
        if (this.verified)
            return

        const mailOptions = {
            to: this.email,
            subject: 'Verify your Zwardon account',
            html: `<p>Please verify your email by clicking on the following link: <a href="${process.env.WEBSITE}/verify?token=${this.verification_token}">Verify Email</a></p>`
        }

        return transporter.sendMail(mailOptions)
    }

    async verify(token) {
        if (token !== this.verification_token)
            return false

        await sql`UPDATE TABLE ${users} SET ${users.verified} = 1 WHERE ${users.id} = ${this.id}`
        return this.verified = true
    }

    logout() {
        delete this.access_token
        return sql`UPDATE TABLE ${users} SET ${users.access_token} = NULL WHERE ${users.id} = ${this.id}`
    }

    async registerCarer() {
        sanitizeLetters(this.first_name, this.last_name)
        delete this.id
        delete this.access_token
        // delete this.verified // probably going to use this
        this.role = Roles.Carer
        this.verification_token = crypto.randomBytes(20).toString('hex')
        this.password = await bcrypt.hash(this.password, 10)

        this.id = await sqlInsert(users, this, true)
        await this.sendVerificationEmail()

        return this.id
    }
}

export default users

// not sure about that yet but it could serve as an input validation layer and some sort of abstractions on top of that (setting req.user to this object for example)
// export class User {
//     constructor({ id, role, created_at,  })
// }