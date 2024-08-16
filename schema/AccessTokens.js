import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { DbTable, DbColumn } from "./DbObject.js";
import { sqlDelete, sqlFirst } from '../util/sql.js';

class AccessTokens extends DbTable {
    constructor() {
        super('access_tokens')
    }

    user_id = new DbColumn('user_id')
    hash = new DbColumn('hash')

    get(id, hash) {
        return sqlFirst`SELECT * FROM ${this} WHERE ${this.user_id} = ${id} AND ${this.hash} = ${hash}`
    }

    delete(id, hash) {
        return sqlDelete(this)`WHERE ${this.user_id} = ${id} AND ${this.hash} = ${hash}`
    }

    deleteForUser({ id }) {
        return sqlDelete(this)`WHERE ${this.user_id} = ${id}`
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