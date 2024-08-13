import mssql from "mssql";
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

    // hinges on the assumption that the default relationship is carer but i think thats fine
    exists(carer_id, patient_id, ...types) {
        // let whereTypes
        
        // if (types?.length)
        //     whereTypes = new DbObject(`AND ${this.type.name} IN [${types.join()}]`)

        // return sqlExists`
        //     SELECT 1 FROM ${this} 
        //     WHERE ${this.carer_id} = ${carer_id} AND ${this.patient_id} = ${patient_id} 
        //     ${whereTypes}
        // `
    
        const request = mssql.Request.create()
        let whereTypes = ''

        if (types?.length)
            whereTypes = `AND ${this.type.name} IN [${request.addParams(types)}]`

        return request.exists(r => `
            SELECT 1 FROM ${this.name}
            WHERE ${this.carer_id.name} = ${r.addParam(carer_id)} AND ${this.patient_id.name} = ${r.addParam(patient_id)}
            ${whereTypes}
        `)
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