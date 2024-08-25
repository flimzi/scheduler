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
import { postUsers } from './routes/user.js'

const port = process.env.PORT || 3000
// const userMessageService = new UserMessageService()
// const taskService = new PollingTaskService()

httpServer.listen(port, async () => {
    console.log(`Server running on port ${port}`)

    // todo try testing web and android clients simultaneously
    // await setupUserTest()

    // const event = new Event({ 
    //     type: TaskTypes.Test,
    //     status: EventStatus.Pending,
    //     giver_id: 4, 
    //     receiver_id: 5, 
    //     start_date: new Date().addMilliseconds(30000),
    // })

    // await events.add(event)

    try {
        const carer = await Carer.fake()
        const response = await postUsers(null, carer)
        const addedCarer = await response.json()
        debugger
    } catch (e) {
        console.error(e)
    }
        
    // await carer.register()
    // const accessToken = await Carer.login(carer)
    // const x = await getEvents(accessToken)
    // const result = await x.json()


})