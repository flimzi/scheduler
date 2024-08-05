import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sql } from '../sql/helpers.js'
import users from '../schema/Users.js'
import { authenticate } from '../middleware/auth.js'
const router = express.Router()

router.post('/register', async (req, res) => {
    const { email, password, role } = req.body

    if (await users.exist(email))
        return res.sendStatus(409)

    await users.add(email, password, role)
    res.status(201).send()
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await users.get(email)

    if (user === undefined)
        return res.sendStatus(400)

    if (!await bcrypt.compare(password, user.password))
        return res.sendStatus(401)

    const token = {
        email: user.email,
        role: user.role
    }

    res.json(jwt.sign(token, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN }))
});

export default router




