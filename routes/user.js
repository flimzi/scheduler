import express from 'express'
import { authenticate, authorizeOwnerByRouteId } from '../middleware/auth.js'
import { asyncHandler } from '../helpers.js'
import { Roles } from '../schema/Users.js'
import Patient from '../schema/Patient.js'
const router = express.Router()

export class UserRoutes {
    static currentUser = '/user'
    static user(id = ':id') { return '/user/' + id }
}

router.get(UserRoutes.currentUser, authenticate, asyncHandler(async (req, res) => {
    res.json(req.user.getInfo())
}))

router.delete(UserRoutes.currentUser, authenticate, asyncHandler(async (req, res) => {
    req.user.delete()
    res.send()
}))

// this needs to be authorized because access to other users shouldnt be possible in this program
router.get(UserRoutes.user(), authorizeOwnerByRouteId, asyncHandler(async (req, res) => {
    res.json(req.targetUser.getInfo())
}))

router.delete(UserRoutes.user(), authorizeOwnerByRouteId, asyncHandler(async (req, res) => {
    req.targetUser.delete()
    res.send()
}))

router.post(UserRoutes.currentUser, authorize(Roles.Carer), asyncHandler(async (req, res) => {
    const patient = req.body.as(Patient)
    
}))

export default router
