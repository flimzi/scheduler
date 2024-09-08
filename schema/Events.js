import { sqlSelect, sqlUpdate } from "../util/sql.js"
import { DbColumn, DbTable } from "./DbObject.js"
import { getEvents, substring } from "./functions.js"

class Events extends DbTable {
    constructor() {
        super('events')
    }

    id = new DbColumn('id')
    type = new DbColumn('type')
    state = new DbColumn('state')
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

    async query({ giverId, receiverId, type, state, startBefore, startAfter, limit }) {
        const events = getEvents({ giverId, receiverId, type, state, startBefore, startAfter })
        return sqlSelect(events, this.abbreviatedEvents(), limit)`ORDER BY ${this.start_date}`
    }
}

const events = new Events()
events.onUpdate(({ deleted }) => sqlUpdate(events, { [events.modified_at.name]: new Date() })`WHERE ${events.id} = ${deleted.id}`)
export default events