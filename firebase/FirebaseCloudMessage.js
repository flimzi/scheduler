import serviceAccount from './serviceAccount.json' with { type: 'json' }
import { GoogleAuth } from 'google-auth-library'
import { HttpRequest } from '../util/http.js'

export default class FirebaseCloudMessage {
    static accessToken = this.getAccessToken()
    static endpoint = `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`

    static async getAccessToken() {
        const auth = new GoogleAuth({ 
            credentials: serviceAccount, // needs to be a valid google cloud console IAM created service account json file
            scopes: [ 'https://www.googleapis.com/auth/cloud-platform' ]
        })
    
        const client = await auth.getClient()
        return client.getAccessToken().then(r => r.token)
    }

    constructor(token) {
        this.message = { token }
    }

    // https://firebase.google.com/docs/cloud-messaging/migrate-v1#update-the-payload-of-send-requests
    data(obj) {
        this.message.data = Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v) : (v?.toString() ?? '')]))
        return this
    }

    notification(title, body, click_action) {
        this.message.notification = { title, body }

        if (click_action)
            this.message.notification.click_action = click_action

        return this
    }

    async send() {
        return new HttpRequest(FirebaseCloudMessage.endpoint)
            .body(JSON.stringify({ message: this.message }), 'application/json')
            .bearer(await FirebaseCloudMessage.accessToken)
            .post()
    }
}