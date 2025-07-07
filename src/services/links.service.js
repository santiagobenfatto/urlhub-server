import config from '../config/config.js'
import { ElementAlreadyExists, ElementNotFound } from '../errors/custom-errors.js'
import { shortAlias } from '../utils/generators.js'

export class LinksService {
    constructor(linksRepository) {
        this.linksRepository = linksRepository
    }

    async getUserLinks(userId) {
        //This can be an array, but it can be empty
        const result = await this.linksRepository.getUserLinks(userId)
        return result
    }

    async addLink(data) {

        const alias = data.alias || shortAlias()
        const shortLink = `${config.selfURL}/${data.shortLink || alias}` 
      
        const aliasExists = await this.linksRepository.checkAlias(alias)
        if (aliasExists) {
            throw new ElementAlreadyExists(`El alias '${data.alias}' ya está en uso.`)
        }

        data.alias = alias
        data.short_link = shortLink

        await this.linksRepository.addLink(data)

    }

    async updateLink(linkId, updates) {
        const checkLink = await this.linksRepository.checkLink(linkId)

        if(!checkLink) { 
            throw new ElementNotFound(`El link ID ${linkId} no existe.`)
        }

        const result = await this.linksRepository.updateLink(linkId, updates)
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
}
