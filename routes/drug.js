import express from 'express'
import { query } from 'express-validator'
import { RelationshipTypes } from '../interface/definitions.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { related } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import dbDrugs from '../schema/Drugs.js'
import { HttpRequest, HttpStatus } from '../util/http.js'
import { ApiRoutes } from './api.js'
import { UserRoutes } from './user.js'
import Drug from '../models/Drug.js'
const router = express.Router()

export class DrugRoutes {
    static drugs = userId => UserRoutes.user(userId) + '/drugs'

    // these parameters could be replaced by DbColumn
    static Parameters = class {
        static get category() { return 'category' }
        static get name() { return 'name' }
        static get lastId() { return 'lastId' }
    }
}

router.get(
    DrugRoutes.drugs(),
    validate(
        query(DrugRoutes.Parameters.category + '.*').optional().toInt(),
        query(DrugRoutes.Parameters.name).optional().isString().trim(),
        query(DrugRoutes.Parameters.lastId).optional().toInt()
    ),
    related(true, false, RelationshipTypes.Superior),
    asyncHandler(async (req, res) => {
        res.send(await dbDrugs.find(req.userId))
    })
)

const getDrugs = (accessToken, userId, { categories, name, lastId } = {}) =>
    new HttpRequest(ApiRoutes.drugs(userId))
        .bearer(accessToken)
        .query(DrugRoutes.Parameters.category, categories)
        .query(DrugRoutes.Parameters.name, name)
        .query(DrugRoutes.Parameters.lastId, lastId)
        .fetch()

router.post(DrugRoutes.drugs(), related(false, false, RelationshipTypes.Superior), asyncHandler(async (req, res) => {
    res.status(HttpStatus.Created).send(await new Drug(req.body).add())
}))

const postDrugs = (accessToken, userId, drug) => new HttpRequest(ApiRoutes.drugs(userId)).bearer(accessToken).json(drug).post()

export const drugActions = { getDrugs, postDrugs }
export default router