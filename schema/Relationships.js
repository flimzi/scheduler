import { createRequest, sqlExists, sqlFirst, sqlInsert } from "../sql/helpers.js";
import DbObject from "./DbObject.js";

class Relationships extends DbObject {
    constructor() {
        super('relationships')
    }

    id = new DbObject('id')
    carer_id = new DbObject('carer_id')
    patient_id = new DbObject('patient_id')
    type = new DbObject('type')

    // hinges on the assumption that the default relationship is carer but i think thats fine
    exists(carer_id, patient_id, ...types) {
        const request = createRequest()
        request.parse`SELECT 1 FROM ${this}`
        request.parse`WHERE ${this.carer_id} = ${carer_id} AND ${this.patient_id} = ${patient_id}`

        if (types?.length)
            request.parse`AND ${this.type} IN [${types}]`

        return request.exists()
    }

    async add(carer_id, patient_id, type = RelationshipTypes.Owner, transaction) {
        if (!await this.exists(carer_id, patient_id))
            return sqlInsert(this, { carer_id, patient_id, type }, transaction)
    }

    // not sure yet how to do this
    // getUsers(carer_id, patient_id, ...types) {
    //     return sql`
    //         SELECT u.* FROM ${this} r
    //         JOIN ${users} u ON r.${this.carer_id} = u.${users.id}
    //         WHERE r.${this.patient_id} = ${id}
    //         AND r.${this.type} = ${RelationshipTypes.Owner}
    //     `.then(User.from)

    //     const request = createRequest()

    //     .parse`SELECT u.* FROM ${this} r`
    //     .parse`JOIN ${users} u ON r.${this.carer_id} = u.${users.id}`
    //     .parse`WHERE r.${this.patient_id} = ${id}`
    // }

    // getOwnedBy({ id }) {

    // }
}

export const relationships = new Relationships()

export class RelationshipTypes {
    static Carer = 0
    static Owner = 1
}