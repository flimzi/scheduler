import 'dotenv/config';
import express from 'express'
import authRoutes from './routes/auth.js'
import { sql } from './config/db.js'
import { users } from './config/schema.js'

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use('/api/auth', authRoutes)

app.get('/', (req, res) => {
    res.send('test')
})

app.listen(port, async () => {
    const x = await sql`SELECT ${users.id} FROM ${users} WHERE id = ${1} AND role = ${2}`

    console.log(`Server running on port ${port}`)
})