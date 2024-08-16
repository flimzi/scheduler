import { User } from '../models/users.js'
import relationships from '../schema/Relationships.js'
import users from '../schema/Users.js'
import { RelationshipTypes } from '../util/definitions.js'
import { asyncHandler } from '../util/helpers.js'
import { Http } from '../util/http.js'

export const authenticate = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null)
        return res.sendStatus(Http.Status.Unauthorized)

    req.user = await User.authenticate(token)

    if (!req.user)
        return res.sendStatus(Http.Status.Forbidden)

    next()
})

export const authorize = (...roles) => (req, res, next) => {
    authenticate(req, res, () => {
        if (!roles.includes(req.user.role))
            return res.sendStatus(Http.Status.Unauthorized)
    
        next()
    })
}

export const authorizeUser = type => (req, res, next) => {
    authenticate(req, res, () => {
        if (!req.user instanceof type)
            return res.sendStatus(Http.Status.Unauthorized)

        next()
    })
}

// im yet to learn the sacred knowledge of handling async errors in nested middleware, asyncHandler does nothing here
export const authorizeCarerByRouteParameter = (paramName, ...relationshipTypes) => (req, res, next) => {
    authenticate(req, res, async () => {
        req.targetUser = await users.get(req.params[paramName])

        if (!req.targetUser)
            return res.send(Http.Status.NotFound)

        if (req.user.id !== req.params[paramName] && !relationships.exists(req.user.id, req.targetUser.id, ...relationshipTypes))
            return res.send(Http.Status.Unauthorized)

        next()
    })
}

export const authorizeCarerByRouteId = authorizeCarerByRouteParameter('id', RelationshipTypes.Owner, RelationshipTypes.Carer)
export const authorizeOwnerByRouteId = authorizeCarerByRouteParameter('id', RelationshipTypes.Owner)