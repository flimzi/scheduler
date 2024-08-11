import DbObject from "./DbObject.js";
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

class AccessTokens extends DbObject {
    constructor() {
        super('access_tokens')
    }

    user_id = new DbObject('user_id')
    hash = new DbObject('hash')
}

const accessTokens = new AccessTokens()
export default accessTokens

export class AccessToken {
    static sign({ id, email, role, first_name }) {
        return jwt.sign({ id, email, role, first_name }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '365d' })
    }

    static hash(token) {
        return crypto.createHash('sha256').update(token).digest('hex')
    }

    static verify(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
                err && reject(err)
                resolve(new AccessToken(user))
            })
        })
    }
}