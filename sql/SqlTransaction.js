import mssql from 'mssql'
import pool from '../config/db.js'
const debug = process.env.DEBUG

class TransactionEvents {
    Commit = 100
    Rollback = 200
}

export class SqlTransaction extends mssql.Transaction {
    static lastTransactionId = 0
    operations = []

    constructor(parentTransaction) {
        super(pool)
        this.parentTransaction = parentTransaction
        this.setMaxListeners(50)
    }

    onCommit = listener => this.once(TransactionEvents.Commit, listener)
    onRollback = listener => this.once(TransactionEvents.Rollback, listener)

    async start() {
        if (this.began)
            return

        await super.begin()
        this.began = true
    }

    async failure() {
        if (this.completed)
            return

        await super.rollback()
        this.failed = this.completed = true
        this.emit(TransactionEvents.Rollback)
    }

    async success() {
        if (this.completed)
            return

        await super.commit()
        this.completed = true
        this.emit(TransactionEvents.Commit)
    
        if (debug)
            this.parentTransaction?.operations.push(...this.operations)
    }

    static async run(operations, parentTransaction) {
        const transaction = parentTransaction ?? new SqlTransaction()
        await transaction.start()
    
        const result = await operations(transaction).catch(async e => {
            await transaction.failure()
            throw e
        })
    
        await transaction.success()
        return result
    }

    unwind() {
        // log operations in this and parents in order
    }
}

export default async function sqlTransaction(operations, parentTransaction) {
    return SqlTransaction.run(operations, parentTransaction)
}