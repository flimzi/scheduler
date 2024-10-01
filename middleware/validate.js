import { validationResult } from "express-validator"
import { HttpStatus } from "../util/http.js"

// todo this might need to be adjusted to actually run the validators and then return the first error message if exists and default otherwise
export const validate = (...validators) => (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty())
        return res.status(HttpStatus.BadRequest).send(errors.array())

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