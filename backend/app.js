// Imports
const express = require('express')
const cors = require('cors')
const session = require('express-session')
const path = require('path')
const crypto = require('crypto')
const msal = require('@azure/msal-node')
const jwt = require('jsonwebtoken')

const {
    msalConfig,
    authCodeUrlParameters,
    cca,
} = require('./config/msalConfig')
const User = require('./models/User')
const verifyToken = require('./middlewares/verifyToken')
const routes = require('./api/routes')
const errorHandler = require('./middlewares/errorHandler')

// App initialization
const app = express()
const PORT = process.env.PORT || 4000
const FONTS_DIR = path.join(__dirname, '..', 'frontend', 'public', 'fonts')
const ONE_YEAR_IN_MILLISECONDS = 31557600000

// Static files
app.use(
    '/fonts',
    express.static(FONTS_DIR, {
        maxAge: ONE_YEAR_IN_MILLISECONDS,
        setHeaders: (res) => {
            res.setHeader(
                'Cache-Control',
                'public, max-age=`365 * 24 * 60 * 60  0`'
            )
        },
    })
)

// Session management
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 30,
        },
    })
)

// CORS and JSON parsing
app.use(cors())
app.use(express.json({ limit: '5mb' }))

// Error handling Middleware
app.use(errorHandler)

// Function to generate a code verifier and code challenge
function generatePKCECodes() {
    const codeVerifier = crypto.randomBytes(32).toString('hex')
    const base64Digest = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64')

    const codeChallenge = base64Digest
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')

    return { codeVerifier, codeChallenge }
}

/**
 * Routes
 */
// Route to initiate authentication
app.get('/test', (req, res) => {
    const { codeVerifier, codeChallenge } = generatePKCECodes()
    req.session.codeVerifier = codeVerifier

    cca.getAuthCodeUrl({ ...authCodeUrlParameters, codeChallenge })
        .then((response) => {
            res.redirect(response)
        })
        .catch((error) => {
            res.status(500).send('Error generating auth code URL.')
        })
})

// Callback route for authentication
// TODO : Fix the Access Token : audience and issuer do not match with those of the ID token
// TODO : Check in Entra ID that the v2.0 endpoints are being used
app.get('/api/auth', async (req, res) => {
    const tokenRequest = {
        code: req.query.code,
        scopes: ['openid', 'profile', 'email'],
        redirectUri: authCodeUrlParameters.redirectUri,
        codeVerifier: req.session.codeVerifier,
    }

    try {
        const response = await cca.acquireTokenByCode(tokenRequest)

        // ID token from the response
        const idToken = response.idToken
        const decodedIdToken = jwt.decode(idToken)

        console.log('ID Token:', idToken)
        console.log('Decoded ID Token Claims:', decodedIdToken)

        // Access token from the response
        const accessToken = response.accessToken
        const decodedAccessToken = jwt.decode(accessToken)
        const decodedAccessTokenHeader = jwt.decode(accessToken, {
            complete: true,
        }).header

        console.log('Access Token:', accessToken)
        console.log('Decoded Access Token Claims:', decodedAccessToken)
        console.log('Decoded Access Token Header:', decodedAccessTokenHeader)

        // Extract claims from the ID token
        const { oid, name, email } = decodedIdToken

        // Check if the user already exists in the database
        let user = await User.findOne({ where: { oid } })

        if (!user) {
            // If the user doesn't exist, create a new user
            await User.create({
                oid,
                name,
                email,
            })
        }

        // Store user information in the session
        req.session.user = {
            oid,
            name,
            email,
        }

        res.redirect('/api/auth/profile')
    } catch (error) {
        console.error('Authentication error:', error)
        res.status(500).send('Authentication error occurred.')
    }
})

// Redirection to profile route to view user info after successful authentication
app.get('/api/auth/profile', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('User is not authenticated')
    }

    res.send(
        `Name: ${req.session.user.name}, Email: ${req.session.user.email}, Oid: ${req.session.user.oid}`
    )
})

// Logout route
app.get('/api/auth/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid', { path: '/' })
        res.redirect('/')
    })
})

// verifyToken middleware to protect routes (excluding public routes)
// TODO : Add /api/ to all routes in api/routes.js once authorization is fixed and the token is valid
app.use(
    '/api',
    verifyToken.unless({
        path: ['/api/auth', '/api/auth/profile', '/api/auth/logout'],
    })
)

// API routes
app.use('/', routes)

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`)
})

module.exports = app
