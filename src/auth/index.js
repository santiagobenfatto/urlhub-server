import passport from 'passport'
import JwtPassport from 'passport-jwt'
import config from '../config/config.js'


const JWTStrategy = JwtPassport.Strategy
const ExtractJWT = JwtPassport.ExtractJwt

const initializePassport = () => {
    passport.use('jwt', new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: config.privateKey
    },
        async (jwt_payload, done) => {
            try {
                console.log('====JWT_PAYLOAD====', jwt_payload)
                return done(null, jwt_payload.user)
            } catch (error) {
                return done(error)
            }
    }))
    app.use(passport.initialize())
}

const cookieExtractor = req => {
    let token = null
    if (req && req.cookies) {
        token = req.cookies[config.cookieToken]
    }
    return token
}

export default initializePassport