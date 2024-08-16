import express from 'express'
import { authenticate } from '../middleware/auth'
import { asyncHandler } from '../util/helpers'
const router = express.Router()

// still not sure about the forward slashes
export class EventRoutes {
    static received = '/received'
    static given = '/given'
}

router.get(EventRoutes.received, authenticate, asyncHandler(async (req, res) => {
    res.json(await req.user.getReceivedEvents())
}))

router.get(EventRoutes.given, authenticate, asyncHandler(async (req, res) => {
    res.json(await req.user.getGivenEvents())
}))

export default router