import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sql } from '../sql/helpers.js'
import users, { User, Roles } from '../schema/Users.js'
import { authenticate, authorize } from '../middleware/auth.js'
import QRCode from 'qrcode'
import asyncHandler from './asyncHandler.js'
const router = express.Router()

// put routes in object maybe
router.post('/register', async (req, res) => {
    const user = req.body.as(User)

    // here i guess what should remain is the validation logic but i wouldnt really send any messages because the front end needs to validate form input as well
    if (!user.email || !user.password)
        return res.sendStatus(400)

    if (await users.emailExists(user.email))
        return res.sendStatus(409)
    
    await user.registerCarer()
    return res.sendStatus(201)
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await users.getByEmail(email)

    if (user === undefined)
        return res.sendStatus(400)

    if (!await bcrypt.compare(password, user.password))
        return res.sendStatus(401)

    res.json(await user.generateAccessToken())
})

// careful with this because generating a token implicitly logs the patient out
router.get('/qr', authorize(Roles.Carer), asyncHandler(async (req, res) => {
    const { id } = req.query

    if (id === undefined)
        return res.send(400)

    const patient = await users.get(id)

    if (patient === undefined)
        return res.send(400)

    // todo check if req.user is the owner of user

    res.json(await QRCode.toDataURL(await patient.generateAccessToken()))
}))

router.get('/logout', authenticate, asyncHandler(async (req, res) => {
    req.user?.logout()
    res.send(200)
}))

router.get('/verify', authenticate, asyncHandler(async (req, res) => {
    if (!req.user?.verify(req.query.token))
        return res.sendStatus(403)

    res.send()
}))

export default router