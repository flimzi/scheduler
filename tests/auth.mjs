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
    assert(response.status === Http.Status.Created)
    return carer
}

async function removeUser({ id, accessToken }) {
    const response = await Http.fetch(baseUrl(Routes.user(id)), { method: 'DELETE' }, accessToken)
    assert(response.ok)
}

async function loginCarer(carer) {
    const response = await Http.postJson(baseUrl(Routes.login), { email: carer.email, password: carer.password })
    assert(response.ok)
    carer.accessToken = response.body
    console.log(response.body)
}

// const carers = Array.range(20).map(registerCarer)
// carers.map(loginCarer)
// carers.map(removeUser)