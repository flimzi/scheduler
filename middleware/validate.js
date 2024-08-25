import { query, validationResult } from "express-validator"
import { HttpStatus } from "../util/http.js"
import check from "check-types"

export function validate(req, res, next) {
    const errors = validationResult(req)

    if (!errors.isEmpty())
        return res.status(HttpStatus.BadRequest).send(errors.array()) // result.array() does not hold any meaningful information

    next()
}

export function validateBody(...dbColumns) {
    return async (req, res, next) => {
        for (const { validation } of dbColumns.filter(c => c.validation)) {
            const errors = await validation.run(req)

            if (!errors.isEmpty())
                return res.status(HttpStatus.BadRequest).send(errors.array())
        }

        next()
    }
}

export function validateTable(dbTable) {
    return validateBody(...dbTable.getColumns())
}