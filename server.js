import 'dotenv/config'
import './util/extensions.js'
import './util/conversions.js'
import './ws.js'
import httpServer from './http.js'
// import { setupUserTest } from './tests/fcm.mjs'
import PollingTaskService from './services/PollingTaskService.js'
import UserMessageService from './services/UserMessageService.js'
import events from './schema/Events.js'
import Event from './models/Event.js'
import { EventStatus, EventTypes, TaskTypes } from './interface/definitions.js'
import Carer from './models/Carer.js'
import { HttpRequest } from './util/http.js'
import { baseUrl } from './util/helpers.js'
import { getToken, getUser, postUsers } from './routes/user.js'
import { sqlFirst } from './util/sql.js'
import users from './schema/Users.js'
import { login } from './routes/auth.js'
import Patient from './models/Patient.js'
import Task from './models/Task.js'
import { ApiRoutes } from './routes/api.js'
import bcrypt from 'bcryptjs'

const port = process.env.PORT || 3000
// const userMessageService = new UserMessageService()
// const taskService = new PollingTaskService()

httpServer.listen(port, async () => {
    console.log(`Server running on port ${port}`)

    try {
        const carer = Carer.fake()
        carer.id = await postUsers(null, carer).then(r => r.json())
        carer.accessToken = await login(carer).then(r => r.text())
        
        const patient = Patient.fake()
        patient.id = await postUsers(carer.accessToken, patient).then(r => r.json())
        patient.accessToken = await getToken(carer.accessToken, patient.id).then(r => r.text())

        const u1 = await getUser(carer.accessToken, carer.id).then(r => r.json())
        const u2 = await getUser(carer.accessToken, patient.id).then(r => r.json())

        debugger
    } catch (e) {
        console.error(e)
    }


    // const task = Task.everyMinute(carer.id, patient.id)
})