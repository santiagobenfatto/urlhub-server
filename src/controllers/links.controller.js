import { ElementNotFound } from '../errors/custom-errors.js'
import { linksService } from '../container.js'

export class LinksController {
    
    async getUserLinks(req, res) {
        try {
            const userId = req.user.id

            const result = await linksService.getUserLinks(userId)

            res.sendSuccess({ message: 'Links retrieved successfully', data: result })
            
        } catch (error) {
            if (error instanceof ElementNotFound) {
                return res.sendClientError('No links found for this user')
            }
            res.sendServerError(error.message)
        }
    }
 
    async addPublicLink(req, res) {
        try {
            const { big_link } = req.body
            // console.log('REQ.BODY || controllers ', req.body)

            if(!big_link) { 
                return res.sendClientError(`Incomplete values`)
            }
            
            const result = await linksService.addPublicLink(req.body)

            res.sendSuccess({ message: 'Link created successfully', data: result })
        } catch (error) {
            if (error instanceof ElementAlreadyExists) {
                return res.sendClientError(error.message)
            }
            res.sendServerError(error.message)
        }
    }

    async addLink(req, res) {
        try {
            const { title, big_link, icon, alias } = req.body
            const userId = req.user.id

            if( !title || !big_link || !icon ) { 
                return res.sendClientError(`Incomplete values`)
            }

             const data = {
                user_id: userId,
                title,
                big_link,
                icon,
                alias
            }

            const result = await linksService.addLink(data)

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

