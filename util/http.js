import fetch, { Response } from "node-fetch"
import { IncomingMessage } from 'http'
import { setBearer } from "./helpers.js"

export class Http {
    static Status = {
        Ok: 200,
        Created: 201,
        BadRequest: 400,
        Unauthorized: 401,
        Forbidden: 403,
        NotFound: 404,
        Conflict: 409,
        TooManyRequests: 429,
        ServerError: 500,
    }

    static async fetch(url, init, accessToken) {
        init.headers ??= {}

        if (accessToken)
            init.headers.authorization = setBearer(accessToken)

        return fetch(url, init).catch(e => new Response(e, { status: 0 }))
    }

    static fetchJson(url, init, obj, accessToken) {
        init.headers ??= {}
        init.headers['Content-Type'] = 'application/json'
        init.body = JSON.stringify(obj)

        return this.fetch(url, init, accessToken)
    }

    static postJson(url, obj, accessToken) {
        return this.fetchJson(url, { method: 'POST' }, obj, accessToken)
    }

    static delete(url, accessToken) {
        return this.fetch(url, { method: 'DELETE' }, accessToken)
    }

    static putJson(url, obj, accessToken) {
        return this.fetchJson(url, { method: 'PUT' }, obj, accessToken)
    }
}

IncomingMessage.prototype.baseUrl = function(route = '') {
    return `${this.protocol}://${this.get('host')}` + route
}

Response.prototype.on = function(status, handler) {
    if (this.status === status) {
        this.handled = true
        return handler(this)
    }
}

Response.prototype.onSuccess = function(handler) {
    return this.on(Http.Status.Ok, handler)
}

Response.prototype.onFailure = function(handler) {
    return this.on(0, handler)
}

Response.prototype.onError = function(handler) {
    return this.on(Http.Status.ServerError, handler)
}

Response.prototype.unhandled = function(handler) {
    if (!this.handled)
        return handler()
}