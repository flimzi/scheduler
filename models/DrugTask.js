import check from 'check-types';
import { TaskTypes } from "../interface/definitions.js";
import dbTaskDrugs from '../schema/TaskDrugs.js';
import { ArgumentError } from '../util/errors.js';
import { sqlDelete, sqlTransaction, sqlTransactionResult } from '../util/sql.js';
import Task from './Task.js';
import TaskDrug from './TaskDrug.js';

export default class DrugTask extends Task {
    type = TaskTypes.Drug

    constructor(init) {
        super(init)
        this.drugs = init.drugs?.map(d => new TaskDrug(d))
    }

    async add(transaction) {
        const drugs = this.drugs
        delete this.drugs

        return sqlTransactionResult(async t => {
            const task = await super.add(t)
            await task.setDrugs(drugs, t)

            return task
        }, transaction)
    }

    async setDrugs(drugs, transaction) {
        return sqlTransaction(async t => {
            await sqlDelete(dbTaskDrugs, transaction)`WHERE ${dbTaskDrugs.taskId} = ${this.id}`

            for (const { drugId, amount } of drugs)
                await dbTaskDrugs.add({ taskId: this.id, drugId, amount }, t)
        }, transaction)
    }
}