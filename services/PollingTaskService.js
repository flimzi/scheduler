import { EventStates, TaskTypes } from "../interface/definitions.js";
import Event from "../models/Event.js";
import dbEvents from "../schema/Events.js";
import { getEvents } from "../schema/functions.js";
import { sqlSelect } from "../sql/helpers.js";
import { DEBUG, formatIntervalFromMilliseconds } from "../util/helpers.js";
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
        for (const task of await this.getTaskQueue()) {
            await dbEvents.updateColumnId(task, dbEvents.state, EventStates.Ongoing)
            const now = new Date()
            const delay = now - task.start_date
            const remaining = task.end_date - now

            if (DEBUG) {
                console.log('----- TASK -----')
                console.log('started task', task, `(${task.id})`)
                console.log(`starts at ${task.start_date.toLocaleString()}; delayed by ${formatIntervalFromMilliseconds(delay)}`)
                console.log(`ends in ${formatIntervalFromMilliseconds(remaining)}`)
            }
            
            setTimeout(
                async () => this.closeTask(await Event.getId(task.id)), 
                Math.max(0, remaining)
            )
        }
    }

    // also maybe should repair tasks that have been closed but not yet rescheduled
    // also all of this should be done using sql but there would need to be triggers set up to log activity into another table
    // and user updates would then be sent out based on records in that table
    // but there cant be any triggers in the database now because they cannot be used along with OUTPUT
    // so it would need to be changed to returning query results using an intermediate temporary table kinda like sqlCopy
    async repairTasks() {
        for (const task of await this.getExpiredTasks())
            this.closeTask(Event.from(task))
    }

    async closeTask(task) {
        if (task.state !== EventStates.Completed)
            await dbEvents.updateColumnId(task, dbEvents.state, EventStates.Missed)

        const rescheduled = await task.reschedule()

        if (DEBUG) {
            console.log('----- TASK -----')
            console.log('closed task', task, `(${task.id})`)
            console.log(`ended at ${task.end_date.toLocaleString()}; now is ${new Date().toLocaleString()}`)

            if (rescheduled) {
                console.log('rescheduled into', rescheduled, `(${rescheduled.id})`)
                console.log(`starts at ${rescheduled.start_date.toLocaleString()}`)
            }
        }
    }
}