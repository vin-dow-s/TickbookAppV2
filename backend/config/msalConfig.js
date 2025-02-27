const msal = require('@azure/msal-node')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const privateKey = fs.readFileSync(
    path.resolve(__dirname, '..', '..', 'decrypted-private-key.pem'),
    'utf8'
)

const msalConfig = {
    auth: {
        clientId: process.env.AZURE_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0`,
        clientCertificate: {
            thumbprint: process.env.CERTIFICATE_THUMBPRINT,
            privateKey: privateKey,
        },
    },
    system: {
        loggerOptions: {
            loggerCallback(loglevel, message, containsPii) {
                console.log(message)
            },
            piiLoggingEnabled: false,
            logLevel: msal.LogLevel.Info,
        },
    },
}

const redirectUri = 'http://localhost:4000/api/auth'

const authCodeUrlParameters = {
    scopes: ['api://e076f08e-d578-42c1-b131-7233d57c51a9/User.Read'],
    redirectUri,
    response_type: 'code',
    codeChallengeMethod: 'S256',
}

const cca = new msal.ConfidentialClientApplication(msalConfig)

module.exports = { msalConfig, authCodeUrlParameters, cca }
