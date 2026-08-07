import { expect } from 'chai'
import supertest from 'supertest'
import sinon from 'sinon'

import app from '../app.js'
import { hubsService } from '../container.js'
import { generateTestToken } from './helpers/auth.js'

const request = supertest(app)

describe('Hubs — Integration', () => {
    let token

    before(() => {
        token = generateTestToken()
    })

    afterEach(() => {
        sinon.restore()
    })

    describe('POST /api/v1/hubs', () => {
        it('creates a hub successfully', async () => {
            const mockHub = { id: 'hub-1', user_id: 'test-user-id', title: 'My Hub', alias: 'abc12', short_link: 'http://localhost:3001/abc12' }
            sinon.stub(hubsService, 'createHub').resolves(mockHub)

            const res = await request
                .post('/api/v1/hubs')
                .set('Cookie', 'auth_token=' + token)
                .send({ title: 'My Hub' })

            expect(res.status).to.equal(200)
            expect(res.body.data.message).to.equal('Hub created successfully')
            expect(res.body.data.data).to.deep.equal(mockHub)
        })

        it('rejects duplicate hub creation when user already has one', async () => {
            sinon.stub(hubsService, 'createHub').rejects(new (await import('../errors/custom-errors.js')).ElementAlreadyExists('El usuario ya tiene un hub.'))

            const res = await request
                .post('/api/v1/hubs')
                .set('Cookie', 'auth_token=' + token)
                .send({ title: 'Another Hub' })

            expect(res.status).to.equal(400)
        })
    })

    describe('PUT /api/v1/hubs', () => {
        it('reorders hub links by array position', async () => {
            const mockLinks = [
                { id: 'hl-2', hub_id: 'hub-1', link_id: 'link-2', order_index: 0 },
                { id: 'hl-1', hub_id: 'hub-1', link_id: 'link-1', order_index: 1 }
            ]
            sinon.stub(hubsService, 'reorderHubLinks').resolves(mockLinks)

            const res = await request
                .put('/api/v1/hubs')
                .set('Cookie', 'auth_token=' + token)
                .send({
                    links: [
                        { id: 'link-2', title: 'Other', bigLink: 'https://other.com', shortLink: 'https://urlhub.io/oth', icon: '' },
                        { id: 'link-1', title: 'Docs', bigLink: 'https://docs.com', shortLink: 'https://urlhub.io/docs', icon: 'GitHub' }
                    ]
                })

            expect(res.status).to.equal(200)
            expect(res.body.message).to.equal('Links order updated successfully')
            expect(res.body.data).to.deep.equal(mockLinks)
            expect(hubsService.reorderHubLinks.calledOnce).to.be.true
            expect(hubsService.reorderHubLinks.firstCall.args[0]).to.equal('test-user-id')
        })

        it('rejects reorder with missing links', async () => {
            const res = await request
                .put('/api/v1/hubs')
                .set('Cookie', 'auth_token=' + token)
                .send({})

            expect(res.status).to.equal(400)
        })

        it('requires authentication', async () => {
            const res = await request
                .put('/api/v1/hubs')
                .send({ links: [{ id: 'link-1' }] })

            expect(res.status).to.equal(401)
        })
    })

    describe('GET /api/v1/hubs', () => {
        it('returns user hubs with alias and short_link', async () => {
            const mockHubs = [
                { id: 'hub-1', user_id: 'test-user-id', title: 'Hub One', alias: 'abc12', short_link: 'http://localhost:5173/abc12' },
                { id: 'hub-2', user_id: 'test-user-id', title: 'Hub Two', alias: 'xyz89', short_link: 'http://localhost:5173/xyz89' }
            ]
            sinon.stub(hubsService, 'getUserHubs').resolves(mockHubs)

            const res = await request
                .get('/api/v1/hubs')
                .set('Cookie', 'auth_token=' + token)

            expect(res.status).to.equal(200)
            expect(res.body.data).to.have.lengthOf(2)
            expect(res.body.data[0].alias).to.equal('abc12')
            expect(res.body.data[0].short_link).to.equal('http://localhost:5173/abc12')
            expect(res.body.message).to.equal('Hubs retrieved successfully')
        })
    })

    describe('GET /api/v1/hubs/:hubId', () => {
        it('returns a hub by ID', async () => {
            const mockHub = { id: 'hub-1', user_id: 'test-user-id', title: 'My Hub' }
            sinon.stub(hubsService, 'getHubById').resolves(mockHub)

            const res = await request
                .get('/api/v1/hubs/hub-1')
                .set('Cookie', 'auth_token=' + token)

            expect(res.status).to.equal(200)
            expect(res.body.data.data).to.deep.equal(mockHub)
        })

        it('returns 400 when hub is not found', async () => {
            sinon.stub(hubsService, 'getHubById').rejects(new (await import('../errors/custom-errors.js')).ElementNotFound('No se encontró un hub con ID: nonexistent'))

            const res = await request
                .get('/api/v1/hubs/nonexistent')
                .set('Cookie', 'auth_token=' + token)

            expect(res.status).to.equal(400)
        })
    })

    describe('PUT /api/v1/hubs/:hubId', () => {
        it('updates a hub successfully', async () => {
            sinon.stub(hubsService, 'updateHub').resolves({})

            const res = await request
                .put('/api/v1/hubs/hub-1')
                .set('Cookie', 'auth_token=' + token)
                .send({ title: 'Updated Title', alias: 'newalias' })

            expect(res.status).to.equal(200)
            expect(res.body.data.message).to.equal('Hub updated successfully')
        })
    })

    describe('DELETE /api/v1/hubs/:hubId', () => {
        it('deletes a hub successfully', async () => {
            sinon.stub(hubsService, 'deleteHub').resolves({})

            const res = await request
                .delete('/api/v1/hubs/hub-1')
                .set('Cookie', 'auth_token=' + token)

            expect(res.status).to.equal(200)
            expect(res.body.data.message).to.equal('Hub removed successfully')
        })

        it('returns 400 when hub to delete does not exist', async () => {
            sinon.stub(hubsService, 'deleteHub').rejects(new (await import('../errors/custom-errors.js')).ElementNotFound('No se encontró un hub con ID: nonexistent'))

            const res = await request
                .delete('/api/v1/hubs/nonexistent')
                .set('Cookie', 'auth_token=' + token)

            expect(res.status).to.equal(400)
        })
    })

    describe('POST /api/v1/hubs/:hubId/links', () => {
        it('adds a link to a hub', async () => {
            const mockHubLink = { id: 'hl-1', hub_id: 'hub-1', link_id: 'link-1', order_index: 0 }
            sinon.stub(hubsService, 'addLinkToHub').resolves(mockHubLink)

            const res = await request
                .post('/api/v1/hubs/hub-1/links')
                .set('Cookie', 'auth_token=' + token)
                .send({ link_id: 'link-1' })

            expect(res.status).to.equal(200)
            expect(res.body.data.data).to.deep.equal(mockHubLink)
        })
    })

    describe('GET /api/v1/hubs/:hubId/links', () => {
        it('returns links in a hub', async () => {
            const mockLinks = [
                { id: 'hl-1', hub_id: 'hub-1', link_id: 'link-1', order_index: 0 },
                { id: 'hl-2', hub_id: 'hub-1', link_id: 'link-2', order_index: 1 }
            ]
            sinon.stub(hubsService, 'getHubLinks').resolves(mockLinks)

            const res = await request
                .get('/api/v1/hubs/hub-1/links')
                .set('Cookie', 'auth_token=' + token)

            expect(res.status).to.equal(200)
            expect(res.body.data.data).to.have.lengthOf(2)
        })
    })

    describe('GET /api/v1/hubs/public/:hubId', () => {
        it('returns hub with links', async () => {
            const mockPublicHub = {
                name: 'My Hub',
                first_name: 'Test',
                nickname: 'testuser',
                links: [{ id: 'link-1', title: 'Google', icon: 'search', alias: 'abc12' }]
            }
            sinon.stub(hubsService, 'getPublicHub').resolves(mockPublicHub)

            const res = await request.get('/api/v1/hubs/public/hub-1')

            expect(res.status).to.equal(200)
            expect(res.body.data.name).to.equal('My Hub')
            expect(res.body.data.first_name).to.equal('Test')
            expect(res.body.data.nickname).to.equal('testuser')
            expect(res.body.data.links).to.have.lengthOf(1)
            expect(res.body.data.links[0].alias).to.equal('abc12')
        })

        it('returns hub with empty links array', async () => {
            const mockPublicHub = { name: 'Empty Hub', first_name: 'Test', nickname: 'testuser', links: [] }
            sinon.stub(hubsService, 'getPublicHub').resolves(mockPublicHub)

            const res = await request.get('/api/v1/hubs/public/hub-2')

            expect(res.status).to.equal(200)
            expect(res.body.data.name).to.equal('Empty Hub')
            expect(res.body.data.first_name).to.equal('Test')
            expect(res.body.data.nickname).to.equal('testuser')
            expect(res.body.data.links).to.deep.equal([])
        })

        it('returns 404 when hub does not exist', async () => {
            sinon.stub(hubsService, 'getPublicHub').rejects(new (await import('../errors/custom-errors.js')).ElementNotFound('not found'))

            const res = await request.get('/api/v1/hubs/public/nonexistent')

            expect(res.status).to.equal(404)
        })
    })
})
