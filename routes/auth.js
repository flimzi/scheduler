import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sql } from '../sql/helpers.js'
import users, { User, Roles } from '../schema/Users.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { debounce, debounceMinute, debounceSecond } from '../middleware/debounce.js'
import QRCode from 'qrcode'
import { isValidEmail, asyncHandler, isStrongPassword } from '../helpers.js'
const router = express.Router()

// put routes in object maybe
router.post('/register', debounceMinute, asyncHandler(async (req, res) => {
    const user = req.body.as(User)

    if (!isValidEmail(user.email) || !isStrongPassword(user.password))
        return res.sendStatus(400)

    if (await users.emailExists(user.email))
        return res.sendStatus(409)
    
    await user.registerCarer()
    return res.sendStatus(201)
}))

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await users.getByEmail(email)

    if (user === undefined)
        return res.sendStatus(400)

    if (!user.verified)
        return res.sendStatus(401)

    if (!await bcrypt.compare(password, user.password))
        return res.sendStatus(401)

    res.json(await user.generateAccessToken())
})

// careful with this because generating a token implicitly logs the patient out
router.get('/qr', authorize(Roles.Carer), asyncHandler(async (req, res) => {
    const { id } = req.query

    if (id === undefined)
        return res.send(400)

    const patient = await users.get(id)

    if (patient === undefined)
        return res.send(400)

    // todo check if req.user is the owner of user

    res.json(await QRCode.toDataURL(await patient.generateAccessToken()))
}))

router.get('/logout', authenticate, asyncHandler(async (req, res) => {
    req.user?.logout()
    res.send(200)
}))

// the issue with this is that the app link on /verification also needs to be a valid get route so that a user on pc or other device can verify the email
// but the app link mechanism doesnt stop the browser request from going through so 2 post requests get sent to this route almost simultaneously
// meaning that even if we relied on the atomicity of a mssql instance for the response to contain valid information, the debounce middleware is going to
// stop one of these requests, as it should, so the user of the app is more likely than not see the unsuccessful verification message
// and i dont even think there is a rational way of bypassing the debounce middleware that doesnt also bypass its actual purpose
router.post('/verify', debounce(5000), asyncHandler(async (req, res) => {
    if (!await users.verify(req.body.token))
        return res.sendStatus(403)

    res.send()
}))

export default router