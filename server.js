import 'dotenv/config'
import express from 'express'
import authRoutes from './routes/auth.js'
import mainRoutes, { MainRoutes } from './routes/main.js'
import patientRoutes from './routes/patient.js'
import { debounce } from './middleware/debounce.js'
import { Carer, User } from './schema/User.js'
import { sqlTransaction } from './sql/helpers.js'
import users from './schema/Users.js'

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.static('public'))

app.use(MainRoutes.auth, authRoutes)
app.use('/api/patient', patientRoutes)
app.use('', mainRoutes)

app.get('/', debounce(1000), async (req, res) => {
    let html = `<a href="${process.env.WEBSITE}">forwards</a>`
    html += '<br>'
    html += '<a href="zwardon://open.app/verification?token=123123123">forwards</a>'

    res.send(html)
})

app.use((err, req, res, next) => {
    console.error(err)
    res.sendStatus(500)

    // make sure this doesnt throw its own error when transaction has already been rolled back (test it)
    // if (req.transaction?.inProgress)
    //     req.transaction.rollback()

    // or like this maybe if no way to assign that property
    // req.transaction?.rollback().catch()
})

app.use((req, res, next) => res.sendStatus(404))

app.listen(port, async () => {
    console.log(`Server running on port ${port}`)

    await sqlTransaction(async r => {
        const carer = Carer.fake()
        delete carer.id
        delete carer.created_at
        const carer2 = Carer.fake()
        delete carer2.id
        delete carer2.created_at
        await r.sqlInsert(users, carer)
        // await r.sqlInsert(users, carer2)
    })
})