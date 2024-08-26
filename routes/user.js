import express from 'express'
import QRCode from 'qrcode'
import { RelationshipTypes } from '../interface/definitions.js'
import { currentUserPlaceholder, getCurrentUser, related } from '../middleware/auth.js'
import { debounceMinutes } from '../middleware/debounce.js'
import User from '../models/User.js'
import { asyncHandler } from "../middleware/asyncHandler.js"
import { HttpRequest, HttpStatus } from '../util/http.js'
import { sqlTransaction } from '../util/sql.js'
import { ApiRoutes } from './api.js'
const router = express.Router()

export class UserRoutes {
    static users = '/users'
    static user = (userId = ':userId') => '/user/' + userId
    static qr = userId => this.user(userId) + '/qr'
    static token = userId => this.user(userId) + '/token'
    static logout = userId => this.user(userId) + '/logout'
    static logoutAll = userId => this.user(userId) + '/logoutAll'
    static sendVerification = userId => this.user(userId) + '/sendVerification'
}

router.post(UserRoutes.users, getCurrentUser, asyncHandler(async (req, res) => {
    const { result } = await sqlTransaction(async t => {
        const targetUser = await User.from(req.body).add(t)
        await req.user?.relateToSecondary(targetUser, RelationshipTypes.Owner, t)
        return targetUser
    })

    if (!result)
        return res.send(HttpStatus.ServerError)
    
    res.status(HttpStatus.Created).location(UserRoutes.user(result.id)).send(result.id + '')
}))

export const postUsers = (accessToken, user) => new HttpRequest(ApiRoutes.users).bearer(accessToken).json(user).post()

router.get(UserRoutes.token(), related(false, false, RelationshipTypes.Owner), asyncHandler(async (req, res) => {
    res.send(await req.targetUser.generateAccessToken())
}))

export const getToken = (accessToken, userId = currentUserPlaceholder) => new HttpRequest(ApiRoutes.token(userId)).bearer(accessToken).fetch()

router.get(UserRoutes.qr(), related(false, false, RelationshipTypes.Owner), asyncHandler(async (req, res) => {
    res.send(await QRCode.toDataURL(await req.targetUser.generateAccessToken()))
}))

export const getQr = (accessToken, userId = currentUserPlaceholder) => new HttpRequest(ApiRoutes.qr(userId)).bearer(accessToken).fetch()

router.get(UserRoutes.user(), related(true, true, RelationshipTypes.Owner, RelationshipTypes.Carer), asyncHandler(async (req, res) => {
    res.json(req.targetUser.getInfo())
}))

export const getUser = (accessToken, userId = currentUserPlaceholder) => new HttpRequest(ApiRoutes.user(userId)).bearer(accessToken).fetch()

router.delete(UserRoutes.user(), related(true, false, RelationshipTypes.Owner), asyncHandler(async (req, res) => {
    await req.targetUser.delete()
    res.send()
}))

export const deleteUser = (accessToken, userId = currentUserPlaceholder) => new HttpRequest(ApiRoutes.user(userId)).bearer(accessToken).delete()

router.get(UserRoutes.logout(), related(true, false, RelationshipTypes.Owner), asyncHandler(async (req, res) => {
    await req.targetUser.logout()
    res.send()
}))

export const logout = (accessToken, userId = currentUserPlaceholder) => new HttpRequest(ApiRoutes.logout(userId)).bearer(accessToken).fetch()

router.get(UserRoutes.logoutAll(), related(true, false, RelationshipTypes.Owner), asyncHandler(async (req, res) => {
    await req.targetUser.logoutAll()
    res.send()
}))

export const logoutAll = (accessToken, userId = currentUserPlaceholder) => new HttpRequest(ApiRoutes.logoutAll(userId)).bearer(accessToken).fetch()

router.get(UserRoutes.sendVerification(), debounceMinutes(5), related(true, false, RelationshipTypes.Owner), asyncHandler(async (req, res) => {
    await req.targetUser.sendVerificationEmail()
    res.send()
}))

export const sendVerification = (accessToken, userId = currentUserPlaceholder) => new HttpRequest(ApiRoutes.sendVerification(userId)).bearer(accessToken).fetch()

export default router
