import mssql from "mssql";
import { createRequest, sqlExists, sqlInsert } from "../sql/helpers.js";
import DbObject from "./DbObject.js";

class Relationships extends DbObject {
    constructor() {
        super('relationships')
    }

    id = new DbObject('id')
    carer_id = new DbObject('carer_id')
    patient_id = new DbObject('patient_id')
    type = new DbObject('type')

    // hinges on the assumption that the default relationship is carer but i think thats fine
    exists(carer_id, patient_id, ...types) {
        const request = createRequest()
        request.parse`SELECT 1 FROM ${this} `
        request.parse`WHERE ${this.carer_id} = ${carer_id} AND ${this.patient_id} = ${patient_id} `

        if (types?.length)
            request.parse`AND ${this.type} IN [${types}]`

        return request.exists()
    }

    async add(carer_id, patient_id, type = RelationshipTypes.Owner, transaction) {
        if (!await this.exists(carer_id, patient_id))
            return sqlInsert(this, { carer_id, patient_id, type }, transaction)
    }
}

export const relationships = new Relationships()

export class RelationshipTypes {
    static Carer = 0
    static Owner = 1
}