import 'dotenv/config';
import express from 'express'
import authRoutes from './routes/auth.js'
import mainRoutes from './routes/main.js'
import { debounce } from './middleware/debounce.js';

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.static('public'))

app.use('/api/auth', authRoutes)
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
})

app.use((req, res, next) => res.sendStatus(404))

app.listen(port, async () => {
    console.log(`Server running on port ${port}`)
})