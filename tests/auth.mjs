import fetch from 'node-fetch'
import { Carer, Roles, User } from '../schema/Users.js'

function randomDate(startDate = new Date(1970, 0, 1), endDate = new Date()) {
    const [start, end] = [startDate.getTime(), endDate.getTime()]
    return new Date(start + Math.random() * (end - start))
}

function randomCarer() {
    return new Carer({
        birth_date: randomDate(),

    })
}

function createUser() {
    fetch('http://localhost:3000').then(r => {
        console.log(r)
    })
}

createUser()