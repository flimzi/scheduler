import { TableEventTypes } from '../interface/definitions.js'
import { TaskStatusMessage, TaskUpdateMessage } from '../interface/ServerMessage.js'
import events from '../schema/Events.js'
import users from '../schema/Users.js'
import { ArgumentError } from '../util/errors.js'
import Service from './Service.js'

export default class UserMessageService extends Service {
    constructor() {
        super()
        events.onChange(this.onEventsChange)
    }

    async onEventsChange({ tableEventType, deleted, inserted }) {
        let message

        switch (tableEventType) {
            case TableEventTypes.Insert:
                message = new TaskUpdateMessage(inserted.id, inserted)
                break
            case TableEventTypes.Delete:
                message = new TaskUpdateMessage(deleted.id)
                break
            case TableEventTypes.Update:
                message = inserted.status !== undefined 
                    ? new TaskStatusMessage(inserted)
                    : new TaskUpdateMessage(deleted.id, inserted)
                break
            default:
                throw new ArgumentError()
        }

        const secondary = await users.getId(deleted.receiver_id)
        secondary.sendFCM(message)

        for (const primary of await secondary.getPrimaries())
            primary.sendFCM(message)
    }
}