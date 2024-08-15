import 'dotenv/config'
import { Carer, Patient } from '../models/users.js'
import { Http } from '../util/http.js'
import { Routes } from '../routes/main.js'
import { assert } from '../util/helpers.js'

function baseUrl(route) {
    // no idea if this will work in prod
    return (!!process.env.DEBUG ? 'http://localhost:' + process.env.PORT : process.env.WEBSITE) + route
}

async function registerCarer() {
    const carer = Carer.fake()
    const response = await Http.postJson(baseUrl(Routes.register), carer)
    assert(response.status, Http.Status.Created)
    console.log(`creating ${carer.full_name()}`)
    carer.id = +(await response.text())
    return carer
}

async function removeUser(user) {
    const response = await Http.delete(baseUrl(Routes.currentUser), user.accessToken)
    console.log(`removing ${user.full_name()}`)
    assert(response.ok)
    return user
}

async function removeUserId(user) {
    const response = await Http.delete(baseUrl(Routes.user(user.id)), user.accessToken)
    console.log(`removing ${user.full_name()}`)
    assert(response.ok)
    return user
}

async function loginCarer(carer) {
    const response = await Http.postJson(baseUrl(Routes.login), { email: carer.email, password: carer.password })
    assert(response.ok)
    carer.accessToken = await response.text()
    console.log(`logging in ${carer.full_name()}`)
    return carer
}

async function logoutCarer(carer) {
    const response = await Http.fetch(baseUrl(Routes.logoutCurrent), {}, carer.accessToken)
    assert(response.ok)
    console.log(`logging out ${carer.full_name()}`)
    delete carer.accessToken
    return carer
}

async function createPatient(carer) {
    const patient = Patient.fake()
    const response = await Http.postJson(baseUrl(Routes.currentUser), patient, carer.accessToken)
    assert(response.status, Http.Status.Created)
    console.log(`adding patient ${patient.full_name()}`)
    patient.id = +(await response.text())
    return patient
}

export const carerSequence1 = () => registerCarer().then(loginCarer).then(logoutCarer).then(loginCarer).then(removeUser)

// for (let i = 0; i < 100; i++)
//     carerSequence1()

const carers = {}

export async function carerActions1(size = 20) {
    for (let i = 0; i < size; i++) {
        const carer = await registerCarer()
        carers[carer.id] = carer
    }
    
    for (const carer of Object.values(carers)) {
        await loginCarer(carer)
    }
    
    for (const carer of Object.values(carers)) {
        await loginCarer(carer)
    }
    
    for (const carer of Object.values(carers)) {
        await logoutCarer(carer)
    }
    
    for (const carer of Object.values(carers)) {
        await loginCarer(carer)
    }

    for (const carer of Object.values(carers)) {
        carer.patients = {}

        for (let i = 0; i < 10; i++) {
            const patient = await createPatient(carer)
            carer.patients[patient.id] = patient
        }
    }
    
    for (const carer of Object.values(carers)) {
        await removeUser(carer)
        delete carers[carer.id]
    }
}