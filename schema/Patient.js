import { User, Roles } from './Users.js'

export default class Patient extends User {
    role = Roles.Patient
}