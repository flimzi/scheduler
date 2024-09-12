import { EventEmitter } from 'events'
import mssql from 'mssql'
import pool from '../config/db.js'
import DbObject, { DbColumn, DbFunction, DbTable } from '../schema/DbObject.js'
const debug = !!process.env.DEBUG

let transactionId = 0

export function createTransaction(parentTransaction) {
    const transaction = new mssql.Transaction(pool)
    transaction.transactionId = transactionId++
    transaction.parentTransaction = parentTransaction
    transaction.operations = []

    return transaction
}

export function createRequest(transaction) {
    const request = new mssql.Request(transaction ?? pool)
    transaction && (request.transaction = transaction)

    return request
} 

mssql.Transaction.prototype.operations = []
mssql.Transaction.prototype.completionEvents = new EventEmitter()
mssql.Transaction.prototype.completionEvents.setMaxListeners(50)
mssql.Transaction.prototype.onCommit = function(listener) { this.completionEvents.once('commit', listener) }
mssql.Transaction.prototype.onRollback = function(listener) { this.completionEvents.once('rollback', listener) }

mssql.Transaction.prototype.fail = async function() {
    await this.rollback()
    this.failed = this.completed = true
    this.completionEvents.emit('rollback')
}

mssql.Transaction.prototype.complete = async function() {
    await this.commit()
    this.completed = true
    this.completionEvents.emit('commit')
}

export async function sqlTransaction(operations, parentTransaction) {
    const transaction = parentTransaction ?? createTransaction()
    
    if (!parentTransaction) {
        await transaction.begin()
        transaction.began = true
    }

    transaction.result = await operations(transaction).catch(async e => {
        await transaction.fail()
        throw e
    })

    if (!parentTransaction && !transaction.completed)
        await transaction.complete()

    return transaction
}

export const sqlTransactionResult = (operations, parentTransaction) => sqlTransaction(operations, parentTransaction).then(t => t.result)

mssql.Request.prototype.command = ''
mssql.Request.prototype.paramCount = 0

mssql.Request.prototype.getFullCommand = function() {
    return this.command.replace(/@(\d+)/g, (match, p1) => {
        const parameter = this.parameters[p1]
        
        if (!parameter)
            return match
    
        if (parameter.type === mssql.DateTime)
            return `'${parameter.value.toISOString()}'`

        if (parameter.type === mssql.NVarChar)
            return `'${parameter.value}'`

        return parameter.value
    })
}

mssql.Request.prototype.logResult = function(result) {
    console.log('----- SQL -----')
    this.transaction && console.log('Transaction ' + this.transaction.transactionId, this.transaction)
    console.log(this.getFullCommand())
    console.log(result)
}

mssql.Request.prototype.logError = function(error) {
    console.error(e)
    this.transaction && console.log('Transaction ' + this.transaction.transactionId, this.transaction)
    console.error('query: ' + this.getFullCommand())
}

mssql.Request.prototype.run = async function(command = this.command, firstRecordset = true) {
    const fullCommand = this.getFullCommand()
    let result

    try {
        const { recordsets } = await this.query(command.removeNewline())
        result = firstRecordset ? recordsets[0] : recordsets
    } catch (e) {
        this.logError(e)
        throw e
    }

    debug && this.logResult(result)
    return result
}

mssql.Request.prototype.any = function() {
    return this.run().then(r => r.length)
}

mssql.Request.prototype.first = function() {
    return this.run().then(r => r[0])
}

