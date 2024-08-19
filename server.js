import 'dotenv/config'
import './util/extensions.js'
import './util/conversions.js'
import './ws.js'
import httpServer from './http.js'
import { setupUserTest } from './tests/fcm.mjs'

const port = process.env.PORT || 3000

httpServer.listen(port, async () => {
    // await tests.socketTest()
    
    console.log(`Server running on port ${port}`)
    await setupUserTest()
})