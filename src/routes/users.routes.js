import { Router } from "./main.router.js"


export class UserRoutes extends Router { 
    constructor(usersController){
        super()
        this.usersController = usersController
        this.init()
    }
    init() {
        //  api/v1/users/... 
        this.post('/register', 'NOTHING', ['PUBLIC'], this.usersController.register)
        this.post('/login', 'NOTHING', ['PUBLIC'], this.usersController.login)
        this.post('/auth/verify', 'JWT', ['USER'], this.usersController.authVerify)
        this.post('/logout', 'JWT', ['USER'], this.usersController.logout)
        this.patch('/update', 'JWT', ['USER'], this.usersController.updateProfile)
        this.delete('/delete', 'JWT', ['USER'], this.usersController.deleteByEmailRegister)
    }
}
