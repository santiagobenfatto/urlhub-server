import { ElementAlreadyExists, ElementNotFound } from '../errors/custom-errors.js'
import { newId } from '../utils/generators.js'
import { shortAlias } from '../utils/generators.js'
import { validateUrl } from '../utils/urlValidator.js'
import config from '../config/config.js'
import logger from '../utils/logger.js'

export class AliasResolverService {
    constructor(linksRepository, hubsRepository) {
        this.linksRepository = linksRepository
        this.hubsRepository = hubsRepository
    }

    async resolveAlias(alias) {
    const link = await this.linksRepository.getLinkByAlias(alias)

    if (link) {
        return {
            type: 'link',
            ...link
        }
    }

    const hub = await this.hubsRepository.getHubByAlias(alias)

    if (hub) {
        return {
            type: 'hub',
            ...hub
        }
    }

    throw new ElementNotFound(`The alias '${alias}' does not exist.`)
}
}
