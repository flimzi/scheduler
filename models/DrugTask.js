import check from 'check-types';
import { TaskTypes } from "../interface/definitions.js";
import dbTaskDrugs from '../schema/TaskDrugs.js';
import { ArgumentError } from '../util/errors.js';
// import { sqlCopy, sqlDelete, sqlTransaction, sqlTransactionResult } from '../util/sql.js';
import sqlTransaction from '../sql/SqlTransaction.js';
import { sqlCopy, sqlDelete } from '../sql/helpers.js';
import { sqlSelect } from '../sql/helpers.js';
import dbDrugs from '../schema/Drugs.js'
import Task from './Task.js';
import TaskDrug from './TaskDrug.js';

export default class DrugTask extends Task {
    type = TaskTypes.Drug

    constructor(init) {
        super(init)

        // taskDrugs can be undefined for rescheduling optimization of copying table records
        this.taskDrugs = init.taskDrugs?.map(td => new TaskDrug(td)) ?? []
    }

    async add(transaction) {
        const taskDrugs = this.taskDrugs

        return sqlTransaction(async t => {
            const task = await super.add(t)
            await task.setDrugs(taskDrugs, t)

            return task
        }, transaction)
    }

    async getUpdateModel() {
        const model = await super.getUpdateModel()
        delete model.taskDrugs

        return model
    }

    async getDownloadModel() {
        const model = await super.getDownloadModel()
        model.taskDrugs = await model.getDrugs()

        return model
    }

    async getDrugs(full) {
        let taskDrugs = sqlSelect(dbTaskDrugs)

        if (full)
            taskDrugs = taskDrugs`JOIN ${dbDrugs} ON ${dbTaskDrugs}.${dbTaskDrugs.drugId} = ${dbDrugs}.${dbDrugs.id}`

        return taskDrugs`WHERE ${dbTaskDrugs.taskId} = ${this.id}`()
    }

    async setDrugs(taskDrugs, transaction) {
        return sqlTransaction(async t => {
            await sqlDelete(dbTaskDrugs, t)`WHERE ${dbTaskDrugs.taskId} = ${this.id}`()

            // todo this should be a bulk insert
            for (const { drugId, amount } of taskDrugs)
                await dbTaskDrugs.add({ taskId: this.id, drugId, amount }, t)
        }, transaction)
    }

    async reschedule() {
        const rescheduled = await super.reschedule()
        await sqlCopy(dbTaskDrugs, { taskId: rescheduled.id })`WHERE ${dbTaskDrugs.taskId} = ${this.id}`()

        return rescheduled
    }
}