import { EventTypes, TableEventTypes } from '../interface/definitions.js'
import { TaskStatusMessage, TaskUpdateMessage } from '../interface/ServerMessage.js'
import User from '../models/User.js'
import events from '../schema/Events.js'
import users from '../schema/Users.js'
import { ArgumentError } from '../util/errors.js'
import Service from './Service.js'

export default class UserMessageService extends Service {
    constructor() {
        super()
        events.onChange(this.onTasksChange)
    }

    async onTasksChange({ tableEventType, deleted, inserted }) {
        if (inserted.type !== EventTypes.Task) // this is going to need to check if task types includes
            return

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

        const secondary = await users.getId(deleted?.receiver_id ?? inserted.receiver_id)
        secondary.sendFCM(message)

        for (const primary of await secondary.getPrimary())
            primary.cast(User).sendFCM(message)
    }
}