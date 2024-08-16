import express from 'express'
import QRCode from 'qrcode'
import { authenticate, authorizeUser, authorizeCarerByRouteId, authorizeOwnerByRouteId } from '../middleware/auth.js'
import { asyncHandler } from '../util/helpers.js'
import { Http } from '../util/http.js'
import { Routes } from './main.js'
import users from '../schema/Users.js'
import { User, Carer, Patient } from '../models/users.js'
import { RelationshipTypes } from '../util/definitions.js'
import events from '../schema/Events.js'
import Event from '../models/Event.js'
const router = express.Router()

export class UserRoutes {
    static currentUser = ''
    static user(id = ':id') { return this.currentUser + '/' + id }
    static login(id = ':id') { return this.user(id) + '/login' }
    static qr(id = ':id') { return this.user(id) + '/qr' }
    static logout(id = ':id') { return this.user(id) + '/logout' }
    static userEvent(id = ':id') { return this.user(id) + '/event' }
    static primaryCurrent = this.currentUser + '/primary'
    static secondaryCurrent = this.currentUser + '/secondary'
}

router.patch(UserRoutes.currentUser, authenticate, asyncHandler(async (req, res) => {
    const user = await User.from(req.body).getUpdateModel()
    user.id = req.user.id
    await users.update(user)
    res.send()
}))

// test (maybe change to getrelated and only one route for brevity)
router.get(UserRoutes.primaryCurrent, authenticate, asyncHandler(async (req, res) => {
    const relationshipTypes = req.query.type?.split(',').filter(t => RelationshipTypes.isValid(+t))
    res.json(await req.user.getPrimaries(relationshipTypes))
}))

router.get(UserRoutes.secondaryCurrent, authenticate, asyncHandler(async (req, res) => {
    const relationshipTypes = req.query.type?.split(',').filter(t => RelationshipTypes.isValid(+t))
    res.json(await req.user.getSecondaries(relationshipTypes))
}))

router.get(UserRoutes.currentUser, authenticate, asyncHandler(async (req, res) => {
    // res.json(req.user.getInfo())
    req.user.fetch().then(u => res.json(u.getInfo()))
}))

router.delete(UserRoutes.currentUser, authenticate, asyncHandler(async (req, res) => {
    await req.user.delete()
    res.send()
}))

router.post(UserRoutes.currentUser, authorizeUser(Carer), asyncHandler(async (req, res) => {
    const { id } = await req.user.addPatient(req.body)
    res.status(Http.Status.Created).location(Routes.user(id)).send(id + '')
}))

// route parameter routes need to be after the static ones, the order is important
router.get(UserRoutes.login(), authorizeOwnerByRouteId, asyncHandler(async (req, res) => {
    res.send(await req.targetUser.generateAccessToken())
}))

router.get(UserRoutes.qr(), authorizeOwnerByRouteId, asyncHandler(async (req, res) => {
    res.send(await QRCode.toDataURL(await req.targetUser.generateAccessToken()))
}))

router.get(UserRoutes.user(), authorizeCarerByRouteId, asyncHandler(async (req, res) => {
    res.json(req.targetUser.getInfo())
}))

router.delete(UserRoutes.user(), authorizeOwnerByRouteId, asyncHandler(async (req, res) => {
    await req.targetUser.delete()
    res.send()
}))

router.get(UserRoutes.logout(), authorizeOwnerByRouteId, asyncHandler(async (req, res) => {
    await res.targetUser.logoutAll()
    res.send()
}))

router.post(UserRoutes.userEvent(), authorizeCarerByRouteId, asyncHandler(async (req, res) => {
    // this is going to need to be abstracted because we need to put it on websocket as well
    const event = await req.body.cast(Event).getUpdateModel()
    event.id = req.user.id
    const { id } = await events.add(event)
    res.status(Http.Status.Created).send(id)
}))

export default router
