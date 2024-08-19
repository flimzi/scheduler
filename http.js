import express from 'express'
import http from 'http'
import mssql from 'mssql'

import authRoutes from './routes/auth.js'
import mainRoutes, { Routes } from './routes/main.js'
import userRoutes from './routes/user.js'
import { ArgumentError } from './util/errors.js'
import { Http } from './util/http.js'

const app = express()
app.use(express.json())
app.use(express.static('public'))

app.use(Routes.auth, authRoutes)
app.use(Routes.currentUser, userRoutes)
app.use('', mainRoutes)

app.use((err, req, res, next) => {
    console.error(err)

    if (err instanceof ArgumentError) {
        res.status(err.status ?? Http.Status.BadRequest)
        res.send(err.message)
        return
    }

    if (err instanceof mssql.RequestError)
        console.error('query: ' + err.command)

    res.send(Http.Status.ServerError)
})

app.use((req, res, next) => res.send(Http.Status.NotFound))

const server = http.createServer(app)
export default server