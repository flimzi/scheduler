import { Http } from '../helpers.js'
import users, { User } from '../schema/Users.js'
import { asyncHandler } from '../helpers.js'

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

export const authorizeOwnerByRouteParameter = paramName => (req, res, next) => {
    authenticate(req, res, async () => {
        req.targetUser = await users.get(req.params[paramName])

        if (req.targetUser === undefined)
            return res.send(Http.Status.NotFound)

        // check to see if there exists a relationship where the current user is the OWNER of the target user!!!

        if (req.user.id !== req.params[paramName])
            return res.send(Http.Status.Unauthorized)

        next()
    })
}

export const authorizeOwnerByRouteId = authorizeOwnerByRouteParameter('id')