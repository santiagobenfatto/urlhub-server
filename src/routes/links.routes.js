import { Router } from "./main.router.js"

export class LinksRoutes extends Router { 
    constructor(linksController){
        super()
        this.linksController = linksController
        this.init()
    }
    init() {
        // api/v1/links/...
        this.get('/', 'JWT', ['USER'], this.linksController.getUserLinks)
        // ========= DEPRECATED =========
        // this.post('/short', 'NOTHING', ['PUBLIC'], this.linksController.addPublicLink)
        this.post('/', 'JWT', ['USER'], this.linksController.addLink)
        // ========= DEPRECATED =========
        // this.patch('/migrate', 'JWT', ['USER'], this.linksController.migratePublicLink)
        this.put('/:linkId', 'JWT', ['USER'], this.linksController.updateLink)
        this.delete('/:linkId', 'JWT', ['USER'], this.linksController.removeLink)
    }
}

