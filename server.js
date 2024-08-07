import 'dotenv/config';
import express from 'express'
import authRoutes from './routes/auth.js'
import { sql } from './sql/helpers.js'
import users from './schema/Users.js'
import { authorize } from './middleware/auth.js';
import transporter from './config/mail.js';

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use('/api/auth', authRoutes)

// put general routes in separate router like authRoutes
app.get('/', async (req, res) => {
    const mailOptions = {
        to: 'ffgil',
        subject: 'Wyjebało w kosmos słonia',
        html: '<p>email wysłany za pośrednictwem aplikacji Zwardon</p>'
    }

    const response = await transporter.sendMail(mailOptions)
    res.send()
})

app.get('/protected', authorize(3), (req, res) => {
    res.send(req.user.email)
})

app.use((err, req, res) => {
    console.error(err)
    res.sendStatus(500)
})

app.listen(port, async () => {
    const x = await sql`SELECT ${users.id} FROM ${users} WHERE id = ${1} AND role = ${2}`

    console.log(`Server running on port ${port}`)
})