import { IncomingMessage } from 'http'
import fetch, { Response } from 'node-fetch'

export function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
}

export function isStrongPassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/
    return regex.test(password)
}

export const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

Object.prototype.as = function(type) {
    return new type(this)
}

Object.prototype.asAsync = async function(type) {
    return this.then(result => result?.as(type))
}

Object.prototype.convertAsync = async function(conversion) {
    return this.then(result => result?.as(conversion(result)))
}

String.prototype.toLettersOnly = function() {
    return this.replace(/[^\p{L}]/gu, '')
}

IncomingMessage.prototype.baseUrl = function(route = '') {
    return `${this.protocol}://${this.get('host')}` + route
}

String.prototype.format = function(...values) {
    return this.replace(/{(\d+)}/g, (match, index) => typeof values[index] !== 'undefined' ? values[index] : match)
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

// not sure about the logic of this
Response.prototype.unhandled = function(handler) {
    if (!this.handled)
        return handler()
}

Array.prototype.random = function() {
    return this[Math.floor(Math.random() * this.length)]
}

Array.range = function(length) {
    return [...Array(length).keys()]
}

export function assert(property, value) {
    if (property !== value)
        throw new Error(`expected ${property} to be ${value}`)
}

export class Http {
    static Status = {
        Ok: 200,
        Created: 201,
        BadRequest: 400,
        Unauthorized: 401,
        Forbidden: 403,
        NotFound: 404,
        TooManyRequests: 429,
        ServerError: 500,
    }

    static fetch(url, init, accessToken) {
        if (accessToken)
            init.headers['Authorization'] = 'Bearer ' + accessToken

        return fetch(url, init)
    }

    static postJson(url, obj, accessToken) {
        return this.fetch(
            url, 
            { method: 'POST', headers: {'Content-Type' : 'application/json'}, body: JSON.stringify(obj) },
            accessToken
        ).catch(e => new Response(e, { status: 0 }))
    }
}