import 'dotenv/config'
import express from 'express'
import authRoutes from './routes/auth.js'
import mainRoutes, { MainRoutes } from './routes/main.js'
import patientRoutes from './routes/patient.js'
import mssql from 'mssql'
import { Carer, User } from './schema/User.js'
import { sqlTransaction } from './sql/helpers.js'
import users from './schema/Users.js'
import { asyncHandler, Http } from './helpers.js'

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.static('public'))

app.use(MainRoutes.auth, authRoutes)
app.use('/api/patient', patientRoutes)
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
        await t.sqlInsert(users, carer)
        await t.sql`test test test`
    })

    res.send(html)
}))

app.use((req, res, next) => res.sendStatus(404))

app.use((err, req, res, next) => {
    console.error(err)

    if (err instanceof mssql.RequestError)
        console.error(err.command)

    res.send(Http.Status.ServerError)
})

app.listen(port, async () => {
    console.log(`Server running on port ${port}`)
})