import express from 'express'
import { Http } from '../util/http.js'
import { asyncHandler } from '../util/helpers.js'
import strings from '../resources/strings.en.js'
import eventStream from '../middleware/eventStream.js'
import { AuthRoutes } from './auth.js'
import { UserRoutes } from './user.js'
const router = express.Router()

export class Routes {
    static api = '/api'
    static auth = this.api + '/auth'
    static currentUser = this.api + '/user'
    
    static get register() { return this.auth + AuthRoutes.register }
    static get login() { return this.auth + AuthRoutes.login }
    static get logoutCurrent() { return this.auth + AuthRoutes.logout }
    static get logoutAllCurrent() { return this.auth + AuthRoutes.logoutAll }
    
    static user(id) { return Routes.currentUser + UserRoutes.user(id) }
    
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

export default router