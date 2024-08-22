import events from '../schema/Events.js'
import Service from './Service.js'

export class UserMessageService extends Service {
    constructor() {
        events.onChange(this.onEventsChange)
    }

    onEventsChange() {
        
    }
}