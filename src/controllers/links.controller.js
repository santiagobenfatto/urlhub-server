import { ElementNotFound } from '../errors/custom-errors.js'
import { linksService } from '../container.js'

export class LinksController { 
    async getUserLinks(req, res) {
        try {
            const { userId } = req.params

            const result = await linksService.getUserLinks(userId)

            res.sendSuccess({ message: 'Links retrieved successfully', data: result })
            
        } catch (error) {
            if (error instanceof ElementNotFound) {
                return res.sendClientError('No links found for this user')
            }
            res.sendServerError(error.message)
        }
    }

    async addLink(req, res) {
        try {
            const { user_id, title, big_link, icon, alias } = req.body

            if( !user_id || !title || !big_link || !icon ) { 
                return sendClientError(`Incomplete values`)
            }

             const data = {
                user_id,
                title,
                big_link,
                icon,
                alias
            }

            const result = await linksService(data)

            res.sendSuccess({ message: 'Link created successfully', data: result })
        } catch (error) {
            if (error instanceof ElementAlreadyExists) {
                return res.sendClientError(error.message)
            }
            res.sendServerError(error.message)
        }
    }

    async updateLink(req, res) {
        try {
            const { linkId } = req.params
            const { updates } = req.body

            if(!linkId){
                return res.sendClientError('Missing link ID in the request URL')
            }

            if (!updates || Object.keys(updates).length === 0) {
                return res.sendClientError('No fields provided for update')
            }

            const result = await linksService.updateLink(linkId, updates)
            
            res.sendSuccess({ message: 'Link updated successfully', data: result })
            
        } catch (error) {
            if( error instanceof ElementNotFound ) { 
                return res.sendClientError(error.message)
            }
            res.sendServerError(error.message)
        }
    }

        
    async removeLink(req, res) {
    try {
        const { linkId } = req.params

        if (!linkId) {
            return res.sendClientError('Missing link ID in request URL')
        }

        const result = await linksService.removeLink(linkId)

        res.sendSuccess({
            message: 'Link removed successfully',
            data: result
        })

    } catch (error) {
        if (error instanceof ElementNotFound) {
            return res.sendClientError(error.message)
        }

        res.sendServerError(error.message)
    }
    }
}

