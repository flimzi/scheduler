import { Http } from '../helpers.js'
import users, { User } from '../schema/Users.js'
import { asyncHandler } from '../helpers.js'
import { relationships } from '../schema/Relationships.js'

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

export const authorizeCarerByRouteParameter = paramName => (req, res, next) => {
    authenticate(req, res, async () => {
        req.targetUser = await users.get(req.params[paramName])

        if (!req.targetUser)
            return res.send(Http.Status.NotFound)

        if (req.user.id !== req.params[paramName] && !relationships.exists(req.user.id, req.targetUser.id))
            return res.send(Http.Status.Unauthorized)

        next()
    })
}

export const authorizeCarerByRouteId = authorizeCarerByRouteParameter('id')