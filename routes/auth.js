import express from 'express'
import bcrypt from 'bcryptjs'
import users from '../schema/Users.js'
import { authenticate, authorizeCarerByRouteId } from '../middleware/auth.js'
import { debounceSecond } from '../middleware/debounce.js'
import QRCode from 'qrcode'
import { asyncHandler } from '../helpers.js'
import { User, Carer } from '../schema/User.js'
const router = express.Router()

export class AuthRoutes {
    static register = '/register'
    static login = '/login'
    static qr(id = ':id') { return '/qr/' + id }
    static logout = '/logout'
    static logoutAll = '/logoutAll'
    static verify = '/verify'
}

router.post(AuthRoutes.register, debounceSecond, asyncHandler(async (req, res) => {
    const carer = req.body.as(Carer)
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


router.get(AuthRoutes.qr(), authorizeCarerByRouteId, asyncHandler(async (req, res) => {
    res.json(await QRCode.toDataURL(await req.targetUser.generateAccessToken()))
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