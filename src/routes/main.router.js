
import { Router as expressRouter } from 'express'
import { strategyEnum } from '../utils/passportStrategies.js'
import passport from 'passport'

expressRouter()

const permissions = { 
    ADMIN: ['GET', 'POST', 'PUT', 'DELETE'],
    USER: ['GET', 'POST', 'PUT', 'DELETE'],
    PUBLIC: ['GET']
}


export class Router {
    constructor(){
        this.router = expressRouter()
        this.initMiddlewares()
        //this.init()
    }

    getRouter (){
        return this.router
    }

    init() { }

    initMiddlewares() {
        // Middleware para respuestas personalizadas
        this.router.use((req, res, next) => {
            res.sendSuccess = (data) => res.status(200).json({ data })
            res.sendClientError = (error) => res.status(400).json({ error })
            res.sendUnauthorized = (error) => res.status(401).json({ error })
            res.sendForbidden = (error) => res.status(403).json({ error })
            res.sendServerError = (error) => res.status(500).json({ error })
            next()
        })

        // Middleware de autenticación global con Passport
        this.router.use(passport.initialize())
    }

    mapRoute(method, path, customStrategy, policies, ...callbacks){ 
        this.router[method](path, this.passportStrategy(customStrategy), this.policies(policies), this.applyCallbacks(callbacks))
    }

    get(path, customStrategy, policies, ...callbacks){
        this.mapRoute('get', path, customStrategy, policies, ...callbacks)
    }
    post(path, customStrategy, policies, ...callbacks){
        this.mapRoute('post', path, customStrategy, policies, ...callbacks)
    }
    put(path, customStrategy, policies, ...callbacks){
        this.mapRoute('put', path, customStrategy, policies, ...callbacks)
    }

    patch(path, customStrategy, policies, ...callbacks){
        this.mapRoute('patch', path, customStrategy, policies, ...callbacks)
    }

    delete(path, customStrategy, policies, ...callbacks){
        this.mapRoute('delete', path, customStrategy, policies, ...callbacks)
    }


    passportStrategy = (strategy) => (req, res, next) => {
        
        if (strategy.toLowerCase() === strategyEnum.JWT.toLowerCase()) {
            passport.authenticate(strategy, function (err, user, info) {
                if (err) return next(err)

                if (!user)
                    return res.status(401).send({
                        error: info.messages ? info.messages : info.toString()
                    })
                
                req.user = user
                console.log(' ====== USER param de la strategy.', user)
                
                next()
            })(req, res, next)
        } else {
            next()
        }
    }

    policies = (policies) => (req, res, next) => {

        if (policies.includes('PUBLIC')) return next()

        const user = req.user
        
        console.log(' ====== USER DEL POLICIES USER ROLE ====== ', user)//undefined
        //console.log(' ===== USER ROLE: ===== ', user.role) //no ese puede leer eporque no existe user.
        const userRoleUpper = user.role.toUpperCase()
        //permissions['jwt'].includes('GET')
        if (!user || !permissions[userRoleUpper]?.includes(req.method)) {
            return res.sendForbidden('You do not have the required permissions')
        }

        next()
    }
    

    applyCallbacks(callbacks) {
        return callbacks.map((callback) => async (...params) => {
            try {
                await callback.apply(this, params)//req, res, next
            } catch (error) {
                params[1].status(500).json({ error: error.message })
            }
        })
    }
}