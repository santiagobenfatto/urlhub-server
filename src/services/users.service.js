import { UserNotFound, UserAlreadyExists } from "../errors/custom-errors"

export class UsersService {
    constructor(usersRepository){
        this.usersRepository = usersRepository
    }

    async login(userCredentials){
        const userData = await this.usersRepository.getByEmailRegister(userCredentials.email)
        if(userData.length == 0){
            throw new UserNotFound('Usuario no encontrado')
        }

        const validatePass = passwordValidation(userCredentials.password, userData.password)
        
        if (!validatePass) {
            throw new IncorrectLoginCredentials('Incorrect credentials')
        }
        
        const accessToken = generateToken(userData)

        return accessToken
    }
      
    
    async register(userCredentials){
        const checkUser = this.usersRepository.checkUser(userCredentials.email)
        
        if(!checkUser){
            throw new UserAlreadyExists('El email ingresado ya pertenece a un usuario registrado')
        }
        
        const newUser = {
            first_name: userCredentials.first_name,
            last_name: userCredentials.last_name,
            email_register: userCredentials.email
        }
        
        const passHashed = createHash(userCredentials.password)
        newUser.password = passHashed

        const result = await this.usersRepository.create(newUser)
        
        return result
    }

}
