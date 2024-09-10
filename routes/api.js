import express from 'express'
import { AuthRoutes } from './auth.js'
import { EventRoutes } from './event.js'
import { FCMRoutes } from './fcm.js'
import { RelatedRoutes } from './related.js'
import { UserRoutes } from './user.js'
import { VerificationRoutes } from './verification.js'
import { DrugRoutes } from './drug.js'
const router = express.Router()

export class ApiRoutes {
    static api = '/api'

    static get login() { return this.api + AuthRoutes.login }
    static get logout() { return this.api + AuthRoutes.logout }

    static get users() { return this.api + UserRoutes.users }
    static user = userId => this.api + UserRoutes.user(userId)
    static qr = userId => this.api + UserRoutes.qr(userId)
    static token = userId => this.api + UserRoutes.token(userId)
    static logoutAll = userId => this.api + UserRoutes.logoutAll(userId)

    static parents = userId => this.api + RelatedRoutes.parents(userId)
    static children = userId => this.api + RelatedRoutes.children(userId)

    static event = (userId, eventId) => this.api + EventRoutes.event(userId, eventId)
    static events = userId => this.api + EventRoutes.events(userId)
    static upcomingTasks = userId => this.api + EventRoutes.upcomingTasks(userId)
    static missedTasks = userId => this.api + EventRoutes.missedTasks(userId)

    static get verification() { return this.api + VerificationRoutes.verification }
    static get sendVerification() { return this.api + VerificationRoutes.send }

    static get fcmToken() { return this.api + FCMRoutes.token }
    static get sendFCM() { return this.api + FCMRoutes.send }
    static get confirmFCM() { return this.api + FCMRoutes.confirm }

    static drugs = userId => this.api + DrugRoutes.drugs(userId)
}

export default router