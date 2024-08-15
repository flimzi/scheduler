import 'dotenv/config'
import { Carer } from '../schema/User.js'
import { assert, Http } from '../helpers.js'
import { Routes } from '../routes/main.js'

function baseUrl(route) {
    // no idea if this will work in prod
    return (!!process.env.DEBUG ? 'http://localhost:' + process.env.PORT : process.env.WEBSITE) + route
}

async function registerCarer() {
    const carer = Owner.fake()
    const response = await Http.postJson(baseUrl(Routes.register), carer)
    assert(response.status, Http.Status.Created)
    console.log(`creating ${carer.full_name()}`)
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

async function loginOwner(owner) {
    const response = await Http.postJson(baseUrl(Routes.login), { email: owner.email, password: owner.password })
    assert(response.ok)
    owner.accessToken = await response.text()
    console.log(`logging in ${owner.full_name()}`)
    return owner
}

async function logoutOwner(owner) {
    const response = await Http.fetch(baseUrl(Routes.logoutCurrent), {}, owner.accessToken)
    assert(response.ok)
    console.log(`logging out ${owner.full_name()}`)
    delete owner.accessToken
    return owner
}

const ownerSequence1 = () => registerOwner().then(loginOwner).then(logoutOwner).then(loginOwner).then(removeUser)

// for (let i = 0; i < 100; i++)
//     ownerSequence1()

const owners = []

async function ownerActions1() {
    for (let i = 0; i < 100; i++)
        owners.push(await registerOwner())
    
    for (const owner of owners) {
        await loginOwner(owner)
    }
    
    for (const owner of owners) {
        await loginOwner(owner)
    }
    
    for (const owner of owners) {
        await logoutOwner(owner)
    }
    
    for (const owner of owners) {
        await loginOwner(owner)
    }
    
    for (const owner of owners) {
        await removeUser(owner) // also remove from owners
    }
}