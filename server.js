import 'dotenv/config'
import './util/extensions.js'
import './util/conversions.js'
import './ws.js'
import httpServer from './http.js'

const port = process.env.PORT || 3000

httpServer.listen(port, async () => {
    console.log(`Server running on port ${port}`)
})