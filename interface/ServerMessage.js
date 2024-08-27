// define server sent message types for http and fcm and ws

export class ServerMessage {
    constructor(type, fields = {}) {
        this.type = type
        Object.assign(this, fields)
    }
}

export class TaskStatusMessage extends ServerMessage {
    static type = 1

    constructor(task) {
        super(TaskStatusMessage.type, { task })
    }
}

export class TaskUpdateMessage extends ServerMessage {
    static type = 2

    constructor(taskId, newTask) {
        super(TaskUpdateMessage.type, { taskId, newTask })
    }
}