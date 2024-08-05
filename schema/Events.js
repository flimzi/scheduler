import DbObject from "./DbObject.js"

class Events extends DbObject {
    constructor() {
        super('events')
    }

    id = new DbObject('id')
    
}

const events = new Events()
export default events