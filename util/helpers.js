import check from "check-types"

export const DEBUG = !!process.env.DEBUG

export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isStrongPassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password)
}

export function isJWT(value) {
    return /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(value)
}

export function assert(actual, expected = true) {
    if (actual !== expected)
        throw new Error(`expected ${actual} to be ${expected}`)

    return true
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
    return (!!process.env.DEBUG ? 'http://localhost:' + process.env.PORT : process.env.WEBSITE) + (route ?? '')
}

export function toIntArray(arrayString) {
    const array = arrayString?.toString().split(',').map(Number)

    if (array?.every(check.integer))
        return array
}

export function valueToValues(valueOrValues) {
    return Array.isArray(valueOrValues) ? valueOrValues : [ valueOrValues ]
}

export function joinInts(valueOrValues) {
    const values = valueToValues(valueOrValues)

    if (values.every(check.integer))
        return values.join()
}

export const getBearer = req => req.headers.authorization?.split(' ')[1]
export const setBearer = token => 'Bearer ' + token

export function stringifyValues(obj, maxDepth = 0) {
    // return Object.entries(obj).reduce((acc, [key, val]) => { acc[key] = val.toString(); return acc }, {})
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, typeof v === 'object' && maxDepth ? stringify(v, maxDepth - 1) : v.toString()]))
}

export function formatIntervalFromMilliseconds(ms) {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0')
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0')
    const seconds = (totalSeconds % 60).toString().padStart(2, '0')
    const milliseconds = ms.toString().padStart(3, '0')

    return `${hours}:${minutes}:${seconds}:${milliseconds}`
}

export function formatIntervalFromSeconds(totalSeconds) {
    return formatIntervalFromMilliseconds(totalSeconds * 1000)
}