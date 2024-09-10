import { DbColumn, DbTable } from "./DbObject.js";

class TaskDrugs extends DbTable {
    constructor() {
        super('task_drugs')
    }

    taskId = new DbColumn('taskId')
    drugId = new DbColumn('drugId')
    amount = new DbColumn('amount')
}

const dbTaskDrugs = new TaskDrugs()
export default dbTaskDrugs