import { Router } from "express"
import { LinksRoutes } from './links.routes.js'
import { UserRoutes } from './users.routes.js'
import { linksController, usersController } from "../container.js"


const apiV1Routes = Router()

const linksRoutes = new LinksRoutes(linksController)
const userRoutes = new UserRoutes(usersController)


apiV1Routes.use('/links', linksRoutes.getRouter())
apiV1Routes.use('/users', userRoutes.getRouter())

export default apiV1Routes