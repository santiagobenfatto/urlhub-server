import { ElementNotFound, ElementAlreadyExists } from '../errors/custom-errors.js'
import { hubsService } from '../container.js'
import logger from '../utils/logger.js'

export class HubsController {

    async createHub(req, res) {
        try {
            const { title } = req.body
            const userId = req.user.id

            if (!title) {
                return res.sendClientError('Incomplete values')
            }

            const data = {
                userId,
                title
            }

            const result = await hubsService.createHub(data)

            logger.info('Hub created via controller', { userId, hubId: result?.id })

            res.sendSuccess({ message: 'Hub created successfully', data: result })
        } catch (error) {
            if (error instanceof ElementAlreadyExists) {
                return res.sendClientError(error.message)
            }
            res.sendServerError(error.message)
        }
    }

    async getUserHubs(req, res) {
        try {
            const userId = req.user.id

            const result = await hubsService.getUserHubs(userId)

            res.sendSuccess({ message: 'Hubs retrieved successfully', data: result })
        } catch (error) {
            res.sendServerError(error.message)
        }
    }

    async getHubById(req, res) {
        try {
            const { hubId } = req.params

            if (!hubId) {
                return res.sendClientError('Missing hub ID in the request URL')
            }

            const result = await hubsService.getHubById(hubId)

            res.sendSuccess({ message: 'Hub retrieved successfully', data: result })
        } catch (error) {
            if (error instanceof ElementNotFound) {
                return res.status(404).json({ error: error.message })
            }
            res.sendServerError(error.message)
        }
    }

    async getPublicHub(req, res) {
        try {
            const { hubId } = req.params

            if (!hubId) {
                return res.sendClientError('Missing hub ID in the request URL')
            }

            const result = await hubsService.getPublicHub(hubId)

            res.sendSuccess({ message: 'Hub retrieved successfully', data: result })
        } catch (error) {
            if (error instanceof ElementNotFound) {
                return res.status(404).json({ error: error.message })
            }
            res.sendServerError(error.message)
        }
    }

    // ========= DEPRECATED: use root GET /:alias =========
    async getPublicHubByAlias(req, res) {
        try {
            const { alias } = req.params

            if (!alias) {
                return res.sendClientError('Missing alias in the request URL')
            }

            const result = await hubsService.getPublicHubByAlias(alias)

            res.sendSuccess({ message: 'Hub retrieved successfully', data: result })
        } catch (error) {
            if (error instanceof ElementNotFound) {
                return res.status(404).json({ error: error.message })
            }
            res.sendServerError(error.message)
        }
    }

    async updateHub(req, res) {
        try {
            const { hubId } = req.params
            const { title, alias, short_link } = req.body

            if (!hubId) {
                return res.sendClientError('Missing hub ID in the request URL')
            }

            if (!title && !alias && !short_link) {
                return res.sendClientError('No fields provided for update')
            }

            const updates = { title, alias, short_link }

            const result = await hubsService.updateHub(hubId, updates)

            res.sendSuccess({ message: 'Hub updated successfully', data: result })
        } catch (error) {
            if (error instanceof ElementNotFound) {
                return res.sendClientError(error.message)
            }
            res.sendServerError(error.message)
        }
    }

    async deleteHub(req, res) {
        try {
            const { hubId } = req.params

            if (!hubId) {
                return res.sendClientError('Missing hub ID in request URL')
            }

            const result = await hubsService.deleteHub(hubId)

            logger.info('Hub deleted', { hubId })

            res.sendSuccess({ message: 'Hub removed successfully', data: result })
        } catch (error) {
            if (error instanceof ElementNotFound) {
                return res.sendClientError(error.message)
            }
            res.sendServerError(error.message)
        }
    }

    async addLinkToHub(req, res) {
        try {
            const { hubId } = req.params
            const { link_id, order_index } = req.body

            if (!hubId || !link_id) {
                return res.sendClientError('Incomplete values')
            }

            const data = {
                hubId,
                linkId: link_id,
                order_index
            }

            const result = await hubsService.addLinkToHub(data)

            res.sendSuccess({ message: 'Link added to hub successfully', data: result })
        } catch (error) {
            res.sendServerError(error.message)
        }
    }

    async removeLinkFromHub(req, res) {
        try {
            const { hubId, linkId } = req.params

            if (!hubId || !linkId) {
                return res.sendClientError('Missing hub ID or link ID in request URL')
            }

            const result = await hubsService.removeLinkFromHub(hubId, linkId)

            res.sendSuccess({ message: 'Link removed from hub successfully', data: result })
        } catch (error) {
            res.sendServerError(error.message)
        }
    }

    async getHubLinks(req, res) {
        try {
            const { hubId } = req.params

            if (!hubId) {
                return res.sendClientError('Missing hub ID in the request URL')
            }

            const result = await hubsService.getHubLinks(hubId)

            res.sendSuccess({ message: 'Hub links retrieved successfully', data: result })
        } catch (error) {
            res.sendServerError(error.message)
        }
    }

    async updateLinkOrder(req, res) {
        try {
            const { hubId, linkId } = req.params
            const { order_index } = req.body

            if (!hubId || !linkId || order_index === undefined) {
                return res.sendClientError('Incomplete values')
            }

            const result = await hubsService.updateLinkOrder(hubId, linkId, order_index)

            res.sendSuccess({ message: 'Link order updated successfully', data: result })
        } catch (error) {
            res.sendServerError(error.message)
        }
    }
}
