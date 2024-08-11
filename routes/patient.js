import express from 'express'
import { Roles } from '../schema/Users.js'
import { authorize } from '../middleware/auth.js'
import { asyncHandler } from '../helpers.js'
const router = express.Router()

router.post('/', authorize(Roles.Carer), asyncHandler(async (req, res) => {
    
}))

export default router