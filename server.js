import 'dotenv/config'
import express from 'express'
import mssql from 'mssql'
import http from 'http'
import WebSocket from 'ws'

import authRoutes from './routes/auth.js'
import mainRoutes, { Routes } from './routes/main.js'
import { Carer, User } from './schema/User.js'
import { sqlTransaction, sqlUpdate } from './sql/helpers.js'
import users from './schema/Users.js'
import { ArgumentError, asyncHandler, Http } from './helpers.js'
import userRoutes from './routes/user.js'

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.static('public'))

app.use(Routes.auth, authRoutes)
app.use(Routes.currentUser, userRoutes)
app.use('', mainRoutes)

app.get('/', asyncHandler(async (req, res) => {

}))

app.use((req, res, next) => res.sendStatus(404))

app.use((err, req, res, next) => {
    console.error(err)

    if (err instanceof mssql.RequestError)
        console.error('query: ' + err.command)

    if (err instanceof ArgumentError) {
        res.send(Http.Status.BadRequest)
        return
    }

    res.send(Http.Status.ServerError)
})

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

server.listen(port, async () => {
    console.log(`Server running on port ${port}`)

    // run sample tests
})