import { Router } from "./main.router.js"

export class HubsRoutes extends Router {
    constructor(hubsController){
        super()
        this.hubsController = hubsController
        this.init()
    }
    init() {
        // api/v1/hubs/...
        this.get('/public/alias/:alias', 'NOTHING', ['PUBLIC'], this.hubsController.getPublicHubByAlias)
        this.get('/public/:hubId', 'NOTHING', ['PUBLIC'], this.hubsController.getPublicHub)
        this.get('/', 'JWT', ['USER'], this.hubsController.getUserHubs)
        this.get('/:hubId', 'JWT', ['USER'], this.hubsController.getHubById)
        this.post('/', 'JWT', ['USER'], this.hubsController.createHub)
        this.put('/:hubId', 'JWT', ['USER'], this.hubsController.updateHub)
        this.delete('/:hubId', 'JWT', ['USER'], this.hubsController.deleteHub)

        // api/v1/hubs/:hubId/links/...
        this.post('/:hubId/links', 'JWT', ['USER'], this.hubsController.addLinkToHub)
        this.delete('/:hubId/links/:linkId', 'JWT', ['USER'], this.hubsController.removeLinkFromHub)
        this.get('/:hubId/links', 'JWT', ['USER'], this.hubsController.getHubLinks)
        this.put('/:hubId/links/:linkId/order', 'JWT', ['USER'], this.hubsController.updateLinkOrder)
    }
}
