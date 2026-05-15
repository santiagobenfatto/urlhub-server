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

    describe('GET /api/v1/hubs', () => {
        it('returns user hubs', async () => {
            const mockHubs = [
                { id: 'hub-1', user_id: 'test-user-id', title: 'Hub One' },
                { id: 'hub-2', user_id: 'test-user-id', title: 'Hub Two' }
            ]
            sinon.stub(hubsService, 'getUserHubs').resolves(mockHubs)

            const res = await request
                .get('/api/v1/hubs')
                .set('Cookie', 'auth_token=' + token)

            expect(res.status).to.equal(200)
            expect(res.body.data.data).to.have.lengthOf(2)
            expect(res.body.data.message).to.equal('Hubs retrieved successfully')
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
})
