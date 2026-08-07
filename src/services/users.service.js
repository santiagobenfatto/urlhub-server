import { UserNotFound, UserAlreadyExists, IncorrectLoginCredentials } from '../errors/custom-errors.js'
import { newId } from '../utils/generators.js'
import { createHash, generateToken, passwordValidation } from '../utils/utils.js'
import logger from '../utils/logger.js'

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
        
        const userAdapted = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            nickname: user.nickname,
            email: user.email,
        }
        const accessToken = generateToken(user)
        return { accessToken, userAdapted }
    }
    
    async register(userCredentials) {
        const checkUser = await this.usersRepository.checkUser(userCredentials.email_register)
        logger.debug('Register attempt for email:', userCredentials.email_register)
        if(checkUser){
            throw new UserAlreadyExists('The email already exists')
        }
        const checkNickname = await this.usersRepository.checkNickname(userCredentials.nickname)
        if(checkNickname){
            throw new UserAlreadyExists('The nickname already exists')
        }
        if ('role' in userCredentials) {
            logger.warn('Attempt to assign role in request body', { role: userCredentials.role })
        }

        const newUser = {
            first_name: userCredentials.first_name || '',
            last_name: '',
            img_url: '',
            nickname: userCredentials.nickname,
            email_register: userCredentials.email_register
        }
        const userId = newId()
        const passHashed = createHash(userCredentials.password)
        newUser.id = userId
        newUser.password = passHashed
        newUser.role = 'USER'

        
        const result = await this.usersRepository.create(newUser)
        logger.debug('Register result:', result)
        return { id: userId }
    }

    async updateProfile(userId, updates) {
        const currentUser = await this.usersRepository.getById(userId)

        if(!currentUser){
            throw new UserNotFound('User not found')
        }

        const profile = {}

        if (updates.first_name !== undefined) {
            profile.first_name = updates.first_name
        }

        if (updates.nickname !== undefined) {
            const checkNickname = await this.usersRepository.checkNicknameExcept(userId, updates.nickname)
            if(checkNickname){
                throw new UserAlreadyExists('The nickname already exists')
            }
            profile.nickname = updates.nickname
        }

        if (updates.email !== undefined) {
            const checkEmail = await this.usersRepository.checkEmailExcept(userId, updates.email)
            if(checkEmail){
                throw new UserAlreadyExists('The email already exists')
            }
            profile.email = updates.email
        }

        if (updates.password) {
            profile.hashed_pass = createHash(updates.password)
        }

        if (Object.keys(profile).length > 0) {
            await this.usersRepository.updateById(userId, profile)
        }

        const updatedUser = await this.usersRepository.getById(userId)

        return {
            id: updatedUser.id,
            first_name: updatedUser.first_name,
            last_name: updatedUser.last_name,
            nickname: updatedUser.nickname,
            email: updatedUser.email,
            role: updatedUser.role,
        }
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
