import { User, Roles } from './Users.js'
import Carer from './Carer.js'
import Patient from './Patient.js'
export { User, Carer, Patient }

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

User.from = function(obj) {
    return obj?.convert(User.conversion)
}