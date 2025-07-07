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
        this.delete('/delete', ['ADMIN'], 'NOTHING', this.usersController.deleteByEmailRegister)
    }
}
