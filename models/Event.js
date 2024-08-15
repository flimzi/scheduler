import Model from './Model.js'

export default class Event extends Model {
    constructor({ id, type, status, giver_id, receiver_id, info, modified_at, start_date, duration_seconds, interval_seconds }) {
        super({ id, type, status, giver_id, receiver_id, info, modified_at, start_date, duration_seconds, interval_seconds })
    }

    async getUpdateModel() {
        const model = super.getUpdateModel()
        delete model.modified_at
        delete model.status

        return model
    }
}