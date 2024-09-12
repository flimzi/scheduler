import 'dotenv/config'
import httpServer from './http.js'
import PollingTaskService from './services/PollingTaskService.js'
import UserMessageService from './services/UserMessageService.js'
import { userScenario1 } from './tests/functions.js'
import './util/conversions.js'
import './util/extensions.js'
import './ws.js'
import sql, { SqlBuilder } from './sql/SqlBuilder.js'
import dbUsers from './schema/Users.js'
import { sqlCopy, sqlCount, sqlExists, sqlSelect, sqlSelectId } from './sql/helpers.js'

const port = process.env.PORT || 3000
const userMessageService = new UserMessageService()
const taskService = new PollingTaskService()

httpServer.listen(port, async () => {
    console.log(`Server running on port ${port}`)

    // for (const i in Array.range(50)) {
    //     userScenario1()
    //     await new Promise(r => setTimeout(r, 250))
    // }

    // userScenario1()

    // let x = await sqlSelect(dbUsers, dbUsers.first_name, 10)(r => r[0])
    // let y = await sqlCopy(dbUsers, { email: null })`WHERE ${dbUsers.id} = ${16}`(r => console.log(r))
    let z = await sqlSelectId(dbUsers)()
    debugger
})