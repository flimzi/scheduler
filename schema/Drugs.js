import { DbTable, DbColumn } from './DbObject.js'
import { createRequest } from '../util/sql.js'

class Drugs extends DbTable {
    constructor() {
        super('drugs')
    }

    id = new DbColumn('id')
    userId = new DbColumn('userId')
    category = new DbColumn('category')
    name = new DbColumn('name')
    info = new DbColumn('info')
    unit = new DbColumn('unit')

    async find(userId, name, lastId, categories) {
        const request = createRequest()
        request.parse`SELECT ${[this.id, this.category, this.name, this.unit]} FROM ${this}`
        request.parse`WHERE ${this.userId} = ${userId}`

        if (name)
            request.parse`AND ${this.name} LIKE N'%${name}%'`

        if (lastId)
            request.parse`AND ${lastId} < ${this.id}`

        if (categories?.length)
            request.parse`AND ${this.category} IN (${categories})`

        return request.sql`ORDER BY ${this.id}`
    }
}

const dbDrugs = new Drugs()
export default dbDrugs