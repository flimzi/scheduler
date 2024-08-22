import { validationResult } from "express-validator"
import { Status } from "../util/http.js"

export function validate(req, res, next) {
    const result = validationResult(req)

    if (!result.isEmpty())
        return res.status(Status.BadRequest).send(result.array())

    next()
}

export function validateBody(...dbColumns) {
    return async (req, res, next) => {
        for (const { validation } of dbColumns.filter(c => c.validation)) {
            const result = await validation.run(req)

            if (!result.empty())
                return res.status(Status.BadRequest).send(result.array())
        }

        next()
    }
}
