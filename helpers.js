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
    return this.then(result => result.as(type))
}

export function sanitizeLetters(...strings) {
    strings = strings.filter(s => typeof s === 'string')
    const regex = /[^\p{L}]/gu

    for (const string of strings)
        string = string.replace(regex, '')
}