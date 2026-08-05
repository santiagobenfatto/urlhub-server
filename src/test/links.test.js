import { expect } from 'chai'
import supertest from 'supertest'
import sinon from 'sinon'

import app from '../app.js'
import { linksService, aliasResolverService } from '../container.js'
import { ElementNotFound } from '../errors/custom-errors.js'
import { generateTestToken } from './helpers/auth.js'

const request = supertest(app)

describe('Links — Integration', () => {
    let token

    before(() => {
        token = generateTestToken()
    })

    afterEach(() => {
        sinon.restore()
    })

    describe('POST /api/v1/links', () => {
        it('creates a link successfully', async () => {
            const mockLink = { id: 'link-1', user_id: 'test-user-id', title: 'My Link', big_link: 'https://example.com', short_link: 'http://localhost:3001/abc12', alias: 'abc12' }
            sinon.stub(linksService, 'addLink').resolves(mockLink)

            const res = await request
                .post('/api/v1/links')
                .set('Cookie', 'auth_token=' + token)
                .send({ title: 'My Link', big_link: 'https://example.com', icon: 'icon.png' })

            expect(res.status).to.equal(200)
            expect(res.body.data.message).to.equal('Link created successfully')
            expect(res.body.data.data).to.deep.equal(mockLink)
        })

        it('rejects creation with missing required fields', async () => {
            const res = await request
                .post('/api/v1/links')
                .set('Cookie', 'auth_token=' + token)
                .send({ title: 'Incomplete' })

            expect(res.status).to.equal(400)
        })

        it('requires authentication', async () => {
            const res = await request
                .post('/api/v1/links')
                .send({ title: 'Test', big_link: 'https://example.com', icon: 'icon.png' })

            expect(res.status).to.equal(401)
        })
    })

    describe('POST /api/v1/links/short', () => {
        it('creates a public short link successfully', async () => {
            const mockLink = { id: 'public-1', big_link: 'https://example.com', short_link: 'http://localhost:5173/abc12', alias: 'abc12' }
            sinon.stub(linksService, 'addPublicLink').resolves(mockLink)

            const res = await request
                .post('/api/v1/links/short')
                .send({ big_link: 'https://example.com' })

            expect(res.status).to.equal(200)
            expect(res.body.data.data).to.deep.equal(mockLink)
        })

        it('rejects public link without big_link', async () => {
            const res = await request
                .post('/api/v1/links/short')
                .send({})

            expect(res.status).to.equal(400)
        })
    })

    describe('GET /api/v1/links', () => {
        it('returns user links', async () => {
            const mockLinks = [
                { id: 'link-1', user_id: 'test-user-id', title: 'Link One', big_link: 'https://example.com' },
                { id: 'link-2', user_id: 'test-user-id', title: 'Link Two', big_link: 'https://other.com' }
            ]
            sinon.stub(linksService, 'getUserLinks').resolves(mockLinks)

            const res = await request
                .get('/api/v1/links')
                .set('Cookie', 'auth_token=' + token)

            expect(res.status).to.equal(200)
            expect(res.body.data.data).to.have.lengthOf(2)
            expect(res.body.data.message).to.equal('Links retrieved successfully')
        })

        it('requires authentication', async () => {
            const res = await request.get('/api/v1/links')

            expect(res.status).to.equal(401)
        })
    })

    describe('PUT /api/v1/links/:linkId', () => {
        it('updates a link successfully', async () => {
            sinon.stub(linksService, 'updateLink').resolves({})

            const res = await request
                .put('/api/v1/links/link-1')
                .set('Cookie', 'auth_token=' + token)
                .send({ updates: { title: 'Updated', icon: 'new-icon.png' } })

            expect(res.status).to.equal(200)
            expect(res.body.data.message).to.equal('Link updated successfully')
        })
    })

    describe('DELETE /api/v1/links/:linkId', () => {
        it('deletes a link successfully', async () => {
            sinon.stub(linksService, 'removeLink').resolves({})

            const res = await request
                .delete('/api/v1/links/link-1')
                .set('Cookie', 'auth_token=' + token)

            expect(res.status).to.equal(200)
            expect(res.body.data.message).to.equal('Link removed successfully')
        })

        it('returns 400 when link to delete does not exist', async () => {
            sinon.stub(linksService, 'removeLink').rejects(new (await import('../errors/custom-errors.js')).ElementNotFound('El link ID nonexistent no existe.'))

            const res = await request
                .delete('/api/v1/links/nonexistent')
                .set('Cookie', 'auth_token=' + token)

            expect(res.status).to.equal(400)
        })

        it('requires authentication', async () => {
            const res = await request.delete('/api/v1/links/link-1')

            expect(res.status).to.equal(401)
        })
    })

    describe('GET /:alias', () => {
        it('resolves a link alias', async () => {
            sinon.stub(aliasResolverService, 'resolveAlias').resolves({ type: 'link', big_link: 'https://example.com', alias: 'chatg' })

            const res = await request.get('/chatg')

            expect(res.status).to.equal(200)
            expect(res.body.type).to.equal('link')
            expect(res.body.big_link).to.equal('https://example.com')
        })

        it('resolves a hub alias', async () => {
            sinon.stub(aliasResolverService, 'resolveAlias').resolves({ type: 'hub', name: 'My Hub', links: [] })

            const res = await request.get('/myhub')

            expect(res.status).to.equal(200)
            expect(res.body.type).to.equal('hub')
            expect(res.body.name).to.equal('My Hub')
        })

        it('returns 404 when alias does not exist', async () => {
            sinon.stub(aliasResolverService, 'resolveAlias').rejects(new ElementNotFound('El alias no existe.'))

            const res = await request.get('/nope')

            expect(res.status).to.equal(404)
            expect(res.body.error).to.equal('Alias not found')
        })

        it('passes through aliases containing a dot', async () => {
            const res = await request.get('/file.js')

            expect(res.status).to.equal(404)
        })
    })
})
