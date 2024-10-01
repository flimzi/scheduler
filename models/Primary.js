import { Roles } from '../interface/definitions.js'
import dbUsers from '../schema/Users.js'
import { ArgumentError } from '../util/errors.js'
import { isStrongPassword, isValidEmail } from '../util/helpers.js'
import { HttpStatus } from '../util/http.js'
import { User } from './users.js'

export default class Primary extends User {
    role = Roles.Primary

    async add(transaction) {
        const carer = await super.add(transaction)
        transaction.onCommit(_ => carer.sendVerificationEmail())

        return carer
    }

    // getInfo() {
    //     return super.getInfo()
    // }

    async getUpdateModel() {
        if (this.email !== undefined) {
            if (!isValidEmail(this.email))
                throw new ArgumentError(`${this.email} is not a valid email`)

            if (await dbUsers.emailExists(this.email))
                throw new ArgumentError(`user ${this.email} already exists`, HttpStatus.Conflict)
        }

        if (this.password !== undefined && !process.env.DEBUG && !isStrongPassword(this.password))
            throw new ArgumentError(`${this.password} is not a strong password`)

        return super.getUpdateModel()
    }

    async getInsertModel() {
        if (!this.email || !this.password)
            throw new ArgumentError()

        const model = await this.getUpdateModel()
        model.verified = !!process.env.DEBUG

        return model
    }

    async addParent(parent, relationshipType, transaction) {
        return
    }
}