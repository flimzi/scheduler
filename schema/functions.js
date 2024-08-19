import { DbColumn, DbFunction } from "./DbObject.js";

function valueToArrayToNull(value) {
    if (value === undefined)
        return null

    if (Array.isArray(value))
        return value.length ? value : null

    return [value]
}

export function getPrimaries(userId, relationshipType) {
    return new DbFunction('GetPrimaries', userId, valueToArrayToNull(relationshipType))
}

export function getSecondaries(userId, relationshipType) {
    return new DbFunction('GetSecondaries', userId, valueToArrayToNull(relationshipType))
}

export function getEvents({ giverId, receiverId, eventType, status }) {
    return new DbFunction('GetEvents', valueToArrayToNull(giverId), valueToArrayToNull(receiverId), valueToArrayToNull(eventType), valueToArrayToNull(status))
}

export function substring(dbColumn, start, end, alias = true) {
    const as = alias ? ` AS ${dbColumn.name}` : '' 
    return new DbColumn(`SUBSTRING(${dbColumn.name}, ${start}, ${end})` + alias)
}

// export function getReceivedEvents(userId, giverId, eventType, status) {
//     return new DbFunction('GetReceivedEvents', userId, valueToArrayToNull(giverId), valueToArrayToNull(eventType), valueToArrayToNull(status))
// }

// export function getGivenEvents(userId, receiverId, eventType, status) {
//     return new DbFunction('GetGivenEvents', userId, valueToArrayToNull(receiverId), valueToArrayToNull(eventType), valueToArrayToNull(status))
// }

