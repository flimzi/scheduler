import check from "check-types";
import { DbColumn, DbFunction } from "./DbObject.js";
import { joinInts } from "../util/helpers.js";

export function getPrimary(userId, ...relationshipTypes) {
    return new DbFunction('GetPrimary', userId, joinInts(relationshipTypes) ?? null)
}

export function getSecondary(userId, ...relationshipTypes) {
    return new DbFunction('GetSecondary', userId, joinInts(relationshipTypes) ?? null)
}

export function getEvents({ giverId, receiverId, type, status, startBefore, startAfter }) { 
    return new DbFunction(
        'GetEvents', 
        joinInts(giverId) ?? null, 
        joinInts(receiverId) ?? null, 
        joinInts(type) ?? null, 
        joinInts(status) ?? null, 
        check.date(startBefore) ? startBefore : null, 
        check.date(startAfter) ? startAfter : null
    )
}

export function substring(dbColumn, start, end, alias = true) {
    const as = alias ? ` AS ${dbColumn.name}` : '' 
    return new DbColumn(`SUBSTRING(${dbColumn.name}, ${start}, ${end})` + as)
}

// export function getReceivedEvents(userId, giverId, eventType, status) {
//     return new DbFunction('GetReceivedEvents', userId, valueToArrayToNull(giverId), valueToArrayToNull(eventType), valueToArrayToNull(status))
// }

// export function getGivenEvents(userId, receiverId, eventType, status) {
//     return new DbFunction('GetGivenEvents', userId, valueToArrayToNull(receiverId), valueToArrayToNull(eventType), valueToArrayToNull(status))
// }

