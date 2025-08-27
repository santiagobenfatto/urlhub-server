import { Router } from "./main.router.js"


export class UserRoutes extends Router { 
    constructor(usersController){
        super()
        this.usersController = usersController
        this.init()
    }
    init() {    
        this.post('/register', ['PUBLIC'], 'NOTHING', this.usersController.register)
        this.post('/login', ['PUBLIC'], 'NOTHING', this.usersController.login)
        this.post('/auth/verify', ['PUBLIC'], 'NOTHING', this.usersController.authVerify)
        this.post('/logout', ['USER'], 'JWT', this.usersController.logout)
        this.delete('/delete', ['ADMIN'], 'NOTHING', this.usersController.deleteByEmailRegister)
    }
}
