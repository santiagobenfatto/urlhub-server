import express from 'express'
import { createServer } from 'node:http'
import config from './config/config.js'
import { __dirname } from './utils/utils.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import apiV1Routes from './routes/api.v1.routes.js'
import initializePassport from './auth/index.js'
import logger, { requestLogger } from './utils/logger.js'
import { AliasResolverController } from './controllers/alias.controller.js'

const app = express()
const httpServer = createServer(app)
const PORT = config.port || 3001
const allowedOrigins = [
    config.originURL,
    /^https:\/\/urlhub-test\.vercel\.app$/,
    /^https:\/\/urlhub-test-.*\.vercel\.app$/,
]

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(`${__dirname}/public`))
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.some(o => o instanceof RegExp ? o.test(origin) : o === origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS'
}))

app.use(requestLogger)

initializePassport(app)

app.use('/api/v1', apiV1Routes)

// Alias resolver - business logic
app.get('/:alias', (req, res, next) => {
    const { alias } = req.params
    const aliasResolverController = new AliasResolverController()
    if (alias.includes('.')) {
        return next()
    }

    return aliasResolverController.resolveAlias(req, res)
})


export default app

if (process.env.NODE_ENV !== 'test') {
    httpServer.listen(PORT, () => {
        logger.info(`Server started on port ${PORT}`)
    })
}