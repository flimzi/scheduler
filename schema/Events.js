import { IdModelTable } from "./DbObject.js"

class Events extends IdModelTable {
    constructor() {
        super('events')
    }

    type = new DbObject('type')
    status = new DbObject('status')
    giver_id = new DbObject('giver_id')
    receiver_id = new DbObject('receiver_id')
    info = new DbObject('info')
    modified_at = new DbObject('modified_at')
    start_date = new DbObject('start_date')
    duration_seconds = new DbObject('duration_seconds')
    interval_seconds = new DbObject('interval_seconds')
}

const events = new Events()
export default events