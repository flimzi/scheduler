export function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
}

export function isStrongPassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/
    return regex.test(password)
}

export function assert(actual, expected = true) {
    if (actual !== expected)
        throw new Error(`expected ${actual} to be ${expected}`)
}

export function assertType(value, expectedType) {
    if (!Object.isType(value, expectedType))
        throw new TypeError(`expected ${value} to be ${expectedType}`)
}

export function assertTypes(...valueTypePairs) {
    valueTypePairs.map(([value, type]) => assertType(value, type))
}

export function baseUrl(route) {
    // no idea if this will work in prod
    return (!!process.env.DEBUG ? 'http://localhost:' + process.env.PORT : process.env.WEBSITE) + route
}

export const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
export const getBearer = req => req.headers.authorization?.split(' ')[1]
export const setBearer = token => 'Bearer ' + token

export class Result {
    
}