const express = require('express')
const cors = require('cors')
const routes = require('./api/routes')
const errorHandler = require('./middlewares/errorHandler.Js')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 4000
const FONTS_DIR = path.join(__dirname, '..', 'frontend', 'public', 'fonts')
const ONE_YEAR_IN_MILLISECONDS = 31557600000

app.use(
    '/fonts',
    express.static(FONTS_DIR, {
        maxAge: ONE_YEAR_IN_MILLISECONDS,
        setHeaders: (res) => {
            res.setHeader(
                'Cache-Control',
                'public, max-age=`365 * 24 * 60 * 60 * 1000`'
            )
        },
    })
)

app.use(cors())
app.use(express.json({ limit: '5mb' }))

/* //Uncomment to log each route of the app in the console for debugging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`, req.body)
    next()
}) */

//Using router from api/routes.js
app.use('/', routes)

//Error handling Middleware
app.use(errorHandler)

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`)
})

module.exports = app
