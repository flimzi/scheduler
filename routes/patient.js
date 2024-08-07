import express from 'express'
import users, { Roles } from '../schema/Users.js'
import { authorize } from '../middleware/auth.js'
import asyncHandler from './asyncHandler.js'
const router = express.Router()

router.post('/create', authorize(Roles.Carer), asyncHandler(async (req, res) => {
    const { first_name } = req.body


}))

export default router