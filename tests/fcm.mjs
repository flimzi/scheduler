// import { registerCarer, loginCarer } from './auth.mjs'
// import { ApiRoutes } from '../routes/api.js'
// import { assert, baseUrl } from '../util/helpers.js'
// import FCM from '../firebase/FCMessaging.js'

// export async function setupUserTest() {
//     const carer = await registerCarer()
//     await loginCarer(carer)
//     const url = new URL(baseUrl('/updateUserFcmToken.html'))
//     url.searchParams.append('userId', carer.id)
//     url.searchParams.append('fcmUpdateEndpoint', btoa(baseUrl(ApiRoutes.fcmToken)))
//     url.searchParams.append('testEndpoint', btoa(baseUrl(ApiRoutes.fcm)))
//     url.searchParams.append('accessToken', carer.accessToken)
//     console.log(url.toString())
// }

// export async function testFcmForUser(user) {
//     for (let i = 0; i < 20; i++) {
//         const result = await FCM.message(user.fcm_token, { title: 'test notif', body: 'notif body' })
//         assert(result.ok)
//         await new Promise(r => setTimeout(r, 2500))
//     }
// }