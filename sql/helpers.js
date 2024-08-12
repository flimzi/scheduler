import mssql from 'mssql'
import { poolPromise } from '../config/db.js'
import DbObject from '../schema/DbObject.js'

mssql.Request.prototype.addParam = function(name, value) {
    this.input(name.toString(), value)
    return '@' + name
}

mssql.Request.prototype.inputQuery = function(query) {
    return this.query(query(this))
}

mssql.Request.prototype.sqlInsert = function(table, obj, identity) {
    const keys = Object.keys(obj)
    const values = keys.map(key => this.addParam(key, obj[key]))
    const query = `INSERT INTO ${table.name ?? table} (${keys.join()}) VALUES (${values.join()});`

    if (identity)
        return this.query(query + 'SELECT SCOPE_IDENTITY() AS id').then(r => r.recordset[0].id)

    return this.query(query)
}

mssql.Request.prototype.sql = function(strings, ...values) {
    let param = 0

    const getParam = value => {
        if (value === undefined)
            return ''

        if (value instanceof DbObject)
            return value.name

        return this.addParam(param++, value)
    }

    const query = strings.reduce((result, string, i) => result + string + getParam(values[i]), ' ')
    return this.query(query)
}

mssql.Request.prototype.sqlFirst = function(strings, ...values) {
    return this.sql(strings, ...values).then(r => r.recordset[0])
}

mssql.Request.prototype.sqlExists = async function(strings, ...values) {
    return await this.sqlFirst(strings, ...values) !== undefined
}

// i might need to abstract some methods on DbObject so that you could for example call users.add inside a transaction
// which could then be used to create the request instead of the pool
// but these methods would likely need to be altered as well to allow passing pool or transaction

// also this is wrong because you need a new request object for every request it seems
export async function sqlTransaction(operations) {
    const transaction = new mssql.Transaction(await poolPromise)

    try {
        await transaction.begin()
        await operations(transaction.request())
        await transaction.commit()
    } catch (e) {
        await transaction.rollback()
        throw e
    }
}

export const sql = async (strings, ...values) => new mssql.Request(await poolPromise).sql(strings, ...values)
export const sqlFirst = async (strings, ...values) => new mssql.Request(await poolPromise).sqlFirst(strings, ...values)
export const sqlExists = async (strings, ...values) => new mssql.Request(await poolPromise).sqlExists(strings, ...values)
export const sqlInsert = async (table, obj, identity) => new mssql.Request(await poolPromise).sqlInsert(table, obj, identity)