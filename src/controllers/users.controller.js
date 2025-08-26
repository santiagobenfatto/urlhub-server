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
            const { first_name, email_register, password } = req.body
            
            if( !first_name || !email_register || !password ) {
                return res.sendClientError({message: 'Incomplete values'})
            }
                        
            await usersService.register({ ...req.body })
            
            res.sendSuccess({message: `User with email: ${email_register} registered`})
        } catch (error) {
            if(error instanceof UserAlreadyExists){
                return res.sendClientError({message: `${error.message}`})
            }
            res.sendServerError({message: `${error.message}`})
        }
    }

    async logout(req, res){ 
        try {
            res.clearCookie(config.cookieToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            }).redirect('/')
        } catch (error) {
            res.sendServerError({message: `${error.message}`})
        }
    }

    async authVerify(req, res) {    
        try {
            const token = req.cookies[config.cookieToken]
            if (!token) return res.sendUnauthorized({ error: 'No token' })
            
            res.sendSuccess({message: 'User autorized'})
        } catch {
            res.sendForbidden({ error: 'Token inválido o expirado' })
        }
    }


    async deleteByEmailRegister(req, res) {
       try {
            const { email_register } = req.body
            
            if( !email_register  ) {
                return res.sendClientError({message: 'Incomplete values'})
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
