import DbObject, { DbTable, DbColumn } from "../schema/DbObject.js"
import sql, { SqlBuilder } from "./SqlBuilder.js"

export const first = recordset => recordset[0]
export const any = recordset => recordset.any()
export const get = column => recordset => first(recordset)?.[column]

export async function sqlInsert(dbTable, obj) {
    Object.deleteUndefinedProperties(obj)

    return sql`
        INSERT INTO ${dbTable}
        (${new DbObject(Object.keys(obj).join())})
        OUTPUT INSERTED.*
        VALUES (${Object.values(obj)})
    `(first)
}

export function sqlCopy(dbTable, toChange) {
    const temp = DbTable.temporary()
    const builder = getSelectBuilder(dbTable, null, null, temp)

    return (value, ...values) => {
        builder.query(value, ...values)

        return builder.query`
            ALTER TABLE ${temp} DROP COLUMN IF EXISTS ${DbColumn.id}
            UPDATE ${temp} SET ${toChange}
            INSERT INTO ${dbTable} OUTPUT INSERTED.*
            SELECT * FROM ${temp}
            DROP TABLE ${temp}
        `
    }
}

export function sqlDelete(dbTable) {
    return sql`DELETE FROM ${dbTable} OUTPUT DELETED.*`
}

export function sqlUpdate(dbTable, toChange) {
    Object.deleteUndefinedProperties(toChange)
    return sql`UPDATE ${dbTable} SET ${toChange} OUTPUT DELETED.*`
}

function getSelectBuilder(dbTable, dbColumns, limit, into) {
    const builder = new SqlBuilder().parse`SELECT`
    limit && builder.parse`TOP ${new DbObject(limit)}`
    builder.parse`${dbColumns ?? new DbObject('*')}`
    into && builder.parse`INTO ${into}`

    builder.parse`FROM ${dbTable}`
    return builder
}

export function sqlSelect(dbTable, dbColumns, limit) {
    const builder = getSelectBuilder(dbTable, dbColumns, limit)
    return builder.query.bind(builder)
}

export function sqlFirst(dbTable, dbColumns) {
    const builder = getSelectBuilder(dbTable, dbColumns, 1)
    builder.transformation = first

    return builder.query.bind(builder)
}

export function sqlCount(dbTable) {
    const builder = getSelectBuilder(dbTable, new DbColumn('COUNT(*)'))
    builder.transformation = get('')

    return builder.query.bind(builder)
}

export function sqlExists(dbTable) {
    const builder = getSelectBuilder(dbTable, new DbColumn('1'))
    builder.transformation = rs => !!get('')(rs)

    return builder.query.bind(builder)
}

export function sqlSelectId(dbTable, limit) {
    const builder = getSelectBuilder(dbTable, DbColumn.id, limit)
    builder.transformation = rs => rs.flatMap(r => r.id)

    return builder.query.bind(builder)
}