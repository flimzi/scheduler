import express from 'express'
import bcrypt from 'bcryptjs'
import QRCode from 'qrcode'
import users from '../schema/Users.js'
import { authenticate, authorizeCarerByRouteId } from '../middleware/auth.js'
import { debounceSecond } from '../middleware/debounce.js'
import { asyncHandler } from '../util/helpers.js'
import { User, Carer } from '../models/users.js'
import { Routes } from './main.js'
import { Http } from '../util/http.js'
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
    const { id } = await req.body.cast(Carer).register()
    return res.status(201).location(Routes.user(id)).send(id + '')
}))

router.post(AuthRoutes.login, asyncHandler(async (req, res) => {
    res.send(await Carer.login(req.body) ?? Http.Status.Unauthorized)
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