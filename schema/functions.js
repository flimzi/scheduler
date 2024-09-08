import check from "check-types";
import { DbColumn, DbFunction } from "./DbObject.js";
import { joinInts } from "../util/helpers.js";

export function getPrimary(userId, ...relationshipTypes) {
    return new DbFunction('GetPrimary', userId, joinInts(relationshipTypes) ?? null)
}

export function getSecondary(userId, ...relationshipTypes) {
    return new DbFunction('GetSecondary', userId, joinInts(relationshipTypes) ?? null)
}

export function getEvents({ giverId, receiverId, type, state, startBefore, startAfter }) { 
    return new DbFunction(
        'GetEvents', 
        joinInts(giverId) ?? null, 
        joinInts(receiverId) ?? null, 
        joinInts(type) ?? null, 
        joinInts(state) ?? null, 
        check.date(startBefore) ? startBefore : null, 
        check.date(startAfter) ? startAfter : null
    )
}

export function substring(dbColumn, start, end, alias = true) {
    const as = alias ? ` AS ${dbColumn.name}` : '' 
    return new DbColumn(`SUBSTRING(${dbColumn.name}, ${start}, ${end})` + as)
}

