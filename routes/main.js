import express from 'express'
import { asyncHandler, Http } from '../helpers.js'
import strings from '../resources/strings.en.js'
import eventStream from '../middleware/eventStream.js'
const router = express.Router()

router.get('/verification', eventStream, asyncHandler(async (req, res) => {
    const token = req.query.token

    if (!token)
        return res.sendStatus(400)

    res.write(strings.verifying + '\n')

    const response = await Http.postJson(req.baseUrl('/api/auth/verify'), { token })
    response.onSuccess(r => res.write(strings.verificationSuccess))
    response.unhandled(r => res.write(strings.verificationFailure))

    res.end()
}))

export default router