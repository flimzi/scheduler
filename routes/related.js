import express from 'express'
import { UserRoutes } from './user.js'
import { authorizeCarerByRouteId } from '../middleware/auth.js'
import { joinInts, toIntArray } from '../util/helpers.js'
import { asyncHandler } from "../middleware/asyncHandler.js"
import { validate } from '../middleware/validate.js'
import { query } from 'express-validator'
import { HttpRequest } from '../util/http.js'
import { ApiRoutes } from './api.js'
const router = express.Router()

export class RelatedRoutes {
    static related = userId => UserRoutes.user(userId) + '/related'
    static primary = userId => this.related(userId) + '/primary'
    static secondary = userId => this.related(userId) + '/secondary'
}

export class Validations {
    static type = () => query('type').optional().customSanitizer(toIntArray)
}

router.get(
    RelatedRoutes.primary(), 
    Validations.type(),
    validate,
    authorizeCarerByRouteId, 
    asyncHandler(async (req, res) => res.send(await req.targetUser.getPrimaries(joinInts(req.query.type))))
)

export const getPrimary = (accessToken, userId, ...types) => 
    new HttpRequest(ApiRoutes.relatedPrimary(userId))
        .bearer(accessToken)
        .query('type', joinInts(types))
        .fetch()

router.get(
    RelatedRoutes.secondary(),
    Validations.type(),
    validate,
    authorizeCarerByRouteId,
    asyncHandler(async (req, res) => res.send(await req.targetUser.getSecondaries(joinInts(req.query.type))))
)

export const getSecondary = (accessToken, userId, ...types) =>
    new HttpRequest(ApiRoutes.relatedSecondary(userId))
        .bearer(accessToken)
        .query('type', joinInts(types))
        .fetch()

export default router