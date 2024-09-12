import check from 'check-types';
import { TaskTypes } from "../interface/definitions.js";
import dbTaskDrugs from '../schema/TaskDrugs.js';
import { ArgumentError } from '../util/errors.js';
import { sqlCopy, sqlDelete, sqlSelect, sqlTransaction, sqlTransactionResult } from '../util/sql.js';
import Task from './Task.js';
import TaskDrug from './TaskDrug.js';

export default class DrugTask extends Task {
    type = TaskTypes.Drug

    constructor(init) {
        super(init)
        this.drugIds = init.drugIds?.map(d => new TaskDrug(d))
    }

    async add(transaction) {
        const drugIds = this.drugIds
        delete this.drugIds

        return sqlTransactionResult(async t => {
            const task = await super.add(t)
            await task.setDrugs(drugIds, t)

            return task
        }, transaction)
    }

    async getDownloadModel() {
        // this needs to be drugIds if the upload and download models are to be the same
        // which they do not have to be and this could return the entire drug objects for speed 
        // but the client would need to have a representation for each of the two models
        // but it is going to suffice for now
        // also i dont think there is a need for manipulating nested models
        const model = await super.getDownloadModel()
        model.drugIds = await sqlSelect(dbTaskDrugs)`WHERE ${dbTaskDrugs.taskId} = ${this.id}`

        return model
    }

    // async getDrugs() {

    // }

    async setDrugs(drugs, transaction) {
        return sqlTransaction(async t => {
            await sqlDelete(dbTaskDrugs, transaction)`WHERE ${dbTaskDrugs.taskId} = ${this.id}`

            for (const { drugId, amount } of drugs)
                await dbTaskDrugs.add({ taskId: this.id, drugId, amount }, t)
        }, transaction)
    }

    async reschedule() {
        const newTask = await super.reschedule()
        await sqlCopy(dbTaskDrugs, { taskId: newTask.id })`WHERE ${dbTaskDrugs.taskId} = ${this.id}`

        return newTask
    }
}