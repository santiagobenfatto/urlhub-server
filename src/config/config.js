import dotenv from 'dotenv'

const environment = 'developer'

dotenv.config({
    path: environment === 'developer' ? `./.env.dev` : `./.env.prod`
})

export default {
    privateKey: process.env.PRIVATE_KEY,
    cookieToken: process.env.COOKIE_TOKEN,
    port: process.env.PORT,
    tursoDB: process.env.TURSO_DB_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
    originURL: process.env.ORIGIN_URL,
    mongoLogsUri: process.env.MONGO_LOGS_URI,
    branch: process.env.VERCEL_GIT_COMMIT_REF || process.env.BRANCH || 'local',
    logLevel: process.env.LOG_LEVEL || 'info',
    nodeEnv: environment
}