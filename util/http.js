import fetch from "node-fetch"
import { baseUrl, setBearer } from "./helpers.js"

export class HttpStatus {
    static get Ok() { return 200 }
    static get Created() { return 201 }
    static get BadRequest() { return 400 }
    static get Unauthorized() { return 401 }
    static get Forbidden() { return 403 }
    static get NotFound() { return 404 }
    static get Conflict() { return 409 }
    static get TooManyRequests() { return 429 }
    static get ServerError() { return 500 } 
}

export class HttpRequest {
    init = { headers: {} }

    constructor(url) {
        this.url = new URL(url)
    }

    bearer(token) {
        token && (this.headers.authorization = setBearer(token))
        return this
    }

    body(payload, type) {
        this.init.headers['Content-Type'] = type
        this.init.body = payload
        return this
    }

    query(name, value) {
        this.url.searchParams.append(name, value)
        return this
    }

    async fetch(method) {
        const init = { ...this.init, method }
        const url = this.url.toString()
        
        console.log(`sending to ${url}`)
        console.log(init)
        
        const result = await fetch(url, init)

        console.log(result)
        return result
    }

    post = () => this.fetch('POST')
    delete = () => this.fetch('DELETE')
    put = () => this.fetch('PUT')

    text = text => this.body(text, 'text/plain')
    json = obj => this.body(JSON.stringify(obj), 'application/json')
}

export class RouteRequest extends HttpRequest {
    constructor(route) {
        super(baseUrl(route))
    }
}