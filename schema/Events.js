import DbObject from "./DbObject.js"

class Events extends DbObject {
    constructor() {
        super('events')
    }

    id = new DbObject('id')
    type = new DbObject('type')
    status = new DbObject('status')
    giverId = new DbObject('giver_id')
    receiverId = new DbObject('receiver_id')
    info = new DbObject('info')
    modifiedAt = new DbObject('modified_at')
    startDate = new DbObject('start_date')
    durationSeconds = new DbObject('duration_seconds')
    intervalSeconds = new DbObject('interval_seconds')
}

const events = new Events()
export default events