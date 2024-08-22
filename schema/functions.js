import check from "check-types";
import { DbColumn, DbFunction } from "./DbObject.js";

// replace this with check-types
function valueToArrayToNull(value) {
    if (value === undefined)
        return null

    if (Array.isArray(value))
        return value.length ? value : null

    return [value]
}

export function getPrimary(userId, relationshipType) {
    return new DbFunction('GetPrimaries', userId, valueToArrayToNull(relationshipType))
}

export function getSecondary(userId, relationshipType) {
    return new DbFunction('GetSecondaries', userId, valueToArrayToNull(relationshipType))
}

export function getEvents({ giverId, receiverId, eventType, status, before, after }) { 
    return new DbFunction(
        'GetEvents', 
        valueToArrayToNull(giverId), 
        valueToArrayToNull(receiverId), 
        valueToArrayToNull(eventType), 
        valueToArrayToNull(status), 
        check.date(before) ? before : null, 
        check.date(after) ? after : null
    )
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

