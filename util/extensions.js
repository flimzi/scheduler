Object.cast = function cast(obj, type) {
    if (obj === undefined)
        return undefined

    const casted = new type(obj)
    return Object.isFunction(casted) ? new casted(obj) : casted
}

Object.defineProperty(Object.prototype, Object.cast.name, {
    value: function(type) {
        return Object.cast(this, type)
    },
    enumerable: false,
    configurable: true,
    writable: true,
})

Object.clone = function(obj) {
    return new obj.constructor(obj)
}

Object.deleteUndefinedProperties = function(obj) {
    for (const key in obj)
        if (obj[key] === undefined)
            delete obj[key]
}

Object.propertyEquality = function(obj, other) {
    return Object.keys(obj).every(key => other.hasOwnProperty(key) && obj[key] === other[key])
}

Object.serializationEquality = function(obj, other) {
    return JSON.stringify(obj) === JSON.stringify(other)
}

Object.random = function(obj) {
    return Object.values(obj).random()
}

Object.isFunction = obj => typeof obj === 'function'
Object.isString = obj => typeof obj === 'string' || obj instanceof String
Object.isNumber = obj => typeof obj === 'number'

Object.isType = function(obj, type) {
    switch (type) {
        case Function:
            return Object.isFunction(obj)
        case String:
            return Object.isString(obj)
        case Number:
            return Object.isNumber(obj)
    }

    return false
}

Promise.prototype.cast = async function(type) {
    return this.then(result => Object.cast(result, type))
}

String.prototype.toLettersOnly = function() {
    return this.replace(/[^\p{L}]/gu, '')
}

String.prototype.capitalFirst = function() {
    return this && (this[0].toUpperCase() + this.slice(1).toLowerCase())
}

String.prototype.format = function(...values) {
    return this.replace(/{(\d+)}/g, (match, index) => typeof values[index] !== 'undefined' ? values[index] : match)
}

String.prototype.removeNewline = function() {
    return this.replace(/[\r\n]+/g, '')
}

Array.prototype.random = function() {
    return this[Math.floor(Math.random() * this.length)]
}

Array.range = function(length) {
    return Array(length).keys().toArray()
}