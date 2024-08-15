import express from 'express'
import { authenticate, authorizeUser, authorizeCarerByRouteId } from '../middleware/auth.js'
import { asyncHandler } from '../util/helpers.js'
import { Http } from '../util/http.js'
import { Routes } from './main.js'
import users from '../schema/Users.js'
import { User, Carer, Patient } from '../models/users.js'
const router = express.Router()

export class UserRoutes {
    static currentUser = ''
    static user(id = ':id') { return UserRoutes.currentUser + '/' + id }
    static logout(id = ':id') { return UserRoutes.user(id) + '/logout' }
}

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

// fyi this needs to be authorized because access to other users shouldnt be possible in this program
router.get(UserRoutes.user(), authorizeCarerByRouteId, asyncHandler(async (req, res) => {
    res.json(req.targetUser.getInfo())
}))

router.delete(UserRoutes.user(), authorizeCarerByRouteId, asyncHandler(async (req, res) => {
    await req.targetUser.delete()
    res.send()
}))

router.get(UserRoutes.logout(), authorizeCarerByRouteId, asyncHandler(async (req, res) => {
    await res.targetUser.logoutAll()
    res.send()
}))

router.patch(UserRoutes.currentUser, authenticate, asyncHandler(async (req, res) => {
    const user = await User.from(req.body).getUpdateModel()
    await users.update(user)
    res.send()
}))

export default router
