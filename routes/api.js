import express from 'express'
import { body, query } from 'express-validator'
import FCM from '../firebase/FCMessaging.js'
import { authenticate } from '../middleware/auth.js'
import eventStream from '../middleware/eventStream.js'
import { validate } from "../middleware/validate.js"
import strings from '../resources/strings.en.js'
import { asyncHandler } from '../util/helpers.js'
import { AuthRoutes } from './auth.js'
import { UserRoutes } from './user.js'
import { RelatedRoutes } from './related.js'
import { EventRoutes } from './event.js'
const router = express.Router()

export class ApiRoutes {
    static api = '/api'
    static fcm = this.api + '/fcm'
    static verification = this.api + '/verification'

    static get auth() { return this.api + '/auth' }
    static get register() { return this.auth + AuthRoutes.register }
    static get login() { return this.auth + AuthRoutes.login }
    static get verify() { return this.auth + AuthRoutes.verify }

    static get users() { return this.api + UserRoutes.users }
    static user = userId => this.api + UserRoutes.user(userId)
    static qr = userId => this.api + UserRoutes.qr(userId)
    static logout = userId => this.api + UserRoutes.logout(userId)
    static logoutAll = userId => this.api + UserRoutes.logoutAll(userId)

    static relatedPrimary = userId => this.api + RelatedRoutes.primary(userId)
    static relatedSecondary = userId => this.api + RelatedRoutes.secondary(userId)

    static event = (userId, eventId) => this.api + EventRoutes.event(userId, eventId)
    static events = userId => this.api + EventRoutes.events(userId)
    static upcomingTasks = userId => this.api + EventRoutes.upcomingTasks(userId)
    static missedTasks = userId => this.api + EventRoutes.missedTasks(userId)
}

router.get(ApiRoutes.verification, eventStream, asyncHandler(async (req, res) => {
    const token = req.query.token

    if (!token)
        return res.sendStatus(400)

    res.write(strings.verifying + '\n')

    await new Promise(r => setTimeout(r, 2500))
    // const response = await Http.postJson(req.baseUrl(ApiRoutes.auth + AuthRoutes.verify), { token })
    response.onSuccess(r => res.write(strings.verificationSuccess))
    response.unhandled(r => res.write(strings.verificationFailure))

    res.end()
}))

// this should honestly authorize based on a permission
router.post(ApiRoutes.fcm, query('token').notEmpty(), query('repeat').default(0).isInt(), body().isObject(), validate, authenticate, asyncHandler(async (req, res) => {
    const { token, repeat } = req.query
    
    for (let i = 0; i <= repeat; i++)
        setTimeout(() => FCM.message(token, { data: req.body }), i * 2500)
    
    res.send() // response.passthrough(res)
}))

export default router