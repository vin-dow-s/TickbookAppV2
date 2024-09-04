const { unless } = require('express-unless')
const jwt = require('jsonwebtoken')
const jwksClient = require('jwks-rsa')

const client = jwksClient({
    jwksUri: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/discovery/v2.0/keys`,
})

function getKey(header, callback) {
    client.getSigningKey(header.kid, function (err, key) {
        if (err) {
            console.error('Error retrieving signing key:', err)
            return callback(err)
        }
        const signingKey = key.publicKey
        console.log('Signing key used for verification:', signingKey)
        callback(null, signingKey)
    })
}

function verifyToken(req, res, next) {
    console.log('verifyToken middleware called')
    const token =
        req.headers.authorization && req.headers.authorization.split(' ')[1]

    if (!token) {
        console.log('No token provided')
        return res.status(401).send('Access denied. No token provided.')
    }

    jwt.verify(
        token,
        getKey,
        {
            audience: process.env.AZURE_CLIENT_ID,
            issuer: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
            algorithms: ['RS256'],
        },
        (err, decoded) => {
            if (err) {
                console.log('Invalid token:', err)
                return res.status(401).send('Invalid token.')
            }
            console.log('Token verified successfully:', decoded)
            req.user = decoded
            next()
        }
    )
}

verifyToken.unless = unless

module.exports = verifyToken
