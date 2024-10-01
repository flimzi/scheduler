import check from 'check-types'
import { User } from '../models/users.js'
import dbUsers from '../schema/Users.js'
import { getBearer, isJWT } from '../util/helpers.js'
import { HttpStatus } from '../util/http.js'
import { DbColumn } from '../schema/DbObject.js'
import { sqlFirst } from '../sql/helpers.js'

export const currentUserPlaceholder = 'current'

export const getCurrentUser = async (req, res, next) => {
    if (req.user)
        return next()

    const token = getBearer(req)

    if (!isJWT(token))
        return next()

    req.user = await User.authenticate(token)
    next()
}

export const authenticate = (req, res, next) => {
    getCurrentUser(req, res, () => {
        if (!req.user)
            return res.send(HttpStatus.Unauthorized)

        next()
    })
}

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
        req.targetUser = await dbUsers.getId(userId)

    if (!req.targetUser)
        return res.send(HttpStatus.NotFound)

    req.targetSelf = userId === req.user?.id
    next()
}

// important to note that this is simple and non-branching middleware that can only be chained to guarantee the correctness of every authorization check
// it cannot be used on its own to provide alternate ways of authorizing a user that does not satisfy some of the requirements
export const getCurrentAndTargetUser = (req, res, next) => authenticate(req, res, () => getTargetUser(req, res, next))

export const self = (onlyOrNever = true) => (req, res, next) => {
    getCurrentAndTargetUser(req, res, () => {
        if (req.targetSelf !== onlyOrNever)
            return res.send(HttpStatus.Unauthorized)

        next()
    })
}

export const related = (allowSelf = true, allowChild = true, relationshipTypes) => (req, res, next) => {
    getCurrentAndTargetUser(req, res, () => {
        if (req.targetSelf)
            return !allowSelf ? res.send(HttpStatus.Unauthorized) : next()

        if (!req.user.isParentOf(req.targetUser, relationshipTypes) && !allowChild)
            return res.send(HttpStatus.Unauthorized)

        if (!req.user.isChildOf(req.targetUser, relationshipTypes))
            return res.send(HttpStatus.Unauthorized)

        next()
    })
}

export const authorize = (...roles) => (req, res, next) => {
    authenticate(req, res, () => {
        if (!roles.includes(req.user.role))
            return res.send(HttpStatus.Unauthorized)
    
        next()
    })
}

export const authorizeUser = type => (req, res, next) => {
    authenticate(req, res, () => {
        if (!req.user instanceof type)
            return res.send(HttpStatus.Unauthorized)

        next()
    })
}

export const currentProperty = selector => (req, res, next) => authenticate(req, res, () => {
    if (!selector(req.user))
        return res.send(HttpStatus.Unauthorized)

    next()
})

export const getModel = (type, param, authPredicate) => async (req, res, next) => {
    req.content = await sqlFirst(type.getTable(), type.getTable().getAbbreviatedColumns())`WHERE ${DbColumn.id} = ${req.params[param]}`().convert(type.getType)

    if (!req.content)
        return res.send(HttpStatus.NotFound)

    if (check.function(authPredicate) && !authPredicate(req))
        return res.send(HttpStatus.Unauthorized)

    next()
}