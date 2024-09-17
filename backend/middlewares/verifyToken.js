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
        const signingKey = key.getPublicKey()
        callback(null, signingKey)
    })
}

function verifyToken(req, res, next) {
    const token =
        (req.headers.authorization &&
            req.headers.authorization.split(' ')[1]) ||
        req.cookies.token

    if (!token) {
        console.log('No token provided')
        return res.status(401).send('Access denied. No token provided.')
    }

    jwt.verify(
        token,
        getKey,
        {
            audience: `${process.env.AZURE_CLIENT_ID}`,
            algorithms: ['RS256'],
        },
        (err, decoded) => {
            if (err) {
                console.log('Invalid token:', err)
                return res.status(401).send('Invalid token.')
            }
            req.user = decoded
            next()
        }
    )
}

verifyToken.unless = unless

module.exports = verifyToken
