import express from 'express'
import { query } from 'express-validator'
import { EventStates, EventTypes, RelationshipTypes } from '../interface/definitions.js'
import { related } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import events from '../schema/Events.js'
import { asyncHandler } from "../middleware/asyncHandler.js"
import { HttpStatus, HttpRequest } from '../util/http.js'
import { ApiRoutes } from './api.js'
import { UserRoutes } from './user.js'
import Event from '../models/Event.js'
const router = express.Router()

export class EventRoutes {
    static event = (userId, eventId = ':eventId') => UserRoutes.user(userId) + '/event/' + eventId
    static events = userId => UserRoutes.user(userId) + '/events'
    static tasks = userId => UserRoutes.user(userId) + '/tasks'
    static upcomingTasks = userId => this.tasks(userId) + '/upcoming'
    static missedTasks = userId => this.tasks(userId) + '/missed'
}

export class Parameters {
    static get giverId() { return 'giverId' }
    static get receiverId() { return 'receiverId' }
    static get type() { return 'type' }
    static get status() { return 'status' }
    static get startBefore() { return 'startBefore' }
    static get startAfter() { return 'startAfter' }
}

router.post(EventRoutes.events(), related(false, false, RelationshipTypes.Carer, RelationshipTypes.Owner), asyncHandler(async (req, res) => {
    const { id } = await req.user.addEventFor(req.targetUser, Event.from(req.body))
    res.status(HttpStatus.Created).location(EventRoutes.event(req.targetUser.id, id)).send(id.toString())
}))

export const postEvents = (accessToken, userId, event) => new HttpRequest(ApiRoutes.events(userId)).bearer(accessToken).json(event).post()

router.get(EventRoutes.event(), related(true, false, RelationshipTypes.Carer, RelationshipTypes.Owner), asyncHandler(async (req, res) => {
    const event = await events.getId(req.params.eventId)
    return event ? res.send(event) : res.send(HttpStatus.NotFound)
}))

export const getEvent = (accessToken, userId, eventId) => new HttpRequest(ApiRoutes.event(userId, eventId)).bearer(accessToken).fetch()

router.get(
    EventRoutes.upcomingTasks(),
    query(Parameters.giverId + '.*').toInt(),
    query(Parameters.startBefore).optional().toDate(),
    query(Parameters.startAfter).optional().toDate(),
    validate,
    related(true, false, RelationshipTypes.Carer, RelationshipTypes.Owner),
    asyncHandler(async (req, res) => {
        const query = {
            receiverId: req.targetUser.id,
            giverId: req.query[Parameters.giverId],
            startBefore: req.query[Parameters.startBefore],
            startAfter: req.query[Parameters.startAfter],
            type: EventTypes.Task,
            status: EventStates.Pending,
        }

        res.send(await events.query(query))
    })
)

export const getUpcomingTasks = (accessToken, userId, { giverId, startBefore, startAfter } = {}) => 
    new HttpRequest(ApiRoutes.upcomingTasks(userId))
        .bearer(accessToken)
        .query(Parameters.giverId, giverId)
        .query(Parameters.startBefore, startBefore)
        .query(Parameters.startAfter, startAfter)
        .fetch()

router.get(
    EventRoutes.missedTasks(),
    query(Parameters.giverId + '.*').toInt(),
    validate,
    related(true, false, RelationshipTypes.Carer, RelationshipTypes.Owner),
    asyncHandler(async (req, res) => {
        const query = {
            receiverId: req.targetUser.id,
            giverId: req.query[Parameters.giverId],
            type: EventTypes.Task,
            status: EventStates.Missed
        }

        res.send(await events.query(query))
    })
)

export const getMissedTasks = (accessToken, userId, giverId) =>
    new HttpRequest(ApiRoutes.missedTasks(userId))
        .bearer(accessToken)
        .query(Parameters.giverId, giverId)
        .fetch()

export default router