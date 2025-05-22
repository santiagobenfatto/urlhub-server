import dotenv from 'dotenv'

dotenv.config({path: '.env.dev'})

export default {
    privateKey: process.env.PRIVATE_KEY,
    cookieToken: process.env.COOKIE_TOKEN,
    port: process.env.PORT,
    tursoDB: process.env.TURSO_DB_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
}