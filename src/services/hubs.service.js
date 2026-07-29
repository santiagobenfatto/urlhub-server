import { ElementAlreadyExists, ElementNotFound } from '../errors/custom-errors.js'
import { newId } from '../utils/generators.js'
import { shortAlias } from '../utils/generators.js'
import config from '../config/config.js'
import logger from '../utils/logger.js'

export class HubsService {
    constructor(hubsRepository) {
        this.hubsRepository = hubsRepository
    }

    async createHub(data) {
        const userId = data.userId
        const userHasHub = await this.hubsRepository.checkUserHub(userId)

        if (userHasHub) {
            throw new ElementAlreadyExists(`El usuario ya tiene un hub.`)
        }

        const hubId = newId()
        const alias = shortAlias()

        const newHub = {
            id: hubId,
            user_id: userId,
            title: data.title,
            alias,
        }

        const result = await this.hubsRepository.createHub(newHub)

        logger.info('Hub created', { hubId, userId })

        return result
    }

    async getUserHubs(userId) {
        const result = await this.hubsRepository.getUserHubs(userId)
        return result
    }

    async getHubById(hubId) {
        const result = await this.hubsRepository.getHubById(hubId)
        return result
    }

    async updateHub(hubId, updates) {
        const hubExists = await this.hubsRepository.checkHub(hubId)

        if (!hubExists) {
            throw new ElementNotFound(`El hub con ID ${hubId} no existe.`)
        }

        const result = await this.hubsRepository.updateHub(hubId, updates)
        return result
    }

    async deleteHub(hubId) {
        const hubExists = await this.hubsRepository.checkHub(hubId)

        if (!hubExists) {
            throw new ElementNotFound(`El hub con ID ${hubId} no existe.`)
        }

        const result = await this.hubsRepository.deleteHub(hubId)
        return result
    }

    async addLinkToHub(data) {
        const linkId = newId()

        const newHubLink = {
            id: linkId,
            hub_id: data.hubId,
            link_id: data.linkId,
            order_index: data.order_index || 0
        }

        const result = await this.hubsRepository.addLinkToHub(newHubLink)
        return result
    }

    async removeLinkFromHub(hubId, linkId) {
        const result = await this.hubsRepository.removeLinkFromHub(hubId, linkId)
        return result
    }

    async getHubLinks(hubId) {
        const result = await this.hubsRepository.getHubLinks(hubId)
        return result
    }

    async getPublicHub(hubId) {
        const result = await this.hubsRepository.getPublicHub(hubId)

        if (!result) {
            throw new ElementNotFound(`El hub con ID ${hubId} no existe.`)
        }

        return result
    }

    async getPublicHubByAlias(alias) {
        const result = await this.hubsRepository.getPublicHubByAlias(alias)

        if (!result) {
            throw new ElementNotFound(`El hub con alias '${alias}' no existe.`)
        }

        return result
    }

    async updateLinkOrder(hubId, linkId, orderIndex) {
        const result = await this.hubsRepository.updateLinkOrder(hubId, linkId, orderIndex)
        return result
    }
}
