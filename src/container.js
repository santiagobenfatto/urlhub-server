import { LinksMySQL } from './dao/mysql/links.mysql.js'
import { UsersMySQL } from './dao/mysql/users.mysql.js'
import { turso } from './dao/db.config.js'

const linksMySQL = new LinksMySQL(turso)
const usersMySQL = new UsersMySQL(turso)

//Repositories

import { LinksRepository } from './links.repository.js'
import { UsersRepository } from './users.repository.js'

const linksRepository = new LinksRepository(linksMySQL)
const usersRepository = new UsersRepository(usersMySQL)

//Services

import { LinksService } from './links.service.js'
import { UsersService } from './users.service.js'

const linksService = new LinksService(linksRepository)
const usersService = new UsersService(usersRepository)

export { linksService, usersService }