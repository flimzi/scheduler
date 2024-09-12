import mssql from 'mssql'
import pool from '../config/db.js'

export class SqlRequest extends mssql.Request {
    constructor(transaction) {
        super(transaction ?? pool)
        this.transaction = transaction
    }


}