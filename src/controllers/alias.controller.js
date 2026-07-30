import { ElementNotFound } from '../errors/custom-errors.js'
import { aliasResolverService } from '../container.js'
import logger from '../utils/logger.js'

export class AliasResolverController {

    async resolveAlias(req, res) {
        try {
            const { alias } = req.params

            const result = await aliasResolverService.resolveAlias(alias)

            logger.info('Alias resolved', {
                alias,
                type: result.type,
                id: result.data?.id,
                ip: req.ip
            })

            return res.sendSuccess(result)

        } catch (error) {

            if (error instanceof ElementNotFound) {
                logger.warn('Alias not found', {
                    alias: req.params.alias,
                    ip: req.ip
                })

                return res.status(404).json({
                    error: 'Alias not found'
                })
            }

            logger.error('Error resolving alias', {
                alias: req.params.alias,
                ip: req.ip,
                error: error.message
            })

            return res.sendServerError({
                error: 'Internal server error'
            })
        }
    }
}