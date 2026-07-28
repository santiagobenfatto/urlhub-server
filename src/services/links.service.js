import { ElementAlreadyExists, ElementNotFound } from '../errors/custom-errors.js'
import { newId } from '../utils/generators.js'
import { shortAlias } from '../utils/generators.js'
import { validateUrl } from '../utils/urlValidator.js'
import config from '../config/config.js'
import logger from '../utils/logger.js'

export class LinksService {
    constructor(linksRepository) {
        this.linksRepository = linksRepository
    }

    async getUserLinks(userId) {
        const result = await this.linksRepository.getUserLinks(userId)
        return result
    }

    async addPublicLink(data){
        await validateUrl(data.big_link)

        const linkID = newId()
        const alias = shortAlias()
        const shortLink = `${config.backendURL}/${alias}`

        const aliasExists = await this.linksRepository.checkAlias(alias)
        if (aliasExists) {
            throw new ElementAlreadyExists(`El alias '${alias}' ya está en uso.`)
        }

        const newData = {
            big_link: data.big_link,
            icon: data.icon || ''
        }

        newData.id = linkID
        newData.alias = alias
        newData.short_link = shortLink

        const result = await this.linksRepository.addPublicLink(newData)

        logger.info('Public link created', { linkId: linkID, alias })

        return result
    }

    async addLink(data) {
        await validateUrl(data.big_link)

        const linkID = newId()
        const alias = data.alias || shortAlias()
        const shortLink = `${config.backendURL}/${alias}`
      
        const aliasExists = await this.linksRepository.checkAlias(alias)
        if (aliasExists) {
            throw new ElementAlreadyExists(`El alias '${alias}' ya está en uso.`)
        }

        const newData = {
            user_id: data.user_id,
            big_link: data.big_link,
            title: data.title,
            icon: data.icon || ''
        }

        newData.id = linkID
        newData.alias = alias
        newData.short_link = shortLink

        const result = await this.linksRepository.addLink(newData)

        logger.info('Link created', { linkId: linkID, alias, userId: data.user_id })

        return result
    }

    async updateLink(linkId, updates) {
        const checkLink = await this.linksRepository.checkLink(linkId)

        if(!checkLink) { 
            throw new ElementNotFound(`El link ID ${linkId} no existe.`)
        }

        if (updates.alias) {
            updates.short_link = `${config.backendURL}/${updates.alias}`
        }

        const result = await this.linksRepository.updateLink(linkId, updates)
        return result
    }

    async migratePublicLink(userId, linkId) {
        const publicLink = await this.linksRepository.getPublicLink(linkId)

        if (!publicLink) {
            throw new ElementNotFound(`El enlace público con ID ${linkId} no existe.`)
        }

        const result = await this.linksRepository.migratePublicLink(userId, publicLink)

        logger.info('Public link migrated', { linkId, userId })

        return result
    }

    async removeLink(linkId) {
        const checkLink = await this.linksRepository.checkLink(linkId)

        if(!checkLink) { 
            throw new ElementNotFound(`El link ID ${linkId} no existe.`)
        }

        const result = await this.linksRepository.removeLink(linkId)
        return result
    }

    async redirectByAlias(alias) {
        const result = await this.linksRepository.getLinkByAlias(alias)

        if (!result) {
            throw new ElementNotFound(`El enlace con alias '${alias}' no existe.`)
        }

        return result.big_link
    }
}
