// Imports
const express = require('express')
const cors = require('cors')
const path = require('path')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const { authCodeUrlParameters, cca } = require('./config/msalConfig')
const User = require('./models/User')
const verifyToken = require('./middlewares/verifyToken')
const routes = require('./api/routes')
const errorHandler = require('./middlewares/errorHandler')

// App initialization
const app = express()
const PORT = process.env.PORT || 4000
const FONTS_DIR = path.join(__dirname, '..', 'frontend', 'public', 'fonts')
const ONE_YEAR_IN_MILLISECONDS = 31557600000

// Use cookie-parser
app.use(cookieParser())

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

// CORS and JSON parsing
app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    })
)

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
app.get('/api/login', (req, res) => {
    const { codeVerifier, codeChallenge } = generatePKCECodes()

    res.cookie('codeVerifier', codeVerifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 10,
    })

    cca.getAuthCodeUrl({ ...authCodeUrlParameters, codeChallenge })
        .then((response) => {
            res.redirect(response)
        })
        .catch((error) => {
            res.status(500).send('Error generating auth code URL.')
        })
})

// Callback route for authentication
app.get('/api/auth', async (req, res) => {
    const codeVerifier = req.cookies.codeVerifier

    if (!codeVerifier) {
        return res.status(400).send('Missing code verifier')
    }

    const tokenRequest = {
        code: req.query.code,
        scopes: ['api://e076f08e-d578-42c1-b131-7233d57c51a9/User.Read'],
        redirectUri: authCodeUrlParameters.redirectUri,
        codeVerifier: codeVerifier,
    }

    try {
        const response = await cca.acquireTokenByCode(tokenRequest)

        // Access token from the response
        const accessToken = response.accessToken
        console.log('Access Token:', accessToken)

        const { oid, name, email } = jwt.decode(response.idToken)

        // Check if the user already exists in the database
        let user = await User.findOne({ where: { oid } })

        // If the user doesn't exist, create a new user
        if (!user) {
            await User.create({
                oid,
                name,
                email,
            })
        }

        res.cookie('token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 30,
        })

        res.clearCookie('codeVerifier')

        // Redirect the user to the frontend
        res.redirect('http://localhost:5173')
    } catch (error) {
        console.error('Authentication error:', error)
        res.status(500).send('Authentication error occurred.')
    }
})

// Route to check if the user is authenticated
app.get('/api/check-auth', verifyToken, (req, res) => {
    // If the verifyToken middleware succeeds, it means the user is authenticated
    res.json({ authenticated: true, user: req.user })
})

// Logout route
app.get('/api/logout', (req, res) => {
    res.clearCookie('token')
    res.redirect('/')
})

// verifyToken middleware to protect routes (excluding public routes)
app.use(
    '/api',
    verifyToken.unless({
        path: ['/api/login', '/api/auth', '/api/logout'],
    })
)

// API routes
app.use('/', routes)

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`)
})

module.exports = app
