import express from 'express'
import { createServer } from 'node:http'
import config from './config/config.js'
import { __dirname } from './utils/utils.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import apiV1Routes from './routes/api.v1.routes.js'
import initializePassport from './auth/index.js'

const app = express()
const httpServer = createServer(app)
const PORT = config.port || 3001
const originURL = config.originURL
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(`${__dirname}/public`))
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: originURL,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS']
}))

initializePassport(app)

app.use('/api/v1', apiV1Routes)


httpServer.listen(PORT, () => {
    console.log(
        `============ Server starting, running on port ${PORT} ============`
    )
})