import { Router } from "express"
import { LinksRoutes } from './links.routes.js'
import { UserRoutes } from './users.routes.js'
import { UsersController } from '../controllers/users.controller.js'
import { LinksController } from '../controllers/links.controller.js'


const apiV1Routes = Router()

const usersController = new UsersController()
const linksController = new LinksController()

const linksRoutes = new LinksRoutes(linksController)
const userRoutes = new UserRoutes(usersController)


apiV1Routes.use('/links', linksRoutes.getRouter())
apiV1Routes.use('/users', userRoutes.getRouter())

export default apiV1Routes