import { createRequest, sqlInsert } from "../util/sql.js";
import { DbColumn, DbTable } from "./DbObject.js";
import { RelationshipTypes } from "../interface/definitions.js";

class Relationships extends DbTable {
    constructor() {
        super('relationships')
    }

    id = new DbColumn('id')
    primary_id = new DbColumn('primary_id')
    secondary_id = new DbColumn('secondary_id')
    type = new DbColumn('type')

    async exists(primary, secondary, ...types) {
        const request = createRequest()
        request.parse`SELECT 1 FROM ${this}`
        request.parse`WHERE ${this.primary_id} = ${primary.id} AND ${this.secondary_id} = ${secondary.id}`

        if (types?.length)
            request.parse`AND ${this.type} IN (${types})`

        return request.any()
    }

    async add(primary, secondary, type = RelationshipTypes.Owner, transaction) {
        if (!await this.exists(primary, secondary))
            return sqlInsert(this, { primary_id: primary.id, secondary_id: secondary.id, type }, transaction)
    }
}

const relationships = new Relationships()
export default relationships