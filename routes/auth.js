import express from 'express'
import bcrypt from 'bcryptjs'
import users, { User, Roles } from '../schema/Users.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { debounce, debounceMinute, debounceSecond } from '../middleware/debounce.js'
import QRCode from 'qrcode'
import { isValidEmail, asyncHandler, isStrongPassword } from '../helpers.js'
import { Carer } from '../schema/User.js'
const router = express.Router()

export class AuthRoutes {
    static register = '/register'
    static login = '/login'
    static qr = '/qr'
    static logout = '/logout'
    static logoutAll = '/logoutAll'
    static verify = '/verify'
}

router.post(AuthRoutes.register, debounceSecond, asyncHandler(async (req, res) => {
    const carer = req.body.as(Carer)

    if (!isValidEmail(carer.email) || !isStrongPassword(carer.password))
        return res.sendStatus(400)

    if (await users.emailExists(carer.email))
        return res.sendStatus(409)
    
    await carer.register()
    return res.sendStatus(201)
}))

router.post(AuthRoutes.login, asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await users.getByEmail(email)

    if (!user?.verified)
        return res.send(401)

    if (!await bcrypt.compare(password, user.password))
        return res.send(401)

    res.json(await user.generateAccessToken())
}))

router.get(AuthRoutes.qr, authorize(Roles.Carer), asyncHandler(async (req, res) => {
    const { id } = req.query

    if (id === undefined)
        return res.send(400)

    const patient = await User.get(id)

    if (patient === undefined)
        return res.send(400)

    // todo check if req.user is the owner of user

    res.json(await QRCode.toDataURL(await patient.generateAccessToken()))
}))

router.get(AuthRoutes.logout, authenticate, asyncHandler(async (req, res) => {
    await req.user.logout()
    res.send(200)
}))

router.get(AuthRoutes.logoutAll, authenticate, asyncHandler(async (req, res) => {
    await req.user.logoutAll()
    res.send(200)
}))

router.post(AuthRoutes.verify, debounceSecond, asyncHandler(async (req, res) => {
    if (!await User.verify(req.body.token))
        return res.sendStatus(403)

    res.send()
}))

export default router