import { Router } from "./main.router.js"

export class LinksRoutes extends Router { 
    constructor(linksController){
        super()
        this.linksController = linksController
        this.init()
    }
    init() {
        this.get('/:userId', ['USER'], 'JWT', this.linksController.getUserLinks)
        this.post('/short', ['PUBLIC'], 'NONE', this.linksController.addPublicLink)
        this.post('/', ['USER'], 'JWT', this.linksController.addLink)
        this.put('/:linkId', ['USER'], 'JWT', this.linksController.updateLink)
        this.delete('/:linkId', ['USER'], 'JWT', this.linksController.removeLink)
    }
}

