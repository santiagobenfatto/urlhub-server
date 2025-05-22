import express from 'express'
import { createServer } from 'node:http'
import config from './config/config.js'
import { __dirname, __filename } from './utils/utils.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express()
const httpServer = createServer(app)
const PORT = config.port || 3001

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(`${__dirname}/public`));
app.use(cookieParser())
app.use(cors({
    credentials: true,
    // origin: originURL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
}))


app.get('/home', (req,res) => { 
    res.send('hello word')
})

httpServer.listen(PORT, () => {
    console.log(
        `============ Server starting, running on port ${PORT} ============`
    )
})