import DbObject from "./DbObject.js";
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { sql, sqlFirst } from '../sql/helpers.js'

class AccessTokens extends DbObject {
    constructor() {
        super('access_tokens')
    }

    user_id = new DbObject('user_id')
    hash = new DbObject('hash')

    get(id, hash) {
        return sqlFirst`SELECT * FROM ${this} WHERE ${this.hash} = ${hash} AND ${this.user_id} = ${id}`
    }

    remove(hash) {
        return sql`DELETE FROM ${this} WHERE ${this.hash} = ${hash}`
    }

    removeForUser({ id }) {
        return sql`DELETE FROM ${this} WHERE ${this.user_id} = ${id}`
    }
}

const accessTokens = new AccessTokens()
export default accessTokens

export class AccessToken {
    constructor({ id, email, role, first_name }) {
        this.id = id
        this.email = email
        this.role = role
        this.first_name = first_name
    }

    sign() {
        const { ...payload } = this
        return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '365d' })
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