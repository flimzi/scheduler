import { Roles } from "../interface/definitions.js"
import { TaskStateMessage, TaskUpdateMessage } from "../interface/ServerMessage.js"
import Drug from '../models/Drug.js'
import DrugTask from '../models/DrugTask.js'
import TaskDrug from '../models/TaskDrug.js'
import User from "../models/User.js"
import { authActions } from "../routes/auth.js"
import { drugActions } from "../routes/drug.js"
import { eventActions } from "../routes/event.js"
import { fcmActions } from "../routes/fcm.js"
import { userActions } from '../routes/user.js'
import UserMessageService from "../services/UserMessageService.js"

export default class Client extends User {
    parents = {}
    children = {}
    tasks = {}
    
    static async create(role, parent) {
        const user = User.getType({ role }).fake()
        user.id = await userActions.postUsers(parent?.accessToken, user).then(r => r.assert().json())

        const client = user.cast(Client)
        client.owner = parent
        UserMessageService.onUserConfirmed(user.id, client.processFCM.bind(client))
        return client
    }

    static async createPrimary(parent) {
        return (await this.create(Roles.Primary, parent)).login()
    }

    async login() {
        this.accessToken = await authActions.login(this).then(r => r.assert().text())

        this.updateToken()
        return this
    }

    async updateToken() {
        return fcmActions.putToken(this.accessToken, process.env.FCM_DEFAULT).then(r => r.assert())
    }

    async logout() {
        await authActions.logout(this.accessToken).then(r => r.assert())
    }

    async createChild(role) {
        const client = await Client.create(role, this)
        client.accessToken = await userActions.getToken(this.accessToken, client.id).then(r => r.assert().text())
        this.children[client.id] = client
        client.updateToken()
        return client
    }

    async createSecondaryChild() {
        return this.createChild(Roles.Secondary)
    }

    async addChild(client, relationshipType) {
        await relatedActions.postParents(this.accessToken, client.id, client.accessToken, relationshipType).then(r => r.assert())
        client.parents[this.id] = this
        this.children.push(client)
    }

    async addEventFor(client, event) {
        event.id = await eventActions.postEvents(this.accessToken, client.id, event).then(r => r.assert().json())
        return eventActions.getEvent(this.accessToken, client.id, event.id).then(r => r.assert().json())
    }

    async addTaskFor(client, task) {
        const event = this.addEventFor(client, task)
        client.tasks[event.id] = event

        return event
    }

    async addDrugFor(client, drug) {
        return drugActions.postDrugs(this.accessToken, client.id, drug).then(r => r.assert().json())
    }

    async addDrugTaskFor(client, drugTask) {
        if (!drugTask) {
            const drug1 = await this.addDrugFor(client, Drug.fake(client.id))
            const drug2 = await this.addDrugFor(client, Drug.fake(client.id))
            const taskDrugs = [ new TaskDrug({ drugId: drug1.id, amount: 200 }), new TaskDrug({ drugId: drug2.id, amount: 1000 }) ]
            drugTask = DrugTask.everySeconds(10).clone({ taskDrugs })
        }

        return this.addTaskFor(client, drugTask)
    }

    async getDrugs(accessToken = this.accessToken, { categories, name, lastId } = {}) {
        return drugActions.getDrugs(accessToken, this.id, { categories, name, lastId }).then(r => r.assert().json())
    }

    processFCM(serverMessage) {
        return {
            [TaskStateMessage.type]: this.processTaskStatusMessage,
            [TaskUpdateMessage.type]: this.processTaskUpdateMessage,
        }[serverMessage.type]?.(serverMessage)
    }

    // couldnt these two things be like the same?
    processTaskStatusMessage(serverMessage) {
        console.log('task state update', serverMessage)
    }

    processTaskUpdateMessage(serverMessage) {
        console.log('task update', serverMessage)
    }
}