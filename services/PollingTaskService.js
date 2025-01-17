import Service from "./Service.js";
import events from "../schema/Events.js";
import { EventStates, EventTypes, TaskTypes } from "../interface/definitions.js";
import criticalHandler from "../util/criticalHandler.js";
import { getEvents } from "../schema/functions.js";
import { sqlIds, sqlMany } from "../util/sql.js";

// tasks could also be scheduled as they come in using node-cron or node-scheduler in SchedulingTaskService which contains the mapping of eventId to schedule
// that could be updated in real time using DbTable.onChange
export default class PollingTaskService extends Service {
    constructor({ pollInterval = 10000, defaultTaskDuration = 30000 }) {
        super()
        this.defaultTaskDuration = defaultTaskDuration // should use end_date by default
        this.interval = setInterval(this.startTasks.catch(criticalHandler), pollInterval)
    }

    async getTaskQueue(lookBack = 30000) {
        return events.query({
            type: EventTypes.Task, 
            status: EventStates.Pending, 
            before: new Date(),
            after: new Date().addMilliseconds(-lookBack)
        })
    }

    async getExpiredTaskIds() {
        const query = getEvents({
            type: TaskTypes.values(),
            status: [EventStates.Pending, EventStates.Ongoing],
            before: new Date().addMilliseconds(this.defaultTaskDuration)
        })

        return sqlIds(query)
    }

    async startTasks() {
        this.repairTasks()
        
        for (const task of await this.getTaskQueue()) {
            events.updateColumnId(task, events.status, EventStates.Ongoing)
            setTimeout(() => this.closeTask(task.id).catch(criticalHandler), this.defaultTaskDuration)
        }
    }

    async closeTask(taskId) {
        const task = await events.getId(taskId)

        if (task.status !== EventStates.Completed)
            events.updateColumnId(task, events.status, EventStates.Missed)

        if (task.interval_seconds)
            events.add(await task.getUpdateModel())
    }

    async repairTasks() {
        for (const id of await this.getExpiredTaskIds())
            events.updateColumnId({ id }, events.status, EventStates.Missed)
    }
}