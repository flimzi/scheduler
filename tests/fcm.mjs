import { registerCarer, loginCarer } from './auth.mjs'
import { Routes } from '../routes/main.js'
import { assert, baseUrl } from '../util/helpers.js'
import { sendMessage } from '../firebase/fcm.js'

export async function setupUserTest() {
    const carer = await registerCarer()
    await loginCarer(carer)
    const url = new URL(baseUrl('/updateUserFcmToken.html'))
    url.searchParams.append('userId', carer.id)
    url.searchParams.append('fcmUpdateEndpoint', btoa(baseUrl(Routes.fcmToken)))
    url.searchParams.append('testEndpoint', btoa(baseUrl(Routes.fcmTest)))
    url.searchParams.append('accessToken', carer.accessToken)
    console.log(url.toString())
}

export async function testFcmForUser(user) {
    for (let i = 0; i < 10; i++) {
        const result = await sendMessage(user.fcm_token)
        assert(result.ok)
        await new Promise(r => setTimeout(r, 1000))
    }
}