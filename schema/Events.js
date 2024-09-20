import { EventStates, TableEventTypes, TaskTypes } from "../interface/definitions.js"
import { sqlSelect, sqlUpdate } from "../util/sql.js"
import { DbColumn, DbTable } from "./DbObject.js"
import { getEvents } from "./functions.js"

class Events extends DbTable {
    constructor() {
        super('events')
        
        this.on(
            TableEventTypes.Update, 
            ({ deleted }) => 
                sqlUpdate(dbEvents, { [dbEvents.modified_at.dbName]: new Date() })`WHERE ${dbEvents.id} = ${deleted.id}`
        )
    }

    id = new DbColumn('id')
    type = new DbColumn('type')
    state = new DbColumn('state')
    giver_id = new DbColumn('giver_id')
    receiver_id = new DbColumn('receiver_id')
    info = new DbColumn('info')
    modified_at = new DbColumn('modified_at')
    start_date = new DbColumn('start_date')
    end_date = new DbColumn('end_date')
    duration_seconds = new DbColumn('duration_seconds')
    interval_seconds = new DbColumn('interval_seconds')
    previous_id = new DbColumn('previous_id')

    getAbbreviatedColumns() {
        return this.getColumns(this.info)
    }

    async query({ giverId, receiverId, type, state, startBefore, startAfter }) {
        return sqlSelect(getEvents({ giverId, receiverId, type, state, startBefore, startAfter }))`ORDER BY ${this.start_date}`
    }

    async getUpcomingTasks({ giverId, receiverId, type, startBefore, startAfter }) {
        return this.query({ 
            giverId, receiverId, startBefore,
            state: EventStates.Pending, 
            type: type ?? TaskTypes.values(), 
            startAfter: startAfter ?? new Date()
        })
    }

    async getMissedTasks({ giverId, receiverId, type, startBefore, startAfter }) {
        return this.query({
            giverId, receiverId, startBefore, startAfter,
            state: EventStates.Missed,
            type: type ?? TaskTypes.values()
        })
    }
}

const dbEvents = new Events()
export default dbEvents