import 'dotenv/config'
import { Carer } from '../schema/User.js'
import { Genders } from '../schema/Users.js'
import { assert, Http } from '../helpers.js'
import { Routes } from '../routes/main.js'

function baseUrl(route) {
    // no idea if this will work in prod
    return (!!process.env.DEBUG ? 'http://localhost:' + process.env.PORT : process.env.WEBSITE) + route
}

async function registerCarer() {
    const carer = Carer.fake()
    const response = await Http.postJson(baseUrl(Routes.register), carer)
    assert(response.status, Http.Status.Created)
    console.log(carer)
    return carer
}

async function removeUser({ accessToken }) {
    const response = await Http.delete(baseUrl(Routes.currentUser), accessToken)
    assert(response.ok)
}

async function removeUserId({ id, accessToken }) {
    const response = await Http.delete(baseUrl(Routes.user(id)), accessToken)
    assert(response.ok)
}

async function loginCarer(carer) {
    const response = await Http.postJson(baseUrl(Routes.login), { email: carer.email, password: carer.password })
    assert(response.ok)
    carer.accessToken = await response.text()
    console.log(carer.accessToken)
}

const carers = []

for (let i = 0; i < 20; i++)
    carers.push(await registerCarer())

for (const carer of carers) {
    await loginCarer(carer)
}

for (const carer of carers) {
    await removeUser(carer) // also remove from carers
}