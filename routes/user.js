import express from 'express'
import QRCode from 'qrcode'
import { RelationshipTypes } from '../interface/definitions.js'
import { authorizeCarerByRouteId, authorizeOwnerByRouteId, currentUserPlaceholder, maybeAuthenticate } from '../middleware/auth.js'
import User from '../models/User.js'
import { asyncHandler } from '../util/helpers.js'
import { HttpStatus, RouteRequest } from '../util/http.js'
import { sqlTransaction } from '../util/sql.js'
import { ApiRoutes } from './api.js'
const router = express.Router()

export class UserRoutes {
    static users = '/users'
    static user = (userId = ':userId') => '/user' + userId
    static qr = userId => this.user(userId) + '/qr'
    static logout = userId => this.user(userId) + '/logout'
    static logoutAll = userId => this.user(userId) + '/logoutAll'
}

// router.post(UserRoutes.users, authorizeUser(Carer), asyncHandler(async (req, res) => {
//     const { id } = await req.user.addPatient(req.body)
//     res.status(Http.Status.Created).location(UserRoutes.user(id)).send(id + '')
// }))

router.post(UserRoutes.users, maybeAuthenticate, asyncHandler(async (req, res) => {
    const { result } = await sqlTransaction(async t => {
        const targetUser = await User.from(req.body).add(t)
        await req.user?.relateToSecondary(targetUser, RelationshipTypes.Owner, t)
        return targetUser
    })

    if (!result)
        return res.send(HttpStatus.ServerError)
    
    res.status(HttpStatus.Created).location(UserRoutes.user(result.id)).send(result.id + '')
}))

export const postUsers = (accessToken, user) => new RouteRequest(ApiRoutes.users).bearer(accessToken).json(user).post()

router.get(UserRoutes.qr(), authorizeOwnerByRouteId, asyncHandler(async (req, res) => {
    res.send(await QRCode.toDataURL(await req.targetUser.generateAccessToken()))
}))

export const getQr = (accessToken, userId = currentUserPlaceholder) => new RouteRequest(ApiRoutes.qr(userId)).bearer(accessToken).fetch()

router.get(UserRoutes.user(), authorizeCarerByRouteId, asyncHandler(async (req, res) => {
    res.json(req.targetUser.getInfo())
}))

export const getUser = (accessToken, userId = currentUserPlaceholder) => new RouteRequest(ApiRoutes.user(userId)).bearer(accessToken).fetch()

router.delete(UserRoutes.user(), authorizeOwnerByRouteId, asyncHandler(async (req, res) => {
    await req.targetUser.delete()
    res.send()
}))

export const deleteUser = (accessToken, userId = currentUserPlaceholder) => new RouteRequest(ApiRoutes.user(userId)).bearer(accessToken).delete()

router.get(UserRoutes.logout(), authorizeOwnerByRouteId, asyncHandler(async (req, res) => {
    await req.targetUser.logout()
    res.send()
}))

export const logout = (accessToken, userId = currentUserPlaceholder) => new RouteRequest(ApiRoutes.logout(userId)).bearer(accessToken).fetch()

router.get(UserRoutes.logoutAll(), authorizeOwnerByRouteId, asyncHandler(async (req, res) => {
    await req.targetUser.logoutAll()
    res.send()
}))

export const logoutAll = (accessToken, userId = currentUserPlaceholder) => new RouteRequest(ApiRoutes.logoutAll(userId)).bearer(accessToken).fetch()

export default router
