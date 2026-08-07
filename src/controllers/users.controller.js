import { UserNotFound, UserAlreadyExists, IncorrectLoginCredentials } from '../errors/custom-errors.js'
import { usersService, hubsService } from '../container.js'
import config from '../config/config.js'
import logger from '../utils/logger.js'


export class UsersController {
    async login (req, res) {
        try {
            const { email_register, password } = req.body

            if( !email_register || !password){
                return res.sendClientError('Incomplete values')
            }

            const {accessToken, userAdapted} = await usersService.login({...req.body})

            logger.info('User logged in', { userId: userAdapted.id, email: userAdapted.email })
            console.log('USER CONTROLLER: userAdapter:', userAdapted)
            res.cookie(
                config.cookieToken, accessToken, { maxAge: 60 * 60 * 1000, httpOnly: true, secure: true, sameSite: 'None' }
            ).sendSuccess({message: 'Authorized', data: userAdapted})

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
            const { first_name, email_register, password, nickname } = req.body
            
            if( !first_name || !email_register || !password || !nickname ) {
                return res.sendClientError({message: 'Incomplete values'})
            }
                        
            const result = await usersService.register({ ...req.body })

            const userId = result.id

            try {
                await hubsService.createHub({ userId, title: 'My Hub' })
                logger.info('Hub auto-created for new user', { userId })
            } catch (hubError) {
                logger.warn('Failed to auto-create hub for new user', { userId, error: hubError.message })
            }

            logger.info('User registered via controller', { email: email_register })

            res.sendSuccess({message: `User with email: ${email_register} registered`, data: { id: userId }})
        } catch (error) {
            if(error instanceof UserAlreadyExists){
                return res.sendClientError({message: `${error.message}`})
            }
            res.sendServerError({message: `${error.message}`})
        }
    }

    async updateProfile(req, res) {
        try {
            const userId = req.user.id
            const { nickname, first_name, email, password } = req.body

            if( !nickname || !first_name || !email ) {
                return res.sendClientError({message: 'Incomplete values'})
            }

            const updatedUser = await usersService.updateProfile(userId, { nickname, first_name, email, password })

            logger.info('User updated', { userId })

            res.sendSuccess({ message: 'User updated successfully', data: updatedUser })
        } catch (error) {
            if(error instanceof UserNotFound){
                return res.sendClientError({message: `${error.message}`})
            }
            if(error instanceof UserAlreadyExists){
                return res.sendClientError({message: `${error.message}`})
            }
            res.sendServerError({message: `${error.message}`})
        }
    }

    async logout(req, res){
        try {
            console.log('REQ.USER logout:', req.user)
            res.clearCookie(config.cookieToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            }).sendSuccess({ message: 'Logout successful', data: null })

        } catch (error) {
            res.sendServerError({message: `${error.message}`})
        }
    }

    async authVerify(req, res) {    
        try {
            const { id, first_name, nickname, email, role } = req.user
            res.sendSuccess({ message: 'User authenticated', data: { id, first_name, nickname, email, role } })
        } catch (error) {
            res.sendServerError({ message: `${error.message}` })
        }
    }


    async deleteByEmailRegister(req, res) {
       try {
            const { email } = req.user
            
            if( !email  ) {
                return res.sendClientError({message: 'Incomplete values'})
            }

            await usersService.deleteByEmailRegister(email)
            
            res.sendSuccess({message: `The user with email ${email} has been deleted`, data: null}) 
        } catch (error) {
            if(error instanceof UserNotFound){
                return res.sendClientError({message: `${error.message}`})
            }
            res.sendServerError({message: `${error.message}`})
        }
    }

}
