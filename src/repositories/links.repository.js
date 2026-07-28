export class LinksRepository {
    constructor(dao) {
        this.dao = dao
    }

    async getUserLinks(userId) {
        return await this.dao.getUserLinks(userId)
    }

    async addLink(link) {
        return await this.dao.addLink(link)
    }

    async addPublicLink(link) {
        return await this.dao.addPublicLink(link)
    }

    async checkAlias(alias) { 
        return await this.dao.checkAlias(alias)
    }

    async checkLink(linkId) {
        return await this.dao.checkLink(linkId)
    }

    async updateLink(linkId, updates) {
        return await this.dao.updateLink(linkId, updates)
    }

    async getPublicLink(linkId) {
        return await this.dao.getPublicLink(linkId)
    }

    async migratePublicLink(userId, publicLink) {
        return await this.dao.migratePublicLink(userId, publicLink)
    }

    async removeLink(linkId) {
        return await this.dao.removeLink(linkId)
    }

    async getLinkByAlias(alias) {
        return await this.dao.getLinkByAlias(alias)
    }
}
