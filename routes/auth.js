import express from 'express'
import { Carer, User } from '../models/users.js'
import { asyncHandler, baseUrl } from '../util/helpers.js'
import { HttpStatus, HttpRequest } from '../util/http.js'
import { ApiRoutes } from './api.js'
const router = express.Router()

export class AuthRoutes {
    static login = '/login'
    static verify = '/verify'
}

// router.post(AuthRoutes.register, debounceSecond, asyncHandler(async (req, res) => {
//     // const { id } = await req.body.cast(Carer).add()
//     // return res.status(201).location(ApiRoutes.user(id)).send(id + '')

//     const { id } = await User.from(req.body).add()
//     return res.status(HttpStatus.Created).location(ApiRoutes.user(id)).send(id + '')
// }))

// export const register = user => new HttpRequest(baseUrl(ApiRoutes.register)).json(user).post()

router.post(AuthRoutes.login, asyncHandler(async (req, res) => {
    res.send(await Carer.login(req.body) ?? HttpStatus.Unauthorized)
}))

export const login = ({ email, password }) => new HttpRequest(baseUrl(ApiRoutes.login)).json({ email, password }).post()

router.post(AuthRoutes.verify, asyncHandler(async (req, res) => {
    if (!await User.verify(req.body.token))
        return res.sendStatus(403)

    res.send()
}))

export const verify = token => new HttpRequest(baseUrl(ApiRoutes.verify)).post({ token }).post()

export default router