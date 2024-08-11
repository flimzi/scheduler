import { Http } from '../helpers.js'
import { User } from '../schema/Users.js'
import { asyncHandler } from '../helpers.js'

export const authenticate = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null)
        return res.sendStatus(Http.Status.BadRequest)

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