import { EventTypes, Roles, TaskTypes } from '../interface/definitions.js'
import { User, Primary, Secondary } from '../models/users.js'
import Task from '../models/Task.js'
import Event from '../models/Event.js'
import { ArgumentError } from './errors.js'
import DrugTask from '../models/DrugTask.js'

User.getType = function({ role }) {
    switch (role) {
        case Roles.Primary:
            return Primary
        case Roles.Secondary:
            return Secondary
    }

    throw new ArgumentError('wrong user')
    // return User
}

// todo change to allow for nested conversion
Event.getType = function({ type }) {
    if (TaskTypes.values().includes(type))
        return Task.getType({ type })

    return Event
}

Task.getType = function({ type }) {
    switch (type) {
        case TaskTypes.Drug:
            return DrugTask
    }

    return Task
}