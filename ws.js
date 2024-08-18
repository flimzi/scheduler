import { WebSocketServer } from "ws"
import httpServer from "./http.js"
import User from "./models/User.js"
import { EventTypes, OutgoingMessageType } from "./util/definitions.js"

const server = new WebSocketServer({ server: httpServer })

// i feel like best general way to handle this would be to add events to DbTable on insert update etc?
// i could also export a method from here

// easiest way is to i guess always send the whole event list which shouldnt be too expensive because they are going to be cursor limited anyway
// but we could also only send the affected elements because i think a diff function will have to be applied anyways even if in the android app
// but i think for now we do the whole approach and then adjust according to actual android behavior

const users = {}

function error(e) {
    // would be nice to manually send an error message to client (if thats not already being done automatically)
    debugger
}

// gotta check if this even works
const asyncHandler = fn => (ws, req) => Promise.resolve(fn(ws, req)).catch(error)

server.on('connection', asyncHandler(async (ws, req) => {
    const user = await User.authenticate(req.headers['sec-websocket-protocol']?.trim())

    if (!user)
        return

    users[user.id] = user

    ws.on('message', message => {
        try {
            const { type, data } = JSON.parse(message)

            switch (type) {
                case undefined:
                    return
                case EventTypes.Alert:
                    console.log('alert')
                    ws.send(JSON.stringify({ type: 400, data: 'abcdef' }))
            }
        } catch (e) {
            console.log(e)
        }
    })

    ws.on('error', error)
    ws.send(JSON.stringify({ type: OutgoingMessageType.Ready }))
}))

