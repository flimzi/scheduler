import express from 'express'
import { Http, Status } from '../util/http.js'
import { asyncHandler } from '../util/helpers.js'
import { validate } from "../middleware/validate.js"
import strings from '../resources/strings.en.js'
import eventStream from '../middleware/eventStream.js'
import { AuthRoutes } from './auth.js'
import { UserRoutes } from './user.js'
import { authenticate } from '../middleware/auth.js'
import { body, query } from 'express-validator'
import FCM from '../firebase/FCM.js'
const router = express.Router()

export class Routes {
    static api = '/api'
    static auth = this.api + '/auth'
    static currentUser = this.api + '/user'
    static fcm = this.api + '/fcm'
    
    static get register() { return this.auth + AuthRoutes.register }
    static get loginCurrent() { return this.auth + AuthRoutes.login }
    static get logoutCurrent() { return this.auth + AuthRoutes.logout }
    static get logoutAllCurrent() { return this.auth + AuthRoutes.logoutAll }
    static get fcmToken() { return this.auth + AuthRoutes.fcmToken }
    
    static login(id) { return this.currentUser + UserRoutes.login(id) }
    static logout(id) { return this.currentUser + UserRoutes.logout(id) }
    static user(id) { return this.currentUser + UserRoutes.user(id) }
    static get fcmTest() { return this.currentUser + UserRoutes.fcmTest }
    
    static verification = '/verification'
}

router.get(Routes.verification, eventStream, asyncHandler(async (req, res) => {
    const token = req.query.token

    if (!token)
        return res.sendStatus(400)

    res.write(strings.verifying + '\n')

    await new Promise(r => setTimeout(r, 2500))
    const response = await Http.postJson(req.baseUrl(MainRoutes.auth + AuthRoutes.verify), { token })
    response.onSuccess(r => res.write(strings.verificationSuccess))
    response.unhandled(r => res.write(strings.verificationFailure))

    res.end()
}))

// this should honestly authorize based on a permission
router.post(Routes.fcm, query('token').notEmpty(), query('repeat').default(0).isInt(), body().isObject(), validate, authenticate, asyncHandler(async (req, res) => {
    const { token, repeat } = req.query
    
    for (let i = 0; i <= repeat; i++)
        setTimeout(() => FCM.message(token, { data: req.body }), i * 2500)
    
    res.send() // response.passthrough(res)
}))

export default router