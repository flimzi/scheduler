import serviceAccount from './serviceAccount.json' with { type: 'json' }
import { GoogleAuth } from 'google-auth-library'
import { HttpRequest } from '../util/http.js'

export default class FCMessaging {
    static {
        this.accessToken = this.getAccessToken()
        this.endpoint = `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`
    }

    // need to add a logger for scenarios like these
    static send = async message => new HttpRequest().json({ message }).post(this.endpoint, await this.accessToken)

    static async getAccessToken() {
        const auth = new GoogleAuth({ 
            credentials: serviceAccount, // needs to be a valid google cloud console IAM created service account json file
            scopes: [ 'https://www.googleapis.com/auth/cloud-platform' ]
        })
    
        const client = await auth.getClient()
        return client.getAccessToken().then(r => r.token)
    }

    // to can be a token (unicast) or a topic (broadcast). inclusion of non-empty title and body fields should create a notification
    static async message(to, data, { title, body, click_action }) {
        return this.send({ to, data, notification: { title, body, click_action } })
    }
}