import 'dotenv/config'
import httpServer from './http.js'
import PollingTaskService from './services/PollingTaskService.js'
import UserMessageService from './services/UserMessageService.js'
import { userScenario1 } from './tests/functions.js'
import './util/conversions.js'
import './util/extensions.js'
import './ws.js'

const port = process.env.PORT || 3000
const userMessageService = new UserMessageService()
const taskService = new PollingTaskService()

httpServer.listen(port, async () => {
    console.log(`Server running on port ${port}`)

    // for (const i in Array.range(50)) {
    //     userScenario1()
    //     await new Promise(r => setTimeout(r, 250))
    // }

    userScenario1()
})