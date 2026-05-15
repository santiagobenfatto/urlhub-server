import { expect } from 'chai'
import supertest from 'supertest'
import sinon from 'sinon'

import app from '../app.js'
import { usersService } from '../container.js'
import { generateTestToken } from './helpers/auth.js'

const request = supertest(app)

describe('Users — Integration', () => {
    let token

    before(() => {
        token = generateTestToken()
    })

    afterEach(() => {
        sinon.restore()
    })

    describe('POST /api/v1/users/register', () => {
        it('registers a new user successfully', async () => {
            sinon.stub(usersService, 'register').resolves()

            const res = await request
                .post('/api/v1/users/register')
                .send({ first_name: 'Test', email_register: 'test@example.com', password: 'secret123' })

            expect(res.status).to.equal(200)
            expect(res.body.data.message).to.equal('User with email: test@example.com registered')
        })

        it('rejects registration with existing email', async () => {
            sinon.stub(usersService, 'register').rejects(new (await import('../errors/custom-errors.js')).UserAlreadyExists('The email already exists'))

            const res = await request
                .post('/api/v1/users/register')
                .send({ first_name: 'Test', email_register: 'existing@example.com', password: 'secret123' })

            expect(res.status).to.equal(400)
        })

        it('rejects registration with missing fields', async () => {
            const res = await request
                .post('/api/v1/users/register')
                .send({ first_name: 'Test' })

            expect(res.status).to.equal(400)
        })
    })

    describe('POST /api/v1/users/login', () => {
        it('logs in successfully and returns auth cookie', async () => {
            const mockResponse = {
                accessToken: 'mock-jwt-token',
                userAdapted: { id: 'user-1', first_name: 'Test', email: 'test@example.com' }
            }
            sinon.stub(usersService, 'login').resolves(mockResponse)

            const res = await request
                .post('/api/v1/users/login')
                .send({ email_register: 'test@example.com', password: 'secret123' })

            expect(res.status).to.equal(200)
            expect(res.body.data.message).to.equal('Authorized')
            expect(res.body.data.user).to.deep.equal(mockResponse.userAdapted)
        })

        it('rejects login with wrong password', async () => {
            sinon.stub(usersService, 'login').rejects(new (await import('../errors/custom-errors.js')).IncorrectLoginCredentials('Incorrect credentials'))

            const res = await request
                .post('/api/v1/users/login')
                .send({ email_register: 'test@example.com', password: 'wrongpass' })

            expect(res.status).to.equal(400)
        })

        it('rejects login with non-existent email', async () => {
            sinon.stub(usersService, 'login').rejects(new (await import('../errors/custom-errors.js')).UserNotFound('User not found'))

            const res = await request
                .post('/api/v1/users/login')
                .send({ email_register: 'ghost@example.com', password: 'secret123' })

            expect(res.status).to.equal(400)
        })

        it('rejects login with missing fields', async () => {
            const res = await request
                .post('/api/v1/users/login')
                .send({ email_register: 'test@example.com' })

            expect(res.status).to.equal(400)
        })
    })

    describe('POST /api/v1/users/logout', () => {
        it('logs out successfully', async () => {
            const res = await request
                .post('/api/v1/users/logout')
                .set('Cookie', 'auth_token=' + token)

            expect(res.status).to.equal(200)
            expect(res.body.data.message).to.equal('Logout successful')
        })

        it('requires authentication', async () => {
            const res = await request.post('/api/v1/users/logout')

            expect(res.status).to.equal(401)
        })
    })
})
