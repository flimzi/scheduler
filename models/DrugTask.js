import Task from './Task.js'
import { TaskTypes } from "../interface/definitions.js";
import { ArgumentError } from '../util/errors.js';
import { sqlDelete, sqlExists, sqlTransaction } from '../util/sql.js';
import dbDrugs from '../schema/Drugs.js';
import dbTaskDrugs from '../schema/TaskDrugs.js'

export default class DrugTask extends Task {
    type = TaskTypes.Drug

    constructor(init) {
        super(init)
        this.drugs = init.drugs
    }

    async getInsertModel() {
        const model = await super.getInsertModel()

        if (!Array.isArray(this.drugs) || !this.drugs.length)
            throw new ArgumentError("No drugs specified")

        return model
    }

    async add(transaction) {
        return sqlTransaction(async t => {
            const task = await super.add(t)
            await task.setDrugs(drugs, t)

            return task
        }, transaction)
    }

    async setDrugs(drugs, transaction) {
        await sqlDelete(dbTaskDrugs, transaction)`WHERE ${dbTaskDrugs.taskId} = ${this.id}`
        const toAssign = []

        for (const { id } of drugs.filter(d => d.id !== undefined)) {
            if (!await sqlExists(dbDrugs, transaction)`WHERE ${dbDrugs.id} = ${id} AND ${dbDrugs.userId} = ${this.giver_id}`)
                throw new ArgumentError('nonexistent drug')

            toAssign.push(id)
        }

        for (const drug of drugs.filter(d => d.id === undefined)) {
            drug.userId = this.giver_id
            const { id } = await dbDrugs.add(drug, transaction)

            toAssign.push(id)
        }

        for (const id of toAssign)
            await dbTaskDrugs.add({ taskId: this.id, drugId: id }, transaction)
    }
}