import { EventStates, TaskTypes } from "../interface/definitions.js";
import Event from "../models/Event.js";
import dbEvents from "../schema/Events.js";
import { getEvents } from "../schema/functions.js";
import criticalHandler from "../util/criticalHandler.js";
import { sqlSelect } from "../util/sql.js";
import Service from "./Service.js";

export default class PollingTaskService extends Service {
    constructor({ pollInterval = 10000, defaultTaskDuration = 30000 } = {}) {
        super()
        this.defaultTaskDuration = defaultTaskDuration
        this.pollInterval = pollInterval
        setInterval(_ => this.startTasks(), pollInterval)

        this.repairTasks()
    }

    async getTaskQueue() {
        const query = getEvents({
            type: TaskTypes.values(), 
            state: EventStates.Pending, 
            startBefore: new Date(),
            startAfter: new Date().addMilliseconds(-this.pollInterval * 1.1)
        })

        return sqlSelect(query, dbEvents.getAbbreviatedColumns())()
    }

    async getExpiredTasks() {
        const query = getEvents({
            type: TaskTypes.values(),
            state: [EventStates.Pending, EventStates.Ongoing],
            endBefore: new Date()
        })

        return sqlSelect(query)()
    }

    async startTasks() {
        for (const { id, end_date } of await this.getTaskQueue()) {
            await dbEvents.updateColumnId({ id }, dbEvents.state, EventStates.Ongoing)
            
            setTimeout(
                async () => this.closeTask(await Event.getId(id)), 
                Math.max(0, end_date - new Date())
            )
        }
    }

    async repairTasks() {
        for (const task of await this.getExpiredTasks())
            this.closeTask(Event.from(task))
    }

    async closeTask(task) {
        if (task.state !== EventStates.Completed)
            dbEvents.updateColumnId(task, dbEvents.state, EventStates.Missed)

        task.reschedule()
    }
}