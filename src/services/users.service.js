import { UserNotFound, UserAlreadyExists, IncorrectLoginCredentials, ValidationError } from '../errors/custom-errors.js'
import { newId } from '../utils/generators.js'
import { createHash, generateToken, passwordValidation, validateEmail } from '../utils/utils.js'
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

        if (updates.first_name !== undefined && updates.first_name !== null) {
            const first_name = updates.first_name.trim()
            if (first_name.length === 0) {
                throw new ValidationError('first_name cannot be empty')
            }
            profile.first_name = first_name
        }

        if (updates.nickname !== undefined && updates.nickname !== null) {
            const nickname = updates.nickname.trim()
            if (nickname.length === 0) {
                throw new ValidationError('nickname cannot be empty')
            }
            const checkNickname = await this.usersRepository.checkNicknameExcept(userId, nickname)
            if(checkNickname){
                throw new UserAlreadyExists('The nickname already exists')
            }
            profile.nickname = nickname
        }

        if (updates.email !== undefined && updates.email !== null) {
            const email = updates.email.trim().toLowerCase()
            if (!validateEmail(email)) {
                throw new ValidationError('Invalid email format')
            }
            const checkEmail = await this.usersRepository.checkEmailExcept(userId, email)
            if(checkEmail){
                throw new UserAlreadyExists('The email already exists')
            }
            profile.email = email
        }

        if (updates.password !== undefined && updates.password !== null) {
            if (typeof updates.password !== 'string' || updates.password.trim().length === 0) {
                throw new ValidationError('password cannot be empty')
            }
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
