import fetch, { Response } from "node-fetch"
import { IncomingMessage } from 'http'
import { setBearer } from "./helpers.js"

// for highlighting
export class Status {
    static Ok = 200
    static Created = 201
    static BadRequest = 400
    static Unauthorized = 401
    static Forbidden = 403
    static NotFound = 404
    static Conflict = 409
    static TooManyRequests = 429
    static ServerError = 500
}

export class HttpRequest {
    init = { headers: {} }
    handlers = { }

    async fetch(url, accessToken, method) {
        accessToken && this.bearer(accessToken)
        method && (this.init.method = method)
        const response = await fetch(url, this.init).catch(e => new Response(e, { status: 0 }))
        this.handle(response)
        console.log(response) // logging could be handled like in logcat with Log.d and env condition to show or not (also probably save to file)
        return response
    }

    bearer(token) {
        this.init.headers.authorization = setBearer(token)
        return this
    }

    body(value, type) {
        this.init.headers['Content-Type'] = type
        this.init.body = value
        return this
    }

    post = (url, accessToken) => this.fetch(url, accessToken, 'POST')
    delete = (url, accessToken) => this.fetch(url, accessToken, 'DELETE')
    put = (url, accessToken) => this.fetch(url, accessToken, 'PUT')

    text = text => this.body(text, 'text/plain')
    json = obj => this.body(JSON.stringify(obj), 'application/json')

    on = (status, handler) => this.handlers[status] = handler
    unhandled = handler => this.handlers.unhandled = handler
    handle = response => (this.handlers[response.status] ?? this.handlers.unhandled)?.(response)
    onSuccess = handler => this.on(Status.Ok, handler)
    onError = handler => this.on(Status.ServerError, handler)
    onFailure = handler => this.on(0, handler)
}

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