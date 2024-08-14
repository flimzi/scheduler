import { relationships, RelationshipTypes } from './Relationships.js'
import users, { User, Roles } from './Users.js'

export default class Owned extends User {
    role = Roles.Owned

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