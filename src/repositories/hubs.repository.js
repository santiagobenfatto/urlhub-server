export class HubsRepository {
    constructor(dao) {
        this.dao = dao
    }

    async createHub(hub) {
        return await this.dao.createHub(hub)
    }

    async getUserHubs(userId) {
        return await this.dao.getUserHubs(userId)
    }

    async getHubById(hubId) {
        return await this.dao.getHubById(hubId)
    }
    
    async getHubByAlias(alias) {
        return await this.dao.getHubByAlias(alias)
    }

    async getHubLinks(hubId) {
        return await this.dao.getHubLinks(hubId)
    }

    async getPublicHub(hubId) {
        return await this.dao.getPublicHub(hubId)
    }

    async getPublicHubByAlias(alias) {
        return await this.dao.getPublicHubByAlias(alias)
    }

    async updateHub(hubId, updates) {
        return await this.dao.updateHub(hubId, updates)
    }

    async deleteHub(hubId) {
        return await this.dao.deleteHub(hubId)
    }

    async checkHub(hubId) {
        return await this.dao.checkHub(hubId)
    }

    async checkUserHub(userId) {
        return await this.dao.checkUserHub(userId)
    }

    async addLinkToHub(hubLink) {
        return await this.dao.addLinkToHub(hubLink)
    }

    async removeLinkFromHub(hubId, linkId) {
        return await this.dao.removeLinkFromHub(hubId, linkId)
    }

    async updateLinkOrder(hubId, linkId, orderIndex) {
        return await this.dao.updateLinkOrder(hubId, linkId, orderIndex)
    }
}
