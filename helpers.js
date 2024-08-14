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

Promise.prototype.as = async function(type) {
    return this.then(result => result?.as(type))
}

Object.prototype.convert = function(conversion) {
    return this.as(conversion(this))
}

Object.prototype.clone = function() {
    return new this.constructor(this)
}

Object.prototype.deleteUndefinedProperties = function() {
    for (const key in this)
        if (this[key] === undefined)
            delete this[key]
}

Object.prototype.propertyEquality = function(other) {
    return Object.keys(this).every(key => other.hasOwnProperty(key) && this[key] === other[key]);
}

Object.prototype.isFunction = function() {
    return typeof this === 'function'
}

Object.prototype.isString = function() {
    return typeof this === 'string' || this instanceof String
}

Object.prototype.isNumber = function() {
    return typeof this === 'number'
}

Promise.prototype.convert = function(conversion) {
    return this.then(result => result?.convert(conversion))
}

String.prototype.toLettersOnly = function() {
    return this.replace(/[^\p{L}]/gu, '')
}

String.prototype.capitalFirst = function() {
    return this && (this[0].toUpperCase() + this.slice(1).toLowerCase())
}

IncomingMessage.prototype.baseUrl = function(route = '') {
    return `${this.protocol}://${this.get('host')}` + route
}

String.prototype.format = function(...values) {
    return this.replace(/{(\d+)}/g, (match, index) => typeof values[index] !== 'undefined' ? values[index] : match)
}

String.prototype.removeNewline = function() {
    return this.replace(/[\r\n]+/g, '')
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

Object.prototype.toArray = function() {
    return [...this]
}

Array.range = function(length) {
    return Array(length).keys().toArray()
}

export function assert(property, value = true) {
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
        init.headers ??= {}

        if (accessToken)
            init.headers['Authorization'] = 'Bearer ' + accessToken

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

export class ArgumentError extends Error {}