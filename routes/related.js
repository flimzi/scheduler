import express from 'express'
import { UserRoutes } from './user.js'
import { authenticate, disallowSelf, getTargetUser, related } from '../middleware/auth.js'
import { asyncHandler } from "../middleware/asyncHandler.js"
import { validate } from '../middleware/validate.js'
import { body, query } from 'express-validator'
import { HttpRequest, HttpStatus } from '../util/http.js'
import { ApiRoutes } from './api.js'
import { RelationshipTypes } from '../interface/definitions.js'
import User from '../models/User.js'
const router = express.Router()

export class RelatedRoutes {
    static related = userId => UserRoutes.user(userId) + '/related'
    static primary = userId => this.related(userId) + '/primary'
    static secondary = userId => this.related(userId) + '/secondary'
}

class Validations {
    static types = (...except) => query('type.*').isIn(RelationshipTypes.values(...except))
    static type = (...except) => query('type').isIn(RelationshipTypes.values(...except))
}

router.get(
    RelatedRoutes.primary(), 
    validate(Validations.types()),
    related(true, false, RelationshipTypes.Owner), 
    asyncHandler(async (req, res) => res.send(await req.targetUser.getPrimary(req.query.type)))
)

const getPrimary = (accessToken, userId, ...types) => 
    new HttpRequest(ApiRoutes.relatedPrimary(userId))
        .bearer(accessToken)
        .query('type', types)
        .fetch()


router.post(
    RelatedRoutes.primary(),
    validate(Validations.type(RelationshipTypes.Owner), body().isJWT()),
    authenticate,
    getTargetUser,
    disallowSelf,
    asyncHandler(async (req, res) => {
        const secondary = await User.authenticate(req.body)

        if (secondary?.id !== req.targetUser.id)
            return res.send(HttpStatus.NotFound)

        await secondary.relateToPrimary(req.user, req.query.type)
        res.send()
    })
)

const postPrimary = (accessToken, userId, secondaryAccessToken, type) =>
    new HttpRequest(ApiRoutes.relatedPrimary(userId))
        .bearer(accessToken)
        .text(secondaryAccessToken)
        .query('type', type)
        .post()

router.get(
    RelatedRoutes.secondary(),
    validate(Validations.types()),
    related(true, false, RelationshipTypes.Owner),
    asyncHandler(async (req, res) => res.send(await req.targetUser.getSecondary(req.query.type)))
)

const getSecondary = (accessToken, userId, ...types) =>
    new HttpRequest(ApiRoutes.relatedSecondary(userId))
        .bearer(accessToken)
        .query('type', types)
        .fetch()

export const relatedActions = { getPrimary, postPrimary, getSecondary }
export default router