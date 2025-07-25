import dotenv from 'dotenv'

const environment = 'developer'

dotenv.config({
    path: environment === 'developer' ? `./.env.dev` : `./.env.prod`
})

// console.log(process.env.TURSO_DB_URL)

export default {
    privateKey: process.env.PRIVATE_KEY,
    cookieToken: process.env.COOKIE_TOKEN,
    port: process.env.PORT,
    tursoDB: process.env.TURSO_DB_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
    originURL: process.env.ORIGIN_URL
}