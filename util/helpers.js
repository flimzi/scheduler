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

export const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)