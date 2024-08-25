import { User } from '../models/users.js'
import relationships from '../schema/Relationships.js'
import users from '../schema/Users.js'
import { RelationshipTypes } from '../interface/definitions.js'
import { asyncHandler, getBearer, isJWT } from '../util/helpers.js'
import { HttpStatus } from '../util/http.js'
import check from 'check-types'

const tryAuthenticate = optional => asyncHandler(async (req, res, next) => {
    const token = getBearer(req)

    if (!isJWT(token)) {
        if (optional)
            return next()

        return res.sendStatus(HttpStatus.Unauthorized)
    }

    req.user = await User.authenticate(token)

    if (!req.user)
        return res.sendStatus(HttpStatus.Forbidden)

    next()
})

export const authenticate = tryAuthenticate()
export const maybeAuthenticate = tryAuthenticate(true)

export const authorize = (...roles) => (req, res, next) => {
    authenticate(req, res, () => {
        if (!roles.includes(req.user.role))
            return res.sendStatus(HttpStatus.Unauthorized)
    
        next()
    })
}

export const authorizeUser = type => (req, res, next) => {
    authenticate()(req, res, () => {
        if (!req.user instanceof type)
            return res.sendStatus(HttpStatus.Unauthorized)

        next()
    })
}

export const currentUserPlaceholder = 'current'

// export const getCurrentTargetUser = (req, res, next) => {
//     if (!req.user)
//         return res.send(Status.Unauthorized)

//     if (req.targetUser)
//         return next()

//     let { id } = req.params
    
//     if (id === currentUserPlaceholder || Number(id) === req.user.id)
//         req.targetUser = req.user
    
//     next()
// }

// todo handle errors (asyncHandler doesnt seem to work)
// this could be getCurrentTargetUser -> getRouteTargetUser -> authorizePrimary for more granularity
export const authorizePrimaryByRouteId = (allowSelf, ...relationshipTypes) => (req, res, next) => {
    authenticate(req, res, async () => {
        let { userId } = req.params

        if (userId === currentUserPlaceholder)
            userId = req.user.id

        if (!allowSelf && Number(userId) === req.user.id)
            return res.send(HttpStatus.Unauthorized)

        if (check.integer(Number(userId)))
            req.targetUser = await users.getId(userId)

        if (!req.targetUser)
            return res.send(HttpStatus.NotFound)

        if (!relationships.exists(req.user.id, req.targetUser.id, ...relationshipTypes))
            return res.send(HttpStatus.Unauthorized)

        next()
    })
}

export const authorizeCarerByRouteId = authorizePrimaryByRouteId(true, RelationshipTypes.Owner, RelationshipTypes.Carer)
export const authorizeOwnerByRouteId = authorizePrimaryByRouteId(true, RelationshipTypes.Owner)