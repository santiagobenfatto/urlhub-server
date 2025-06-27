import { UserNotFound, UserAlreadyExists, IncorrectLoginCredentials } from '../errors/custom-errors.js'
import { createHash, generateToken, passwordValidation } from '../utils/utils.js'

export class UsersService {
    constructor(usersRepository){
        this.usersRepository = usersRepository
    }

    async login(userCredentials){
        const userData = await this.usersRepository.getByEmailRegister(userCredentials.email_register)

        if(userData.length == 0){
            throw new UserNotFound('User not found')
        }

        const validatePass = passwordValidation(userCredentials.password, userData.hashed_pass)
        
        if (!validatePass) {
            throw new IncorrectLoginCredentials('Incorrect credentials')
        }
        
        const accessToken = generateToken(userData)

        return accessToken
    }
      
    
    async register(userCredentials){
        const checkUser = await this.usersRepository.checkUser(userCredentials.email_register)

        if(checkUser){
            throw new UserAlreadyExists('The email already exists')
        }
        
        const newUser = {
            first_name: userCredentials.first_name || '',
            last_name: userCredentials.last_name || '',
            nickname: userCredentials.nickname || '',
            img_url: userCredentials.img_url || '',
            email_register: userCredentials.email_register
        }
        
        const passHashed = createHash(userCredentials.password)
        newUser.password = passHashed

        const result = await this.usersRepository.create(newUser)
        
        return result
    }

}
