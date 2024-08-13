import 'dotenv/config'
import express from 'express'
import authRoutes from './routes/auth.js'
import mainRoutes, { Routes } from './routes/main.js'
import mssql from 'mssql'
import { Carer, User } from './schema/User.js'
import { sqlTransaction } from './sql/helpers.js'
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
    let html = `<a href="${process.env.WEBSITE}">forwards</a>`
    html += '<br>'
    html += '<a href="zwardon://open.app/verification?token=123123123">forwards</a>'

    await sqlTransaction(async t => {
        const carer = Carer.fake()
        delete carer.id
        delete carer.created_at
        const carer2 = Carer.fake()
        delete carer2.id
        delete carer2.created_at
        await t.sql`test test test`
        await t.sqlInsert(users, carer)
    })

    res.send(html)
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

app.listen(port, async () => {
    console.log(`Server running on port ${port}`)
})