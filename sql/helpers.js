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

mssql.Request.prototype.insert = function(table, obj, identity) {
    const keys = Object.keys(obj)
    const values = keys.map(key => this.addParam(key, obj[key]))
    const query = `INSERT INTO ${table} (${keys.join()}) VALUES (${values.join()});`

    if (identity)
        return this.query(query + 'SELECT SCOPE_IDENTITY() AS id').then(r => r.recordset[0].id)

    return this.query(query)
}

export async function sql(strings, ...values) {
    let param = 0
    const request = (await poolPromise).request()

    const getParam = value => {
        if (value === undefined)
            return ''

        if (value instanceof DbObject)
            return value.name

        return request.addParam(param++, value)
    }

    const query = strings.reduce((result, string, i) => result + string + getParam(values[i]), ' ')
    return request.query(query)
}

export function sqlFirst(strings, ...values) {
    return sql(strings, ...values).then(r => r.recordset[0])
}

export async function sqlExists(strings, ...values) {
    return await sqlFirst(strings, ...values) !== undefined
}

export function sqlInsert(table, obj, identity) {
    return poolPromise.then(p => p.request().insert(table.name ?? table, obj, identity))
}