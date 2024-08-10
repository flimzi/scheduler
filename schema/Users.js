import { sql, sqlExists, sqlFirst, sqlInsert } from '../sql/helpers.js'
import DbObject from './DbObject.js'
import { relationships, RelationshipTypes } from './Relationships.js'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import transporter from '../config/mail.js'
import strings from '../resources/strings.en.js'

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

    getByVerificationToken(token) {
        return sqlFirst`SELECT * FROM ${this} WHERE ${this.verification_token} = ${token}`.asAsync(User)
    }

    async emailExists(email) {
        return await this.getByEmail(email) !== undefined
    }

    async verify(token) {
        if (!token)
            return false

        const user = this.getByVerificationToken(token)

        if (user === undefined)
            return false

        if (user.verified)
            return true

        await sql`UPDATE ${this} SET ${this.verified} = 1 WHERE ${this.verification_token} = ${token}`
        return true
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
    constructor({ id, role, created_at, email, password, first_name, last_name, gender, birth_date, phone_number, access_token, verification_token, verified }) {
        this.id = id
        this.role = role
        this.created_at = created_at // not sure about the type of this we are probably going to cast this in weird ways
        this.email = email
        this.first_name = first_name
        this.access_token = access_token // not sure if this maybe shouldnt be a getter
        this.verification_token = verification_token // not sure if this maybe shouldnt be a getter
        this.verified = verified || false
        this.password = password
        this.last_name = last_name
        this.gender = gender || Genders.Male
        this.birth_date = birth_date
        this.phone_number = phone_number
    }

    async generateAccessToken() {
        const data = { id: this.id, email: this.email, role: this.role, first_name: this.first_name }
        const token = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '365d' })

        await sql`UPDATE TABLE ${users} SET ${users.access_token} = ${token} WHERE ${users.id} = ${this.id}`
        return this.access_token = token
    }

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

    logout() {
        delete this.access_token
        return sql`UPDATE TABLE ${users} SET ${users.access_token} = NULL WHERE ${users.id} = ${this.id}`
    }

    async registerCarer() {
        this.first_name = this.first_name?.toLettersOnly()
        this.last_name = this.last_name?.toLettersOnly()
        delete this.id
        delete this.created_at
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