import { UserNotFound, UserAlreadyExists, IncorrectLoginCredentials } from '../errors/custom-errors.js'
import { usersService } from '../container.js'
import config from '../config/config.js'


export class UsersController {
    async login (req, res) {
        try {
            const { email_register, password } = req.body
            
            if( !email_register || !password){
                return res.sendClientError('Incomplete values')
            }

            const accessToken = await usersService.login({...req.body})
            
            res.cookie(
                config.cookieToken, accessToken, { maxAge: 60 * 60 * 1000, httpOnly: true }
            ).send({message: 'Authorized'})

        } catch (error) {
            if(error instanceof UserNotFound){
                return res.sendClientError({error: `${error.message}`, message: `Client error, user not found.`})
            }
            if(error instanceof IncorrectLoginCredentials){
                return res.sendClientError({error: `${error.message}`, message: `Client error, incorrect login credentials.`})
            }
            res.sendServerError({error: `${error.message}`, message: `Server error, something else happened.`})
        }
    }
      
    async register(req, res) {
       try {
            const { email_register, password } = req.body
            
            if( !email_register || !password ) {
                return res.sendClientError('Incomplete values')
            }
            
            console.log('Incoming register request body:', req.body)
            console.log('Cookies:', req.cookies)
            
            const result = await usersService.register({ ...req.body })
            console.log('Register result:', result)
            
            res.sendSuccess({message: `User with email: ${email_register} registered`})
        } catch (error) {
            if(error instanceof UserAlreadyExists){
                return res.sendClientError({message: `${error.message}`})
            }console.log(error)
            res.sendServerError({message: `${error.message}`})
        }
    }

    async deleteByEmailRegister(req, res) {
       try {
            const { email_register } = req.body
            
            if( !email_register  ) {
                return res.sendClientError('Incomplete values')
            }

            await usersService.deleteByEmailRegister(email_register)
            
            res.sendSuccess({status: `Delete successful`, message: `The user with email ${email_register} has been deleted`}) 
        } catch (error) {
            if(error instanceof UserNotFound){
                return res.sendClientError({message: `${error.message}`})
            }
            res.sendServerError({message: `${error.message}`})
        }
    }

}
