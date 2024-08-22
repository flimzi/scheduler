import { EventStatus, EventTypes } from "../interface/definitions.js"
import { createRequest } from "../util/sql.js"
import { DbColumn, DbTable } from "./DbObject.js"
import { getEvents, substring } from "./functions.js"

class Events extends DbTable {
    constructor() {
        super('events')
    }

    id = new DbColumn('id')
    type = new DbColumn('type')
    status = new DbColumn('status')
    giver_id = new DbColumn('giver_id')
    receiver_id = new DbColumn('receiver_id')
    info = new DbColumn('info')
    modified_at = new DbColumn('modified_at')
    start_date = new DbColumn('start_date')
    duration_seconds = new DbColumn('duration_seconds')
    interval_seconds = new DbColumn('interval_seconds')

    abbreviatedEvents() {
        const columns = this.getColumns(this.info)
        columns.push(substring(this.info, 1, 100))
        return columns
    }

    async query({ giverId, receiverId, eventType, status, start, end }) {
        return sql`SELECT ${this.abbreviatedEvents()} FROM ${getEvents({ giverId, receiverId, eventType, status, start, end })}`
    }

    // maybe could be in its own child class
    // this should be a prepared statement ideally
    async getTaskQueue(minutesBack = 5) {
        return sql`
            SELECT ${this.abbreviatedEvents()} FROM ${this}
            WHERE ${this.type} = ${EventTypes.Task} AND ${this.status} = ${EventStatus.Pending}
            AND ${this.start_date} BETWEEN DATEADD(MINUTE, ${-minutesBack}, GETDATE()) AND GETDATE()
        `
    }

    async getOngoingTasks() {
        return sql`
            SELECT ${this.abbreviatedEvents()} FROM ${this}
            WHERE ${this.type} = ${EventTypes.Task} AND ${this.status} < ${EventStatus.Completed}
            AND ${this.start_date} <= GETDATE()
        `
    }
}

const events = new Events()
export default events