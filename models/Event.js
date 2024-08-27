import { EventStates, EventTypes } from '../interface/definitions.js'
import events from '../schema/Events.js'
import Model from './Model.js'

export default class Event extends Model {
    status = EventStates.Pending
    
    getTable() { return events }
    
    constructor({ id, type, status, giver_id, receiver_id, info, modified_at, start_date, duration_seconds, interval_seconds }) {
        super({ id, type, status, giver_id, receiver_id, info, modified_at, start_date, duration_seconds, interval_seconds })
    }

    // this i think for now should be like in User so validate the input (for example valid type) and return result
    async getUpdateModel() {
        const model = await super.getUpdateModel()
        model.status = EventStates.Pending
        delete model.modified_at

        return model
    }
}