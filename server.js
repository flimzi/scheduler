import 'dotenv/config'
import express from 'express'
import http from 'http'
import mssql from 'mssql'
import './util/extensions.js'
import './util/conversions.js'

import authRoutes from './routes/auth.js'
import mainRoutes, { Routes } from './routes/main.js'
import userRoutes from './routes/user.js'
import * as tests from './tests/auth.mjs'
import { asyncHandler } from './util/helpers.js'
import { Http } from './util/http.js'
import Carer from './models/Carer.js'

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.static(process.env.PUBLIC))

app.use(Routes.auth, authRoutes)
app.use(Routes.currentUser, userRoutes)
app.use('', mainRoutes)

app.get('/', asyncHandler(async (req, res) => {

}))

app.use((req, res, next) => res.send(Http.Status.NotFound))

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

server.listen(port, async () => {
    console.log(`Server running on port ${port}`)
    await tests.carerActions1()
})