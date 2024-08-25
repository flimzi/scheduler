import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { Roles } from '../interface/definitions.js'
import users from '../schema/Users.js'
import { ArgumentError } from '../util/errors.js'
import { isStrongPassword, isValidEmail } from '../util/helpers.js'
import { HttpStatus } from '../util/http.js'
import { User } from './users.js'

export default class Carer extends User {
    static dbTable = users
    role = Roles.Carer

    async add(transaction) {
        const carer = await super.add(transaction)
        // this is kinda weird and i feel like it should be something that you do after logging in
        // and then maybe you could authorize based on verified state
        // cause like what if the email doesnt get delivered - then you would need to create a new account because
        // non verified and verified accounts are in the same table for simplicity
        transaction.onCommit(_ => this.sendVerificationEmail())

        return carer
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
            throw new ArgumentError(`user ${model.email} already exists`, HttpStatus.Conflict)

        model.first_name = model.first_name?.toLettersOnly().capitalFirst()
        model.last_name = model.last_name?.toLettersOnly().capitalFirst()
        model.verified = !!process.env.DEBUG
        model.role = Roles.Carer
        model.verification_token = crypto.randomBytes(20).toString('hex')
        model.password = await bcrypt.hash(model.password, 10)

        return model
    }

    // async addPatient(user, transaction) {
    //     const patient = await user.to(Patient).getUpdateModel()

    //     await sqlTransaction(async t => {
    //         patient.id = await users.add(patient, t)
    //         await relationships.add(this, patient, RelationshipTypes.Owner, t)
    //     }, transaction)

    //     return patient
    // }
}