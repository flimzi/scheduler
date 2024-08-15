import { createRequest, sqlInsert } from "../sql/helpers.js";
import DbObject from "./DbObject.js";

class Relationships extends DbObject {
    constructor() {
        super('relationships')
    }

    id = new DbObject('id')
    primary_id = new DbObject('primary_id')
    secondary_id = new DbObject('secondary_id')
    type = new DbObject('type')

    exists(primary, secondary, ...types) {
        const request = createRequest()
        request.parse`SELECT 1 FROM ${this}`
        request.parse`WHERE ${this.primary_id} = ${primary.id} AND ${this.secondary_id} = ${secondary.id}`

        if (types?.length)
            request.parse`AND ${this.type} IN [${types}]`

        return request.exists()
    }

    async add(primary, secondary, type = RelationshipTypes.Owner, transaction) {
        if (!await this.exists(primary, secondary))
            return sqlInsert(this, { primary_id: primary.id, secondary_id: secondary.id, type }, transaction)
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