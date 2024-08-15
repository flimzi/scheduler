import { User, Carer, Patient } from '../models/users.js'
import { Roles } from './definitions.js'

User.conversion = function({ role }) {
    switch (role) {
        case undefined:
            return undefined
        case Roles.Carer:
            return Carer
        case Roles.Patient:
            return Patient
    }

    return User
}