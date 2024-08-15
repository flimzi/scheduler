export class Definiton {
    static random() {
        return Object.random(this)
    }
}

export class Roles extends Definiton {
    static Carer = 1
    static Patient = 2
}

export class Genders extends Definiton {
    static Male = 0
    static Female = 1
}

export class EventTypes extends Definiton {
    static Emergency = 0
    static Activity = 1
    static Drug = 2
}

export class RelationshipTypes extends Definiton {
    static Carer = 0
    static Owner = 1
}