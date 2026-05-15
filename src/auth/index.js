import passport from 'passport'
import passportJwt from 'passport-jwt'
import config from '../config/config.js'
import logger from '../utils/logger.js'


const JWTStrategy = passportJwt.Strategy
const ExtractJWT = passportJwt.ExtractJwt

const initializePassport = (app) => {
    passport.use('jwt', new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: config.privateKey
    },
        async (jwt_payload, done) => {
            try {
                logger.debug('JWT authenticated', { userId: jwt_payload.user?.id })
                return done(null, jwt_payload.user)
            } catch (error) {
                logger.error('JWT authentication error', { error: error.message })
                return done(error)
            }
    }))
    app.use(passport.initialize())
    logger.info('Passport initialized with JWT strategy')
}

const cookieExtractor = req => {
    let token = null
    if (req && req.cookies) {
        token = req.cookies[config.cookieToken]
    } else if (req && req.headers.cookie){
        token = req.headers.cookie.split('=')[1]
    }
    return token
}

export default initializePassport