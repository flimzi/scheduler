import 'dotenv/config';
import express from 'express'
import authRoutes from './routes/auth.js'
import { sql } from './sql/helpers.js'
import { users } from './config/schema.js'
import { authenticate } from './middleware/auth.js';

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use('/api/auth', authRoutes)

// put general routes in separate router like authRoutes
app.get('/', (req, res) => {
    res.send('test')
})

app.get('/protected', authorize(3), (req, res) => {
    res.send(req.user.email)
})

app.listen(port, async () => {
    const x = await sql`SELECT ${users.id} FROM ${users} WHERE id = ${1} AND role = ${2}`

    console.log(`Server running on port ${port}`)
})