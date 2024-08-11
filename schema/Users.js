import { sql, sqlExists, sqlFirst, sqlInsert } from '../sql/helpers.js'
import DbObject from './DbObject.js'
import { relationships, RelationshipTypes } from './Relationships.js'
import accessTokens, { AccessToken } from './AccessTokens.js'
import Carer from './Carer.js'
import Patient from './Patient.js'
export { Carer, Patient }

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
    // addPatient(carer, patient) {
    //     const patientId = sqlInsert(this, { ...patient, role: Roles.Patient }, true)
    //     patient.id = sqlInsert(relationships, { carer_id: carer.id, patient_id: patientId, type: RelationshipTypes.Owner }, true)
    
    //     return patient
    // }

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
    constructor({ id, role, created_at, email, password, first_name, last_name, gender, birth_date, phone_number, verification_token, verified }) {
        this.id = id
        this.role = role
        this.created_at = created_at // i need to cast this to javasript datetime
        this.email = email
        this.first_name = first_name
        this.verification_token = verification_token
        this.verified = verified || false
        this.password = password
        this.last_name = last_name
        this.gender = gender
        this.birth_date = birth_date
        this.phone_number = phone_number
    }

    static conversion({ role }) {
        return {
            [Roles.Carer]: Carer,
            [Roles.Patient]: Patient
        }[role] ?? User
    }

    static async authenticate(token) {
        const accessToken = await AccessToken.verify(token)
        const tokenHash = AccessToken.hash(token)

        if (!await sqlExists`SELECT 1 FROM ${accessTokens} WHERE ${accessTokens.hash} = ${tokenHash}`)
            return

        const user = accessToken.convertAsync(this.conversion)
        user.tokenHash = tokenHash
        return user
    }

    async generateAccessToken() {
        const token = AccessToken.sign(this)
        await sqlInsert(accessTokens, { user_id: this.id, hash: AccessToken.hash(token) })
        return token
    }

    logout() {
        return sql`DELETE FROM ${accessTokens} WHERE ${accessTokens.hash} = ${this.tokenHash}`
    }

    logoutAll() {
        return sql`DELETE FROM ${accessTokens} WHERE ${accessTokens.user_id} = ${this.id}`
    }
}

export default users