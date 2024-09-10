import Model from './Model.js'

export default class TaskDrug extends Model {
    constructor({ taskId, drugId, amount }) {
        super({ taskId, drugId, amount })
    }
}