import { EventTypes, Roles } from '../interface/definitions.js'
import { User, Carer, Patient } from '../models/users.js'
import Task from '../models/Task.js'
import Event from '../models/Event.js'
import { ArgumentError } from './errors.js'

User.getType = function({ role }) {
    switch (role) {
        case Roles.Carer:
            return Carer
        case Roles.Patient:
            return Patient
    }

    throw new ArgumentError('wrong user')
    // return User
}

Event.getType = function({ type }) {
    switch (type) {
        case EventTypes.Task:
            return Task
    }

    return Event
}