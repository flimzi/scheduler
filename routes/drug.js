import express from 'express'
import { Roles } from '../interface/definitions.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { authorize, related } from '../middleware/auth.js'
import { UserRoutes } from './user.js'
import { validate } from '../middleware/validate.js'
import { query } from 'express-validator'
import dbDrugs from '../schema/Drugs.js'
const router = express.Router()

export class DrugRoutes {
    static drugs = userId => UserRoutes.user(userId) + '/drugs'

    static Parameters = class {
        static get category() { return 'category' }
        static get categories() { return this.category + '.*' }
        static get name() { return 'name' }
        static get lastId() { return 'lastId' }
    }
}

router.get(
    DrugRoutes.drugs(), 
    validate(
        query(DrugRoutes.Parameters.categories).optional().toInt(),
        query(DrugRoutes.Parameters.name).optional().isString().trim(),
        query(DrugRoutes.Parameters.lastId).optional().toInt()
    ),
    related(),
    asyncHandler(async (req, res) => {
        res.send(await dbDrugs.find(req.userId))
    })
)

export const drugActions = { queryDrugs }
export default router