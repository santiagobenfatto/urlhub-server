import { UserNotFound, UserAlreadyExists, IncorrectLoginCredentials } from '../errors/custom-errors.js'
import { newId } from '../utils/generators.js'
import { createHash, generateToken, passwordValidation } from '../utils/utils.js'

export class UsersService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository
    }

    async login(userCredentials) {
        const users = await this.usersRepository.getByEmailRegister(userCredentials.email_register)
        
        if(users.length === 0){
            throw new UserNotFound('User not found')
        }
        const user = users[0]

        const validatePass = passwordValidation(userCredentials.password, user.hashed_pass)
        
        if (!validatePass) {
            throw new IncorrectLoginCredentials('Incorrect credentials')
        }
        
        const accessToken = generateToken(user)

        return accessToken
    }
      
    
    async register(userCredentials) {
        const checkUser = await this.usersRepository.checkUser(userCredentials.email_register)
        
        if(checkUser){
            throw new UserAlreadyExists('The email already exists')
        }
        if ('role' in userCredentials) {
            console.warn(`Attempt to assign a role in request body: ${userCredentials.role}`)
        }

        const newUser = {
            first_name: userCredentials.first_name || '',
            last_name: userCredentials.last_name || '',
            img_url: userCredentials.img_url || '',
            email_register: userCredentials.email_register
        }
        const userId = newId()
        const passHashed = createHash(userCredentials.password)
        newUser.id = userId
        newUser.password = passHashed
        newUser.nickname = `${userCredentials.first_name}${userId}`
        newUser.role = 'USER'

        
        const result = await this.usersRepository.create(newUser)
        
        return result
    }

    async deleteByEmailRegister(email_register) {
        const checkUser = await this.usersRepository.checkUser(email_register)

        if(!checkUser){
            throw new UserNotFound('User not found')
        }

        const result = await this.usersRepository.deleteByEmailRegister(email_register)

        return result
    }

}
