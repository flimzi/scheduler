import { fakerPL as faker } from "@faker-js/faker"
import { Roles } from "../interface/definitions.js"
import Task from "../models/Task.js"
import { eventActions } from "../routes/event.js"
import UserMessageService from "../services/UserMessageService.js"
import Client from "./Client.mjs"
import { assert } from "../util/helpers.js"

export async function userScenario1() {
    const primary = await Client.create(Roles.Primary)
    const secondary = await primary.createChild(Roles.Secondary)
    const task = await primary.addTaskFor(secondary, Task.everySeconds(10, 5))

    task.info = faker.company.catchPhrase()
    await eventActions.putEvent(primary.accessToken, secondary.id, task.id, task).then(r => assert(r.ok))
    await primary.addDrugTaskFor(secondary)

    await new Promise(r => setTimeout(r, 2500))
    console.log(UserMessageService.unconfirmed)
}