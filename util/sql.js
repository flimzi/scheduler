import mssql from 'mssql'
import pool from '../config/db.js'
import DbObject, { DbFunction } from '../schema/DbObject.js'

export const createTransaction = () => new mssql.Transaction(pool)
export const createRequest = transaction => new mssql.Request(transaction ?? pool)

export async function sqlTransaction(operations, parentTransaction) {
    const transaction = parentTransaction ?? createTransaction()
    !parentTransaction && await transaction.begin()

    await operations(transaction).catch(async e => {
        await transaction.rollback()
        throw e
    })

    !parentTransaction && await transaction.commit()
}

mssql.Request.prototype.command = ''
mssql.Request.prototype.paramCount = 0

mssql.Request.prototype.run = async function(command = this.command) {
    return this.query(command.removeNewline()).catch(e => {
        e.command = command
        throw e
    })
}

mssql.Request.prototype.addParam = function(value) {
    if (value === undefined)
        return ''

    if (value === null)
        return 'NULL'

    if (value instanceof DbFunction)
        return `${value.name}(${this.addParams(value.values)})`

    if (value instanceof DbObject)
        return value.name

    if (Array.isArray(value))
        return this.addParams(value)

    // this could also check for mssql native types
    if (Object.isObject(value) && !Object.isDate(value))
        return this.addList(value)

    const name = this.paramCount++
    this.input(name.toString(), value)
    return '@' + name
}

mssql.Request.prototype.addParams = function(values) {
    return values.map(this.addParam.bind(this)).join()
}

mssql.Request.prototype.addList = function(obj, delimiter = ',') {
    return Object.entries(obj).map(([col, val]) => `${col} = ${this.addParam(val)}`).join(delimiter)
}

mssql.Request.prototype.parse = function(strings, ...values) {
    this.command += ' ' + strings.reduce((result, string, i) => result + string + this.addParam(values[i]), '')
    return this
}

mssql.Request.prototype.first = function() {
    return this.run().then(r => r.recordset[0])
}

mssql.Request.prototype.exists = function() {
    return this.first().then(r => r !== undefined)
}

mssql.Request.prototype.sql = function(strings, ...values) {
    return this.parse(strings, ...values).run().then(r => r?.recordset)
}

mssql.Request.prototype.sqlFirst = function(strings, ...values) {
    return this.sql(strings, ...values).then(r => r[0])
}

mssql.Request.prototype.sqlExists = async function(strings, ...values) {
    return await this.sqlFirst(strings, ...values) !== undefined
}

mssql.Request.prototype.sqlId = function(strings, ...values) {
    return this.sqlFirst(strings, ...values).then(r => r?.id)
}

mssql.Request.prototype.insert = function(table, obj) {
    Object.deleteUndefinedProperties(obj) // not really needed but...
    return this.sqlId`INSERT INTO ${table} (${new DbObject(Object.keys(obj).join())}) VALUES (${Object.values(obj)}); SELECT SCOPE_IDENTITY() AS id`
}

mssql.Request.prototype.update = function(table, obj) {
    Object.deleteUndefinedProperties(obj)
    this.parse`UPDATE ${table} SET ${obj}`

    return (strings, ...values) => {
        this.parse(strings, ...values)
        return this.run()
    }
}

mssql.Request.prototype.delete = function(table) {
    this.parse`DELETE FROM ${table}`

    return (strings, ...values) => {
        this.parse(strings, ...values)
        return this.run()
    }
}

mssql.Transaction.prototype.sql = function(strings, ...values) { return this.request().sql(strings, ...values) }
mssql.Transaction.prototype.insert = function (table, obj) { return this.request().insert(table, obj) }

export const sql = (strings, ...values) => createRequest().sql(strings, ...values)
export const sqlFirst = (strings, ...values) => createRequest().sqlFirst(strings, ...values)
export const sqlExists = (strings, ...values) => createRequest().sqlExists(strings, ...values)
export const sqlId = (strings, ...values) => createRequest().sqlId(strings, ...values)
export const sqlUsing = transaction => (strings, ...values) => createRequest(transaction).sql(strings, ...values)
export const sqlInsert = (table, obj, transaction) => createRequest(transaction).insert(table, obj)
export const sqlUpdate = (table, obj, transaction) => createRequest(transaction).update(table, obj)
export const sqlDelete = (table, transaction) => createRequest(transaction).delete(table)
export const sqlCast = type => (strings, ...values) => sqlFirst(strings, ...values).then(result => Object.cast(result, type))