import { relationships, RelationshipTypes } from './Relationships.js'
import users, { User, Roles } from './Users.js'

export default class Patient extends User {
    role = Roles.Patient

    static get(id) {
        return users.get(id)?.as(Patient)
    }

    async addCarer(carer) {
        await relationships.add(carer.id, this.id, RelationshipTypes.Carer)
    }
}