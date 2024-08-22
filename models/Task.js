import { EventStatus, EventTypes } from "../interface/definitions.js";
import Event from "./Event.js";

// might need to add different task types later but that shouldnt be aproblem
export default class Task extends Event {
    type = EventTypes.Task
    status = EventStatus.Pending

    async getUpdateModel() {
        const model = await super.getUpdateModel()

        return model
    }
}