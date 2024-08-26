import { User } from '../models/users.js'
import relationships from '../schema/Relationships.js'
import users from '../schema/Users.js'
import { RelationshipTypes } from '../interface/definitions.js'
import { getBearer, isJWT } from '../util/helpers.js'
import { asyncHandler } from "./asyncHandler.js"
import { HttpStatus } from '../util/http.js'
import check from 'check-types'

const tryAuthenticate = optional => asyncHandler(async (req, res, next) => {
    const token = getBearer(req)

    if (!isJWT(token) && optional)
        return next()

    req.user = await User.authenticate(token)

    if (!req.user)
        return res.sendStatus(HttpStatus.Forbidden)

    next()
})

// export const authenticate = tryAuthenticate()
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

// todo handle errors (asyncHandler doesnt seem to work)
// todo this needs to be getCurrentTargetUser -> getRouteTargetUser -> authorizePrimary / authorizeCurrent for more granularity
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

        if (!relationships.exists(req.user, req.targetUser, ...relationshipTypes))
            return res.send(HttpStatus.Unauthorized)

        req.isCurrent = userId === req.user.id
        next()
    })
}

export const authorizeCarerByRouteId = authorizePrimaryByRouteId(true, RelationshipTypes.Owner, RelationshipTypes.Carer)
export const authorizeOwnerByRouteId = authorizePrimaryByRouteId(true, RelationshipTypes.Owner)

export const getCurrentUser = async (req, res, next) => {
    if (req.user)
        return next()

    const token = getBearer(req)

    if (!isJWT(token))
        return next()

    req.user = await User.authenticate(token)
    next()
}

export const authenticate = (req, res, next) => 
    getCurrentUser(req, res, () => {
        if (!req.user)
            return res.send(HttpStatus.Unauthorized)

        next()
    })

export const getTargetUser = async (req, res, next) => {
    let { userId } = req.params

    if (req.targetUser)
        return next()

    if (userId === undefined)
        return res.send(HttpStatus.NotFound)

    if (userId === currentUserPlaceholder) {
        if (!req.user)
            return res.send(HttpStatus.Unauthorized)

        userId = req.user.id
    }

    if (check.integer(Number(userId)))
        req.targetUser = await users.getId(userId)

    if (!req.targetUser)
        return res.send(HttpStatus.NotFound)

    req.targetSelf = userId === req.user?.id
    next()
}

export const disallowSelf = (req, res, next) => {
    if (req.targetSelf)
        return res.send(HttpStatus.Unauthorized)

    next()
}

export const related = (allowSelf = true, allowSecondary = true, ...relationshipTypes) => (req, res, next) => {
    authenticate(req, res, () => getTargetUser(req, res, () => {
        if (req.targetSelf)
            return !allowSelf ? res.send(HttpStatus.Unauthorized) : next()
    
        if (!req.user.isPrimaryTo(req.targetUser, ...relationshipTypes) && !allowSecondary)
            return res.send(HttpStatus.Unauthorized)

        if (!req.user.isSecondaryTo(req.targetUser, ...relationshipTypes))
            return res.send(HttpStatus.Unauthorized)

        next()
    }))
}

export const currentProperty = selector => (req, res, next) => authenticate(req, res, () => {
    if (!selector(req.user))
        return res.send(HttpStatus.Unauthorized)

    next()
})