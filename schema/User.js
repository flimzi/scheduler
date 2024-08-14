import { User, Roles } from './Users.js'
import Owner from './Owner.js'
import Patient from './Owned.js'
export { User, Owner as Carer, Patient }

User.conversion = function({ role }) {
    if (role === undefined)
        return undefined

    return {
        [Roles.Carer]: Owner,
        [Roles.Patient]: Patient
    }[role] ?? User
}

User.from = function(obj) {
    return obj?.convert(User.conversion)
}