import { fakerPL as faker } from '@faker-js/faker'
import { EventTypes, TaskTypes } from "../interface/definitions.js";
import Event from "./Event.js";
import dbEvents from '../schema/Events.js';
import { sqlTransaction } from '../util/sql.js';

// might need to add different task types later but that shouldnt be aproblem
export default class Task extends Event {
    type = EventTypes.Task

    async reschedule() {
        if (!this.interval_seconds || new Date() < this.end_date)
            return

        const intervals = Math.ceil((new Date() - this.end_date) / (this.interval_seconds * 1000))
        this.start_date = this.end_date.addSeconds(this.interval_seconds * intervals)
        this.previous_id = this.id

        return super.add()
    }

    static everySeconds(seconds = 60, duration = 30) {
        return new this({
            info: faker.lorem.text(),
            start_date: new Date().addSeconds(seconds),
            duration_seconds: duration,
            interval_seconds: seconds,
        })
    }
}

export class TestTask extends Task {
    type = TaskTypes.Test
}