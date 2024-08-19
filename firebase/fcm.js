import { GoogleAuth } from 'google-auth-library'
import serviceAccount from './serviceAccount.json' with { type: 'json' }
import { Http } from '../util/http.js'

export async function getAccessToken() {
    const auth = new GoogleAuth({ 
        credentials: serviceAccount, // needs to be a valid google cloud console IAM created service account json file
        scopes: [ 'https://www.googleapis.com/auth/cloud-platform' ]
    })

    const client = await auth.getClient()
    return client.getAccessToken().then(r => r.token)
}

export async function sendMessage(token) {
    const url = `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`
    const payload = {
        message: {
            token,
            notification: {
                title: 'Hello',
                body: 'this is a test notification'
            }
        }
    }
 
    return Http.postJson(url, payload, await getAccessToken())
}