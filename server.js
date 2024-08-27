import 'dotenv/config'
import httpServer from './http.js'
import './util/conversions.js'
import './util/extensions.js'
import './ws.js'
// import { setupUserTest } from './tests/fcm.mjs'
import check from 'check-types'
import Carer from './models/Carer.js'
import Patient from './models/Patient.js'
import { login, logout } from './routes/auth.js'
import { getToken, getUser, postUsers, putFcmToken } from './routes/user.js'
import UserMessageService from './services/UserMessageService.js'
import { isJWT } from './util/helpers.js'
import { HttpStatus } from './util/http.js'
import { getEvent, getUpcomingTasks, postEvents } from './routes/event.js'
import Task from './models/Task.js'

const port = process.env.PORT || 3000
const userMessageService = new UserMessageService()
// const taskService = new PollingTaskService()

httpServer.listen(port, async () => {
    console.log(`Server running on port ${port}`)

    try {
        const carer = Carer.fake()
        carer.id = await postUsers(null, carer).then(r => r.json())
        console.assert(check.integer(carer.id))
        carer.accessToken = await login(carer).then(r => r.text())
        console.assert(isJWT(carer.accessToken))
        
        const patient = Patient.fake()
        patient.id = await postUsers(carer.accessToken, patient).then(r => r.json())
        console.assert(check.integer(patient.id))
        patient.accessToken = await getToken(carer.accessToken, patient.id).then(r => r.text())
        console.assert(isJWT(patient.accessToken))

        const c1 = await getUser(carer.accessToken).then(r => r.text())
        console.assert(c1.length > 50)
        const p1 = await getUser(carer.accessToken, patient.id).then(r => r.text())
        console.assert(p1.length > 50)
        const p2 = await getUser(patient.accessToken).then(r => r.text())
        const c2 = await getUser(patient.accessToken, carer.id).then(r => r.text())
        console.assert(c1 === c2)
        console.assert(p1 === p2)

        await logout(carer.accessToken)
        await logout(patient.accessToken)

        let response
        response = await getUser(carer.accessToken, carer.id)
        console.assert(response.status === HttpStatus.Unauthorized)

        response = await getUser(patient.accessToken, patient.id)
        console.assert(response.status === HttpStatus.Unauthorized)

        carer.accessToken = await login(carer).then(r => r.text())
        patient.accessToken = await getToken(carer.accessToken, patient.id).then(r => r.text())

        response = await putFcmToken(patient.accessToken, process.env.FCM_DEFAULT)
        console.assert(response.status === HttpStatus.Ok)

        const task = Task.everyMinute()
        task.id = await postEvents(carer.accessToken, patient.id, task).then(r => r.json())

        await getEvent(carer.accessToken, patient.id, task.id)
        await getUpcomingTasks(carer.accessToken, patient.id)
        // debugger
    } catch (e) {
        console.error(e)
    }


    // const task = Task.everyMinute(carer.id, patient.id)
})