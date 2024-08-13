import mssql from 'mssql'
import { poolPromise } from '../config/db.js'
import DbObject from '../schema/DbObject.js'

mssql.Request.prototype.queryWithInfo = function(command) {
    return this.query(command.removeNewline()).catch(e => {
        e.command = command
        throw e
    })
}

mssql.Request.prototype.paramCount = 0

mssql.Request.prototype.addParam = function(value) {
    if (value === undefined)
        return ''

    if (value instanceof DbObject)
        return value.name

    const name = this.paramCount++
    this.input(name.toString(), value)
    return '@' + name
}

mssql.Request.prototype.addParams = function(values) {
    return values.map(this.addParam).join()
}

mssql.Request.prototype.addUpdateList = function(obj) {
    return Object.entries(obj).map(([col, val]) => `${col} = ${this.addParam(val)}`).join()
}

mssql.Request.prototype.inputQuery = function(query) {
    return this.queryWithInfo(query(this))
}

mssql.Request.prototype.first = function(query) {
    return this.inputQuery(query).then(r => r.recordset[0])
}

mssql.Request.prototype.exists = function(query) {
    return this.first(query).then(r => r !== undefined)
}

mssql.Request.prototype.insert = function(table, obj, identity) {
    const query = `INSERT INTO ${table.name ?? table} (${Object.keys(obj).join()}) VALUES (${this.addParams(Object.values(obj))});`

    if (identity)
        return this.queryWithInfo(query + 'SELECT SCOPE_IDENTITY() AS id').then(r => r.recordset[0].id)

    return this.queryWithInfo(query)
}

mssql.Request.prototype.sqlParse = function(strings, ...values) {
    return strings.reduce((result, string, i) => result + string + this.addParam(values[i]), ' ')
}

mssql.Request.prototype.sql = function(strings, ...values) {
    return this.queryWithInfo(this.sqlParse(strings, ...values))
}

mssql.Transaction.prototype.sql = function(strings, ...values) { return this.request().sql(strings, ...values) }
mssql.Transaction.prototype.insert = function (table, obj, identity) { return this.request().insert(table, obj, identity) }

export const createTransaction = async () => new mssql.Transaction(await poolPromise)
export const createRequest = async transaction => new mssql.Request(transaction ?? await poolPromise)

export async function sqlTransaction(operations) {
    const transaction = new mssql.Transaction(await poolPromise)
    await transaction.begin()

    await operations(transaction).catch(async e => {
        await transaction.rollback()
        throw e
    })

    await transaction.commit()
}

mssql.Request.prototype.sqlFirst = function(strings, ...values) {
    return this.sql(strings, ...values).then(r => r.recordset[0])
}

mssql.Request.prototype.sqlExists = async function(strings, ...values) {
    return await this.sqlFirst(strings, ...values) !== undefined
}

export async function sqlInsert(table, obj, transaction) {
    return (await createRequest(transaction)).insert(table, obj, true)
}

export const sql = async (strings, ...values) => new mssql.Request(await poolPromise).sql(strings, ...values)
export const sqlFirst = async (strings, ...values) => new mssql.Request(await poolPromise).sqlFirst(strings, ...values)
export const sqlExists = async (strings, ...values) => new mssql.Request(await poolPromise).sqlExists(strings, ...values)

// would be nice to make it so that you can use it like sqlUpdate(users, userUpdateModel, transaction)`WHERE ${users.id} = ${id}`
// pretty sure thats not possible but i can in condition use sqlParse but that is also not going to work because its not a method on Request
// export async function sqlUpdate(table, obj, transaction, condition) {}