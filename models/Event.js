import { EventStates, EventTypes } from '../interface/definitions.js'
import dbEvents from '../schema/Events.js'
import Model from './Model.js'

export default class Event extends Model {
    state = EventStates.Pending
    
    static getTable() { return dbEvents }
    
    constructor({ id, type, state, giver_id, receiver_id, info, modified_at, start_date, end_date, duration_seconds, interval_seconds, previous_id }) {
        super({ id, type, state, giver_id, receiver_id, info, modified_at, start_date, end_date, duration_seconds, interval_seconds, previous_id })
    }

    async getUpdateModel() {
        const model = this.clone()
        delete model.id
        delete model.modified_at
        delete model.end_date

        return model
    }

    async getInsertModel() {
        const model = this.clone()
        model.state = EventStates.Pending
        delete model.id
        delete model.modified_at

        return model
    }
}