mssql.Request.prototype.addParam = function(value) {
    if (value === undefined)
        return ''

    if (value === null)
        return 'NULL'

    if (value instanceof DbFunction)
        return `${value.dbName}(${this.addParams(value.values)})` + value.getAlias()

    if (value instanceof DbObject)
        return value.dbName + value.getAlias()

    if (Array.isArray(value))
        return this.addParams(value)

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

mssql.Request.prototype.semicolon = function() {
    this.command += ';'
    return this
}

mssql.Request.prototype.parse = function(strings, ...values) {
    this.command += ' ' + strings.reduce((result, string, i) => result + string + this.addParam(values[i]), '')
    return this
}

mssql.Request.prototype.sql = function(strings, ...values) {
    if (strings !== undefined)
        this.parse(strings, ...values)

    return this.run()
}

mssql.Request.prototype.insert = function(dbTable, obj) {
    Object.deleteUndefinedProperties(obj)

    this.parse`
        INSERT INTO ${dbTable}
        (${new DbObject(Object.keys(obj).join())})
        OUTPUT INSERTED.*
        VALUES (${Object.values(obj)})
    `

    return this.first()
}

// this can also be done like
// SELECT (dbTable.getColumns (except id)) with toChange substituted AS columnName
mssql.Request.prototype.copy = function(dbTable, toChange) {
    const temp = DbTable.temporary()
    this.parse`SELECT * INTO ${temp} FROM ${dbTable}`

    return (strings, ...values) => {
        this.parse(strings, ...values)
        this.parse`ALTER TABLE ${temp} DROP COLUMN IF EXISTS ${DbColumn.id}`
        this.parse`UPDATE ${temp} SET ${toChange}`
        this.parse`INSERT INTO ${dbTable} OUTPUT INSERTED.*`
        this.parse`SELECT * FROM ${temp}`
        this.parse`DROP TABLE ${temp}`
        return this.run()
    }
}

// because of this error there cannot be any triggers in the database so they need to be written as a function and
// ran either in dbtable (preferred but adds complexity) or directly in dbtable children
// https://stackoverflow.com/questions/13198476/cannot-use-update-with-output-clause-when-a-trigger-is-on-the-table
mssql.Request.prototype.update = function(dbTable, obj) {
    Object.deleteUndefinedProperties(obj)
    this.parse`UPDATE ${dbTable} SET ${obj}`
    this.parse`OUTPUT DELETED.*`

    return this.sql.bind(this)
}

mssql.Request.prototype.delete = function(table) {
    this.parse`DELETE FROM ${table}`
    this.parse`OUTPUT DELETED.*`
    
    return this.sql.bind(this)
}

mssql.Request.prototype.select = function(dbTable, dbColumns, limit) {
    this.parse`SELECT`
    limit > 0 && this.parse`TOP ${new DbObject(limit)}`

    const columns = dbColumns?.length ? dbColumns : new DbObject('*')
    this.parse`${columns} FROM ${dbTable}`

    return this.sql.bind(this)
}

mssql.Request.prototype.selectFirst = function(dbTable, dbColumns) {
    return (strings, ...values) =>
        this.select(dbTable, dbColumns, 1)(strings, ...values)
            .then(rs => rs[0])
}

mssql.Request.prototype.exists = function(dbTable) {
    return (strings, ...values) =>
        this.selectFirst(dbTable, [new DbObject(1)])(strings, ...values)
            .then(r => !!r?.[''])
}

mssql.Request.prototype.count = function(dbTable) {
    return (strings, ...values) => 
        this.selectFirst(dbTable, [new DbObject('COUNT(*)')])(strings, ...values)
            .then(r => r?.[''])
}

mssql.Request.prototype.selectIds = function(dbTable, limit) {
    return (strings, ...values) =>
        this.select(dbTable, [DbColumn.id], limit)(strings, ...values)
            .then(rs => rs.flatMap(r => r.id))
}

mssql.Transaction.prototype.sql = function(strings, ...values) { return this.request().sql(strings, ...values) }
mssql.Transaction.prototype.insert = function (table, obj) { return this.request().insert(table, obj) }

export const sql = (strings, ...values) => createRequest().sql(strings, ...values)
export const sqlSelect = (dbTable, dbColumns, limit) => createRequest().select(dbTable, dbColumns, limit)
export const sqlInsert = (table, obj, transaction) => createRequest(transaction).insert(table, obj)
export const sqlUpdate = (table, obj, transaction) => createRequest(transaction).update(table, obj)
export const sqlDelete = (table, transaction) => createRequest(transaction).delete(table)
export const sqlFirst = (dbTable, dbColumns) => createRequest().selectFirst(dbTable, dbColumns)
export const sqlExists = (dbTable, transaction) => createRequest(transaction).exists(dbTable)
export const sqlCount = dbTable => createRequest().count(dbTable)
export const sqlIds = (dbTable, limit) => createRequest().selectIds(dbTable, limit)
export const sqlMany = (strings, ...values) => sql(strings, ...values).then(rs => rs.flatMap(r => Object.values(r)))
export const sqlCopy = (dbTable, toChange, transaction) => createRequest(transaction).copy(dbTable, toChange)