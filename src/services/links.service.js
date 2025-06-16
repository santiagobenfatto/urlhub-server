import config from '../config/config.js'
import { ElementAlreadyExists, ElementNotFound } from '../errors/custom-errors.js'
import { shortAlias } from '../utils/shortener.js'

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

        const linkData = {
            user_id: data.user_id,
            title: data.title,
            big_link: data.bigLink,
            short_link: shortLink,
            icon: data.icon,
            alias: alias
        }

        const aliasExists = await this.linksRepository.checkAlias(linkData.alias)
        if (aliasExists) {
            throw new ElementAlreadyExists(`El alias '${linkData.alias}' ya está en uso.`)
        }

        await this.linksRepository.addLink(linkData)

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
