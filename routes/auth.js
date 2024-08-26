import express from 'express'
import { Carer, User } from '../models/users.js'
import { baseUrl } from '../util/helpers.js'
import { asyncHandler } from "../middleware/asyncHandler.js"
import { HttpStatus, HttpRequest } from '../util/http.js'
import { ApiRoutes } from './api.js'
const router = express.Router()

export class AuthRoutes {
    static get auth() { return '/auth' }
    static get login() { return this.auth + '/login' }
    static get verify() { return this.auth + '/verify' }
}

router.post(AuthRoutes.login, asyncHandler(async (req, res) => {
    res.send(await Carer.login(req.body) ?? HttpStatus.Unauthorized)
}))

export const login = ({ email, password }) => new HttpRequest(ApiRoutes.login).json({ email, password }).post()

router.post(AuthRoutes.verify, asyncHandler(async (req, res) => {
    if (!await User.verify(req.body.token))
        return res.sendStatus(403)

    res.send()
}))

export const verify = token => new HttpRequest(ApiRoutes.verify).post({ token }).post()

export default router