import DbObject from "./DbObject.js";

class Relationships extends DbObject {
    constructor() {
        super('relationships')
    }

    id = new DbObject('id')
    carerId = new DbObject('carer_id')
    patientId = new DbObject('patient_id')
    type = new DbObject('type')
}

export const relationships = new Relationships()

export class RelationshipTypes {
    static Carer = 0
    static Owner = 1
}