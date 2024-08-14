import { User, Roles } from './Users.js'
import Carer from './Carer.js'
import Patient from './Patient.js'
export { User, Carer, Patient }

User.conversion = function({ role }) {
    if (role === undefined)
        return undefined

    return {
        [Roles.Carer]: Carer,
        [Roles.Patient]: Patient
    }[role] ?? User
}

User.from = function(obj) {
    return obj?.convert(User.conversion)
}