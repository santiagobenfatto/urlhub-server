import { ElementNotFound } from '../errors/custom-errors.js'
import { linksService } from '../container.js'
import logger from '../utils/logger.js'

export class RedirectController {

    async redirectByAlias(req, res) {
        try {
            const { alias } = req.params

            const bigLink = await linksService.redirectByAlias(alias)

            logger.info('Redirect', { alias, ip: req.ip })

            res.redirect(302, bigLink)
        } catch (error) {
            if (error instanceof ElementNotFound) {
                return res.status(404).json({ error: 'Link not found' })
            }
            res.status(500).json({ error: error.message })
        }
    }
}
