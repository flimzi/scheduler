import check from 'check-types'
import { EventEmitter } from 'events'
import FirebaseCloudMessage from '../firebase/FirebaseCloudMessage.js'
import { EventTypes, TableEventTypes } from '../interface/definitions.js'
import { TaskStateMessage, TaskUpdateMessage } from '../interface/ServerMessage.js'
import User from '../models/User.js'
import dbEvents from '../schema/Events.js'
import dbUsers from '../schema/Users.js'
import Service from './Service.js'

export default class UserMessageService extends Service {
    static {
        this.confirmationEvents = new EventEmitter()
        this.confirmationEvents.setMaxListeners(50)
        this.unconfirmed = 0

        this.confirm = message => {
            if (!check.object(message.data))
                return

            const data = FirebaseCloudMessage.unstringify(message.data)
            this.confirmationEvents.emit(message.messageId, data)
            
            if (check.integer(detail.userId))
                this.confirmationEvents.emit(detail.userId, data)
        }

        this.onConfirmed = (messageId, listener) => this.confirmationEvents.once(messageId, listener)
        this.onUserConfirmed = (userId, listener) => this.confirmationEvents.on(userId, listener)
    }

    constructor() {
        super()

        dbEvents.on(TableEventTypes.Insert, this.onEventsInsert.bind(this))
        dbEvents.on(TableEventTypes.Update, this.onEventsUpdate.bind(this))
        dbEvents.on(TableEventTypes.Delete, this.onEventsDelete.bind(this))
    }

    async onEventsInsert({ inserted }) {
        switch (inserted.type) {
            case EventTypes.Task:
                this.sendToUserAndParents(inserted.receiver_id, new TaskUpdateMessage(inserted.id, inserted))
                break
        }
    }

    async onEventsUpdate({ deleted, inserted }) {
        switch (inserted.type) {
            case EventTypes.Task:
                // only the values provided in the update object are present in inserted because it doesnt fully output the record
                // but if it did we would check deleted.status !== inserted.status
                const message = deleted.state !== undefined
                    ? new TaskStateMessage(inserted)
                    : new TaskUpdateMessage(inserted.id, inserted)

                this.sendToUserAndParents(inserted.receiver_id, message)
                break
        }
    }

    async onEventsDelete({ deleted }) {
        switch (deleted.type) {
            case EventTypes.Task:
                this.sendToUserAndParents(deleted.receiver_id, new TaskUpdateMessage(deleted.id))
                break
        }
    }

    async sendTo(user, fcm) {
        UserMessageService.unconfirmed++
        const messageId = await user.sendFCM(fcm)

        if (messageId === undefined)
            return

        if (!!process.env.DEBUG)
            UserMessageService.onConfirmed(messageId, _ => {
                UserMessageService.unconfirmed--
            })

        return messageId
    }

    // this could be in base and the rest in UserTaskMessageService
    // todo not send to giver when not needed
    async sendToUserAndParents(userId, fcm) {
        const user = await dbUsers.getId(userId)
        this.sendTo(user, fcm)

        for (const parent of await user.getParents())
            this.sendTo(parent.cast(User), fcm)
    }
}