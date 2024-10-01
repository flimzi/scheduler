import mssql from 'mssql'
import pool from '../config/db.js'
import DbObject, { DbFunction } from '../schema/DbObject.js'
import { SqlTransaction } from './SqlTransaction.js'
import sqlRequest from './SqlRequest.js'

export class SqlBuilder {
    static NULL = 'NULL'
    transformation = r => r

    constructor(command = '', parameters = []) {
        this.command = command
        this.parameters = parameters
    }

    input(value) {
        if (value === undefined)
            return ''
    
        if (value === null)
            return SqlBuilder.NULL
    
        if (value instanceof DbFunction)
            return `${value.dbName}(${this.input(value.values)})`
    
        if (value instanceof DbObject)
            return value.dbName
    
        if (Array.isArray(value))
            return this.inputArray(value)
    
        if (Object.isObject(value) && value instanceof Date === false)
            return this.inputList(value)
    
        return '@' + (this.parameters.push(value) - 1)
    }

    inputArray(values, delimiter = ', ') {
        return values.map(this.input.bind(this)).join(delimiter)
    }

    inputList(list, delimiter = ', ', sign = '=') {
        return Object.entries(list).map(([col, val]) => `${col} ${sign} ${this.input(val)}`).join(delimiter)
    }

    parse(strings, ...values) {
        if (strings)
            this.command += strings.reduce((string, part, i) => string + part + this.input(values[i]), '\n')
        
        return this
    }

    parseInto(strings, ...values) {
        return new SqlBuilder(this.command, [...this.parameters]).parse(strings, ...values)
    }

    query(value, ...values) {
        if (value === undefined || value instanceof SqlTransaction)
            return sqlRequest(this.command, this.parameters, value).then(this.transformation)

        if (typeof value === 'function')
            return this.query(values[0]).then(value)
    
        return this.parse(value, ...values).query.bind(this)
    }
}   

export default function sql(value, ...values) {
    return new SqlBuilder().query(value, ...values)
}