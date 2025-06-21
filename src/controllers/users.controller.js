import { UserNotFound, UserAlreadyExists } from "../errors/custom-errors"

export default class UsersController {
    constructor(usersService) {
        this.usersService = usersService
    }

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

            const register = await usersService.register({ ...req.body })

            res.send(register)
        } catch (error) {
            if(error instanceof UserAlreadyExists){
                return res.sendClientError({message: `${error.message}`})
            }
            res.sendServerError({message: `${error.message}`})
        }
    }

}
