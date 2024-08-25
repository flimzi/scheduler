import express from 'express'
import { query } from 'express-validator'
import { EventStatus, EventTypes } from '../interface/definitions.js'
import { authorizeCarerByRouteId } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import events from '../schema/Events.js'
import { asyncHandler, toIntArray } from '../util/helpers.js'
import { HttpStatus, RouteRequest } from '../util/http.js'
import { ApiRoutes } from './api.js'
import { UserRoutes } from './user.js'
const router = express.Router()

export class EventRoutes {
    static event = (userId, eventId = 'eventId') => UserRoutes.user(userId) + '/event/' + eventId
    static events = userId => UserRoutes.user(userId) + '/events'
    static tasks = userId => UserRoutes.user(userId) + '/tasks'
    static upcomingTasks = userId => this.tasks(userId) + '/upcoming'
    static missedTasks = userId => this.tasks(userId) + '/missed'
}

export class Validations {
    static eventId = () => param('eventId').isInt({ min: 0 }).toInt()
    static giverId = () => query('giverId').optional().customSanitizer(toIntArray)
    static startBefore = () => query('startBefore').optional().isDate().toDate()
    static startAfter = () => query('startAfter').optional().isDate().toDate()
    static receiverId = () => query('receiverId').optional().customSanitizer(toIntArray)
    static type = () => query('type').optional().customSanitizer(toIntArray)
    static status = () => query('status').optional().customSanitizer(toIntArray)
}

router.post(EventRoutes.events(), authorizeCarerByRouteId, asyncHandler(async (req, res) => {
    const event = await Event.from(req.body).add()
    res.status(HttpStatus.Created).location(EventRoutes.event(req.targetUser.id, event.id)).send(event)
}))

export const postEvents = (accessToken, userId, event) => new RouteRequest(ApiRoutes.events(userId)).bearer(accessToken).json(event).post()

router.get(EventRoutes.event(), authorizeCarerByRouteId, asyncHandler(async (req, res) => {
    const event = await events.getId(req.params.eventId)
    return event ? res.send(event) : res.send(HttpStatus.NotFound)
}))

export const getEvent = (accessToken, userId, eventId) => new RouteRequest(ApiRoutes.event(userId, eventId)).bearer(accessToken).fetch()

router.get(
    EventRoutes.upcomingTasks(),
    Validations.giverId(),
    Validations.startBefore(),
    Validations.startAfter(),
    validate,
    authorizeCarerByRouteId,
    asyncHandler(async (req, res) => {
        const query = {
            receiverId: req.targetUser.id,
            giverId: req.query.giverId,
            startBefore: req.query.startBefore,
            startAfter: req.query.startAfter,
            type: EventTypes.Task,
            status: EventStatus.Pending,
        }

        res.send(await events.query(query))
    })
)

router.get(
    EventRoutes.missedTasks(),
    Validations.giverId(),
    validate,
    authorizeCarerByRouteId,
    asyncHandler(async (req, res) => {
        const query = {
            receiverId: req.targetUser.id,
            giverId: req.query.giverId,
            type: EventTypes.Task,
            status: EventStatus.Missed
        }

        res.send(await events.query(query))
    })
)

export default router