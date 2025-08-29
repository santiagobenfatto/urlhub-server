import { Router } from "./main.router.js"


export class UserRoutes extends Router { 
    constructor(usersController){
        super()
        this.usersController = usersController
        this.init()
    }
    init() {    
        this.post('/register', 'NOTHING', ['PUBLIC'], this.usersController.register)
        this.post('/login', 'NOTHING', ['PUBLIC'], this.usersController.login)
        this.post('/login/auth/verify', 'NOTHING', ['PUBLIC'], this.usersController.authVerify)
        this.post('/logout', 'JWT', ['USER'], this.usersController.logout)
        this.delete('/delete', 'NOTHING', ['ADMIN'], this.usersController.deleteByEmailRegister)
    }
}
