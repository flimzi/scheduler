import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sql } from '../sql/helpers.js'
import { users, carers } from '../schema/Users.js'
import { authenticate, authorize } from '../middleware/auth.js'
import Roles from '../schema/Roles.js'
import QRCode from 'qrcode'
import asyncHandler from './asyncHandler.js'
const router = express.Router()

// put routes in object maybe
router.post('/register', async (req, res) => {
    const { email, password } = req.body

    if (await users.emailExists(email))
        return res.sendStatus(409)

    await carers.add(email, password)
    return res.sendStatus(201)
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await users.getByEmail(email)

    if (user === undefined)
        return res.sendStatus(400)

    if (!await bcrypt.compare(password, user.password))
        return res.sendStatus(401)

    // this should probably be the whole user object if space permits
    const token = {
        id: user.id,
        email: user.email,
        role: user.role
    }

    res.json(jwt.sign(token, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN }))
})

router.get('/qr', /* authorize(Roles.Carer), */asyncHandler(async (req, res) => {
    // todo check if provided user id is owned by current user (carer)
    const { id } = req.query

    if (id === undefined)
        return res.send(400)

    const user = await users.get(id)
    // also manage a device footprint
    const token = {
        id: user.id,
        role: user.role
    }

    throw new Error('test')

    const signed = jwt.sign(token, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
    res.json(await QRCode.toDataURL(signed))
}))

export default router




