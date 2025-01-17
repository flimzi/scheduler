import express from 'express'
import { Carer, User } from '../models/users.js'
import { baseUrl } from '../util/helpers.js'
import { asyncHandler } from "../middleware/asyncHandler.js"
import { HttpStatus, HttpRequest } from '../util/http.js'
import { ApiRoutes } from './api.js'
import { authenticate } from '../middleware/auth.js'
const router = express.Router()

export class AuthRoutes {
    static get auth() { return '/auth' }
    static get login() { return this.auth + '/login' }
    static get logout() { return this.auth + '/logout' }
    static get verify() { return this.auth + '/verify' }
}

router.post(AuthRoutes.login, asyncHandler(async (req, res) => {
    res.send(await User.login(req.body) ?? HttpStatus.Unauthorized)
}))

const login = ({ email, password }) => new HttpRequest(ApiRoutes.login).json({ email, password }).post()

router.get(AuthRoutes.logout, authenticate, asyncHandler(async (req, res) => {
    await req.user.logout()
    res.send()
}))

const logout = accessToken => new HttpRequest(ApiRoutes.logout).bearer(accessToken).fetch()

router.post(AuthRoutes.verify, asyncHandler(async (req, res) => {
    if (!await User.verify(req.body.token))
        return res.sendStatus(403)

    res.send()
}))

const verify = token => new HttpRequest(ApiRoutes.verify).post({ token }).post()

export const authActions = { login, logout, verify }
export default router

