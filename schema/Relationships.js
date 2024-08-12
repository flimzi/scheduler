import { sqlExists, sqlInsert } from "../sql/helpers.js";
import DbObject from "./DbObject.js";

class Relationships extends DbObject {
    constructor() {
        super('relationships')
    }

    id = new DbObject('id')
    carer_id = new DbObject('carer_id')
    patient_id = new DbObject('patient_id')
    type = new DbObject('type')

    exists(carer_id, patient_id) {
        return sqlExists`SELECT 1 FROM ${this} WHERE ${this.carer_id} = ${carer_id} AND ${this.patient_id} = ${patient_id}`
    }

    async add(carer_id, patient_id, type = RelationshipTypes.Owner) {
        if (!await this.exists(carer_id, patient_id))
            return sqlInsert(this, { carer_id, patient_id, type }, true)
    }
}

export const relationships = new Relationships()

export class RelationshipTypes {
    static Carer = 0
    static Owner = 1
}