import Service from "./Service.js";
import events from "../schema/Events.js";
import { EventStatus, EventTypes, TaskTypes } from "../interface/definitions.js";
import criticalHandler from "../util/criticalHandler.js";
import { getEvents } from "../schema/functions.js";
import { sqlMany } from "../util/sql.js";

// it would be better to for example on startup and every hour schedule tasks for the next hour by unique id using node-cron or node-scheduler
// this could be updated in real time using DbTable.onChange
// another method would query pending tasks that are in the past and would clean up those that should have completed - this could maybe run once every half an hour
// (and for completeness also take action in the case of tasks still ongoing, like a reminder)
export default class PollingTaskService extends Service {
    constructor({ pollInterval = 10000, defaultTaskDuration = 30000 }) {
        super()
        this.defaultTaskDuration = defaultTaskDuration // should use end_date by default
        this.interval = setInterval(this.startTasks.catch(criticalHandler), pollInterval)
    }

    async getTaskQueue(lookBack = 30000) {
        return events.query({
            type: EventTypes.Task, 
            status: EventStatus.Pending, 
            before: new Date(),
            after: new Date().addMilliseconds(-lookBack)
        })
    }

    async getExpiredTaskIds() {
        const query = getEvents({
            type: TaskTypes.values(),
            status: [EventStatus.Pending, EventStatus.Ongoing],
            before: new Date().addMilliseconds(this.defaultTaskDuration)
        })

        // todo make a select helper
        return sqlMany`SELECT ${events.id} FROM ${query}`
    }

    async startTasks() {
        this.repairTasks()
        
        for (const task of await this.getTaskQueue()) {
            events.updateColumnId(task, events.status, EventStatus.Ongoing)
            setTimeout(() => this.closeTask(task.id).catch(criticalHandler), this.defaultTaskDuration)
        }
    }

    async closeTask(taskId) {
        const task = await events.getId(taskId)

        if (task.status !== EventStatus.Completed)
            events.updateColumnId(task, events.status, EventStatus.Missed)

        if (task.interval_seconds)
            events.add(await task.getUpdateModel())
    }

    // this cannot be a sql function because we need the event emitted
    async repairTasks() {
        for (const id of await this.getExpiredTaskIds())
            events.updateColumnId({ id }, events.status, EventStatus.Missed)
    }
}