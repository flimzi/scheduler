import users from '../schema/Users.js'
import { Roles } from '../util/definitions.js'
import { User } from './users.js'

export default class Patient extends User {
    role = Roles.Patient

    async getUpdateModel() {
        const model = super.getUpdateModel()
        delete model.email
        delete model.password
        delete model.verification_token
        model.first_name = model.first_name?.toLettersOnly().capitalFirst()
        model.last_name = model.last_name?.toLettersOnly().capitalFirst()
        model.role = Roles.Patient
        model.verified = true

        return model
    }
}