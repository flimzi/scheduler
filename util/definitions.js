export class Definition {
    static random() {
        return Object.random(this)
    }

    static values() {
        return Object.values(this)
    }

    static isValid(value) {
        return this.values().includes(value)
    }
}

export class Roles extends Definition {
    static Carer = 1
    static Patient = 2
}

export class Genders extends Definition {
    static Male = 0
    static Female = 1
}

export class EventTypes extends Definition {
    static Alert = 100
    static Activity = 200
    static Drug = 300
    static Message = 400
}

export class RelationshipTypes extends Definition {
    static Carer = 0
    static Owner = 1
    static Friend = 2
}

export class IncomingMessageType extends EventTypes {
    static Error = -1
}

export class OutgoingMessageType extends EventTypes {
    static Error = -1
    static Ready = 0
}

export class TableEventTypes extends Definition {
    static Insert = 1
    static Update = 2
    static Delete = 3
}