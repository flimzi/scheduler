import 'dotenv/config'
import { Carer } from '../schema/User.js'
import { Genders } from '../schema/Users.js'
import { assert, Http } from '../helpers.js'
import { fakerPL as faker } from '@faker-js/faker'
import { Routes } from '../routes/main.js'
import fetch from 'node-fetch'

function baseUrl(route) {
    // no idea if this will work in prod
    return (!!process.env.DEBUG ? 'http://localhost:' + process.env.PORT : process.env.WEBSITE) + route
}

function randomCarer() {
    return new Carer({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        gender: Object.values(Genders).random(),
        phone_number: faker.phone.number(),
        birth_date: faker.date.birthdate(),
        height_cm: faker.number.int(140, 210),
        weight_kg: faker.number.int(40, 200),
    })
}

async function registerCarer() {
    const carer = randomCarer()
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