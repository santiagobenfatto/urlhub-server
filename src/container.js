import { LinksMySQL } from './dao/mysql/links.mysql.js'
import { UsersMySQL } from './dao/mysql/users.mysql.js'
import { turso } from './dao/db.config.js'

const linksMySQL = new LinksMySQL(turso)
const usersMySQL = new UsersMySQL(turso)

//Repositories

import { LinksRepository } from './repositories/links.repository.js'
import { UsersRepository } from './repositories/users.repository.js'

const linksRepository = new LinksRepository(linksMySQL)
const usersRepository = new UsersRepository(usersMySQL)

//Services

import { LinksService } from './services/links.service.js'
import { UsersService } from './services/users.service.js'

export const linksService = new LinksService(linksRepository)
export const usersService = new UsersService(usersRepository)

//Controllers

// import { LinksController } from './controllers/links.controller.js'
// import { UsersController } from './controllers/users.controller.js'

// export const linksController = new LinksController(linksService)
// export const usersController = new UsersController(usersService)


