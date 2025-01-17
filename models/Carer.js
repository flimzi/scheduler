import { Roles } from '../interface/definitions.js'
import users from '../schema/Users.js'
import { ArgumentError } from '../util/errors.js'
import { isStrongPassword, isValidEmail } from '../util/helpers.js'
import { HttpStatus } from '../util/http.js'
import { User } from './users.js'

export default class Carer extends User {
    role = Roles.Carer

    async add(transaction) {
        const carer = await super.add(transaction)
        transaction.onCommit(_ => carer.sendVerificationEmail())

        return carer
    }

    getInfo() {
        return super.getInfo()
    }

    async getUpdateModel() {
        // throwing isnt ideal but it really streamlines the workflow in this case
        if (!isValidEmail(this.email))
            throw new ArgumentError(`${this.email} is not a valid email`)
        
        if (!process.env.DEBUG && !isStrongPassword(model.password))
            throw new ArgumentError(`${this.password} is not a strong password`)

        if (await users.emailExists(this.email))
            throw new ArgumentError(`user ${this.email} already exists`, HttpStatus.Conflict)

        const model = await super.getUpdateModel()
        model.first_name = model.first_name?.toLettersOnly().capitalFirst()
        model.last_name = model.last_name?.toLettersOnly().capitalFirst()
        model.verified = !!process.env.DEBUG
        model.role = Roles.Carer

        return model
    }

    async relateToPrimary(primary, relationshipType, transaction) {
        return
    }
}