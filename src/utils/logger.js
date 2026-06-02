import winston from 'winston'
import { MongoDB } from 'winston-mongodb'
import config from '../config/config.js'

const devFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
        return `${timestamp} ${level}: ${message}${metaStr}`
    })
)

const prodFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
)

const transports = [
    new winston.transports.Console(),
    new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880,
        maxFiles: 5
    }),
    new winston.transports.File({
        filename: 'logs/combined.log',
        maxsize: 5242880,
        maxFiles: 5
    })
]

if (config.mongoLogsUri) {
    transports.push(new MongoDB({
        level: 'info',
        db: config.mongoLogsUri,
        collection: 'logs',
        storeHost: true,
        capped: true,
        cappedSize: 52428800,
        metaKey: 'metadata'
    }))
}

const logger = winston.createLogger({
    level: config.logLevel || 'info',
    format: config.nodeEnv === 'production' ? prodFormat : devFormat,
    transports
})

export const requestLogger = (req, res, next) => {
    const start = Date.now()

    res.on('finish', () => {
        const duration = Date.now() - start
        const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'

        logger.log(level, `${req.method} ${req.originalUrl}`, {
            status: res.statusCode,
            duration: `${duration}ms`,
            userId: req.user?.id || 'anonymous',
            branch: config.branch
        })
    })

    next()
}

export default logger
