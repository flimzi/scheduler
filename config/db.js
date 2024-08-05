import mssql from 'mssql'
import { DbObject } from './schema.js'

export const poolPromise = mssql.connect({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
})

mssql.Request.prototype.addParam = function(name, value) {
    this.input(name.toString(), value)
    return '@' + name
}

mssql.Request.prototype.inputQuery = function(query) {
    return this.query(query(this))
}

mssql.Request.prototype.insert = function(table, obj) {
    const keys = Object.keys(obj)
    const values = keys.map(key => this.addParam(key, values[key]))
    return this.inputQuery(r => `INSERT INTO ${table} (${keys.join()}) VALUES (${values.join()})`)
}

async function sql(strings, ...values) {
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

export { sql }
