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
        return await this.dao.checl(linkId)
    }

    async updateLink(linkId, updates) {
        return await this.dao.updateLink(linkId, updates)
    }

    async removeLink(linkId) {
        return await this.dao.removeLink(linkId)
    }
}
