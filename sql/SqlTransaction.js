import mssql from 'mssql'
import pool from '../config/db.js'

export class SqlTransaction extends mssql.Transaction {
    static lastTransactionId = 0
    operations = []

    constructor(parentTransaction) {
        super(pool)
        this.parentTransaction = parentTransaction
        this.setMaxListeners(50)
    }

    onCommit = listener => this.once('commit', listener)
    onRollback = listener => this.once('rollback', listener)

    async begin() {
        if (this.began)
            return

        await super.begin()
        this.began = true
    }

    async rollback() {
        if (this.completed)
            return

        await super.rollback()
        this.failed = this.completed = true
        this.emit('rollback')
    }

    async commit() {
        if (this.completed)
            return

        await super.commit()
        this.completed = true
        this.emit('commit')
    }
}

export async function sqlTransaction(operations, parentTransaction) {
    const transaction = parentTransaction ?? new SqlTransaction()
    await transaction.begin()

    const result = await operations(transaction).catch(async e => {
        await transaction.rollback()
        throw e
    })

    await transaction.commit()
    return result
}