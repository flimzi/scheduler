import mssql from 'mssql'
import pool from '../config/db.js'
const debug = !!process.env.DEBUG

export class SqlRequest extends mssql.Request {
    constructor(transaction) {
        super(transaction ?? pool)
    }

    output(parameter) {
        const value = this.parameters[parameter.toString()]?.value

        if (!value)
            return
    
        if (value instanceof Date)
            return `'${value.toISOString()}'`

        if (typeof value === 'string')
            return `'${value}'`

        return value
    }

    reveal(command) {
        return command.replace(/@(\d+)/g, (match, p1) => this.output(p1) ?? match)
    }

    static async run(command, parameters, transaction) {
        let result
        const request = new SqlRequest(transaction)
        parameters?.map((value, parameter) => request.input(parameter.toString(), value))
        const fullCommand = request.reveal(command)

        try {
            const { recordsets } = await request.query(command.replace('\n', ' '))
            result = recordsets.length === 1 ? recordsets[0] : recordsets
        } catch (e) {
            request.logError(fullCommand)
            throw e
        }

        if (debug) {
            request.logResult(fullCommand, result)
            transaction?.operations.push(fullCommand)
        }

        return result
    }

    logError(command) {
        console.error('----- SQL -----')
        console.error(this.reveal(command))
        console.error(e)
        console.log(this.transaction?.unwind() ?? [])
    }

    logResult(command, result) {
        console.log('----- SQL -----')
        console.log(this.reveal(command))
        console.log(result)
    }
 
    async *stream() {

    }
}

export default async function sqlRequest(command, parameters, transaction) {
    return SqlRequest.run(command, parameters, transaction)
}