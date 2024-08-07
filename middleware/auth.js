import jwt from 'jsonwebtoken'
import users from '../schema/Users.js'

export const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null)
        return res.sendStatus(401)

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err)
            return res.sendStatus(403)

        req.user = users.get(user.id)

        if (req.user?.access_token !== token)
            return res.sendStatus(403)

        if (!req.user.verified)
            return res.sendStatus(401) // this would be a case of an ambiguous error so might need to abstract the codes

        next()
    })
}

export const authorize = role => (req, res, next) => {
    authenticate(req, res, () => {
        if (req.user?.role !== role)
            return res.sendStatus(403)
    
        next()
    })
}