import { Router } from "./main.router.js"

export class LinksRoutes extends Router { 
    constructor(linksController){
        super()
        this.linksController = linksController
        this.init()
    }
    init() {
        this.get('/', 'JWT', ['USER'], this.linksController.getUserLinks)
        this.post('/short', 'NONE', ['PUBLIC'], this.linksController.addPublicLink)
        this.post('/', 'JWT', ['USER'], this.linksController.addLink)
        this.put('/:linkId', 'JWT', ['USER'], this.linksController.updateLink)
        this.delete('/:linkId', 'JWT', ['USER'], this.linksController.removeLink)
    }
}

