import config from '../config/config.js'
import { ElementAlreadyExists, ElementNotFound } from '../errors/custom-errors.js'
import { newId } from '../utils/generators.js'
import { shortAlias } from '../utils/generators.js'

export class LinksService {
    constructor(linksRepository) {
        this.linksRepository = linksRepository
    }

    async getUserLinks(userId) {
        const result = await this.linksRepository.getUserLinks(userId)
        return result
    }

    async addPublicLink(data){
        // console.log('data SERVICE', data)
        const linkID = newId()
        const alias = shortAlias()
        const shortLink = `${config.selfURL}/${alias}`

        const aliasExists = await this.linksRepository.checkAlias(alias)
        if (aliasExists) {
            throw new ElementAlreadyExists(`El alias '${alias}' ya está en uso.`)
        }

        const newData = {
            big_link: data.big_link
        }

        newData.id = linkID
        newData.alias = alias
        newData.short_link = shortLink
        console.log('NEW DATA DEL SERVICE', newData)
        const result = await this.linksRepository.addPublicLink(newData)
        return result
    }

    async addLink(data) {
        const linkID = newId()
        const alias = data.alias || shortAlias()
        const shortLink = `${config.selfURL}/${alias}` 
      
        const aliasExists = await this.linksRepository.checkAlias(alias)
        if (aliasExists) {
            throw new ElementAlreadyExists(`El alias '${alias}' ya está en uso.`)
        }

        const newData = {
            user_id: data.userId,
            big_link: data.bigLink
            
        }

        newData.id = linkID
        newData.alias = alias
        newData.short_link = shortLink

        const result = await this.linksRepository.addLink(newData)
        console.log('result service', result)
        return result
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
