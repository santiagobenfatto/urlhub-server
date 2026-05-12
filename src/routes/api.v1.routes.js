import { Router } from "express"
import { LinksRoutes } from './links.routes.js'
import { UserRoutes } from './users.routes.js'
import { HubsRoutes } from './hubs.routes.js'
import { UsersController } from '../controllers/users.controller.js'
import { LinksController } from '../controllers/links.controller.js'
import { HubsController } from '../controllers/hubs.controller.js'


const apiV1Routes = Router()

const linksController = new LinksController()
const usersController = new UsersController()
const hubsController = new HubsController()

const linksRoutes = new LinksRoutes(linksController)
const userRoutes = new UserRoutes(usersController)
const hubsRoutes = new HubsRoutes(hubsController)


apiV1Routes.use('/links', linksRoutes.getRouter())
apiV1Routes.use('/users', userRoutes.getRouter())
apiV1Routes.use('/hubs', hubsRoutes.getRouter())

export default apiV1Routes