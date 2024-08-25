// import 'dotenv/config'
// import { WebSocket } from 'ws'
// import { User } from '../models/users.js'
// import { Http } from '../util/http.js'
// import { ApiRoutes } from '../routes/api.js'
// import { assert, setBearer, baseUrl } from '../util/helpers.js'

// export async function registerCarer() {
//     const carer = User.fake()
//     const response = await Http.postJson(baseUrl(ApiRoutes.register), carer)
//     assert(response.status, Http.Status.Created)
//     console.log(`creating ${carer.full_name()}`)
//     carer.id = +(await response.text())
//     return carer
// }

// export async function removeUser(user) {
//     const response = await Http.delete(baseUrl(ApiRoutes.currentUser), user.accessToken)
//     console.log(`removing ${user.full_name()}`)
//     assert(response.status, Http.Status.Ok)
//     return user
// }

// export async function removeUserId(user) {
//     const response = await Http.delete(baseUrl(ApiRoutes.user(user.id)), user.accessToken)
//     console.log(`removing ${user.full_name()}`)
//     assert(response.status, Http.Status.Ok)
//     return user
// }

// export async function loginCarer(carer) {
//     const response = await Http.postJson(baseUrl(ApiRoutes.loginCurrent), { email: carer.email, password: carer.password })
//     assert(response.status, Http.Status.Ok)
//     carer.accessToken = await response.text()
//     console.log(`logging in ${carer.full_name()}`)
//     return carer
// }

// export async function logoutCarer(carer) {
//     const response = await Http.fetch(baseUrl(ApiRoutes.logoutCurrent), {}, carer.accessToken)
//     assert(response.status, Http.Status.Ok)
//     console.log(`logging out ${carer.full_name()}`)
//     delete carer.accessToken
//     return carer
// }

// export async function createPatient(carer) {
//     const patient = User.fake()
//     const response = await Http.postJson(baseUrl(ApiRoutes.currentUser), patient, carer.accessToken)
//     assert(response.status, Http.Status.Created)
//     console.log(`adding patient ${patient.full_name()}`)
//     patient.id = +(await response.text())
//     return patient
// }

// export const carerSequence1 = () => registerCarer().then(loginCarer).then(logoutCarer).then(loginCarer).then(removeUser)

// // for (let i = 0; i < 100; i++)
// //     carerSequence1()

// const carers = {}

// export async function carerActions1(size = 20) {
//     for (let i = 0; i < size; i++) {
//         const carer = await registerCarer()
//         carers[carer.id] = carer
//     }
    
//     for (const carer of Object.values(carers)) {
//         await loginCarer(carer)
//     }
    
//     for (const carer of Object.values(carers)) {
//         await loginCarer(carer)
//     }
    
//     for (const carer of Object.values(carers)) {
//         await logoutCarer(carer)
//     }
    
//     for (const carer of Object.values(carers)) {
//         await loginCarer(carer)
//     }

//     for (const carer of Object.values(carers)) {
//         carer.patients = {}

//         for (let i = 0; i < 10; i++) {
//             const patient = await createPatient(carer)
//             carer.patients[patient.id] = patient
//         }
//     }
    
//     for (const carer of Object.values(carers)) {
//         await removeUser(carer)
//         delete carers[carer.id]
//     }
// }

// export async function socketTest() {
//     const carer1 = await registerCarer()
//     await loginCarer(carer1)
//     const ws = new WebSocket('ws://localhost:3000', { headers: { authorization: setBearer(carer1.accessToken) } })
// }