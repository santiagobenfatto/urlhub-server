import { expect } from 'chai'
import supertest from 'supertest'
import sinon from 'sinon'

import app from '../app.js'
import { usersService, hubsService } from '../container.js'
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
            sinon.stub(usersService, 'register').resolves({ id: 'new-user-id' })
            sinon.stub(hubsService, 'createHub').resolves({ id: 'hub-new', title: 'My Hub' })

            const res = await request
                .post('/api/v1/users/register')
                .send({ first_name: 'Test', email_register: 'test@example.com', password: 'secret123', nickname: 'testuser' })

            expect(res.status).to.equal(200)
            expect(res.body.message).to.equal('User with email: test@example.com registered')
            expect(hubsService.createHub.calledOnce).to.be.true
            expect(hubsService.createHub.firstCall.args[0].userId).to.equal('new-user-id')
        })

        it('rejects registration with existing email', async () => {
            sinon.stub(usersService, 'register').rejects(new (await import('../errors/custom-errors.js')).UserAlreadyExists('The email already exists'))

            const res = await request
                .post('/api/v1/users/register')
                .send({ first_name: 'Test', email_register: 'existing@example.com', password: 'secret123', nickname: 'testuser' })

            expect(res.status).to.equal(400)
        })

        it('rejects registration with existing nickname', async () => {
            sinon.stub(usersService, 'register').rejects(new (await import('../errors/custom-errors.js')).UserAlreadyExists('The nickname already exists'))

            const res = await request
                .post('/api/v1/users/register')
                .send({ first_name: 'Test', email_register: 'test@example.com', password: 'secret123', nickname: 'takennick' })

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

    describe('PATCH /api/v1/users/update', () => {
        const userRow = {
            id: 'test-user-id',
            first_name: 'Test',
            last_name: 'User',
            nickname: 'testuser',
            img_url: '',
            email: 'test@example.com',
            hashed_pass: '$2b$10$existinghash',
            role: 'USER',
        }

        const stubUserRepository = (overrides = {}) => {
            sinon.stub(usersService.usersRepository, 'getById').resolves(userRow)
            sinon.stub(usersService.usersRepository, 'checkNicknameExcept').resolves(overrides.nicknameTaken ?? false)
            sinon.stub(usersService.usersRepository, 'checkEmailExcept').resolves(overrides.emailTaken ?? false)
            sinon.stub(usersService.usersRepository, 'updateById').resolves({})
        }

        const patchUpdate = (payload) => request
            .patch('/api/v1/users/update')
            .set('Cookie', 'auth_token=' + token)
            .send(payload)

        it('updates only the provided field on a single-field PATCH', async () => {
            stubUserRepository()

            const res = await patchUpdate({ email: 'new@example.com' })

            expect(res.status).to.equal(200)
            expect(usersService.usersRepository.updateById.calledOnce).to.be.true
            expect(usersService.usersRepository.updateById.firstCall.args[1]).to.deep.equal({ email: 'new@example.com' })
        })

        it('updates multiple provided fields', async () => {
            stubUserRepository()

            const res = await patchUpdate({ first_name: 'New', nickname: 'newnick' })

            expect(res.status).to.equal(200)
            expect(usersService.usersRepository.updateById.firstCall.args[1]).to.deep.equal({ first_name: 'New', nickname: 'newnick' })
        })

        it('ignores null fields', async () => {
            stubUserRepository()

            const res = await patchUpdate({ nickname: 'newnick', email: null, password: null })

            expect(res.status).to.equal(200)
            expect(usersService.usersRepository.updateById.firstCall.args[1]).to.deep.equal({ nickname: 'newnick' })
        })

        it('rejects an empty payload', async () => {
            stubUserRepository()

            const res = await patchUpdate({})

            expect(res.status).to.equal(400)
            expect(res.body.error).to.equal('No fields provided for update')
        })

        it('rejects a payload with only null fields', async () => {
            stubUserRepository()

            const res = await patchUpdate({ email: null })

            expect(res.status).to.equal(400)
        })

        it('rejects empty or whitespace-only field values', async () => {
            const cases = [
                { nickname: '  ' },
                { first_name: '' },
                { email: '' },
                { password: '   ' },
            ]

            for (const payload of cases) {
                sinon.restore()
                stubUserRepository()

                const res = await patchUpdate(payload)
                expect(res.status).to.equal(400)
            }
        })

        it('rejects an invalid email format', async () => {
            stubUserRepository()

            const res = await patchUpdate({ email: 'not-an-email' })

            expect(res.status).to.equal(400)
        })

        it('normalizes email to lowercase before storing', async () => {
            stubUserRepository()

            const res = await patchUpdate({ email: '  TEST@Example.COM  ' })

            expect(res.status).to.equal(200)
            expect(usersService.usersRepository.updateById.firstCall.args[1]).to.deep.equal({ email: 'test@example.com' })
        })

        it('rejects a nickname that exists case-insensitively', async () => {
            stubUserRepository({ nicknameTaken: true })

            const res = await patchUpdate({ nickname: 'Santi' })

            expect(res.status).to.equal(400)
            expect(res.body.error.message).to.equal('The nickname already exists')
        })

        it('keeps the existing password when omitted or null', async () => {
            stubUserRepository()

            const res = await patchUpdate({ email: 'new@example.com', password: null })

            expect(res.status).to.equal(200)
            expect(usersService.usersRepository.updateById.firstCall.args[1]).to.deep.equal({ email: 'new@example.com' })
        })

        it('hashes and stores a valid password', async () => {
            stubUserRepository()

            const res = await patchUpdate({ password: 'newpass123' })

            expect(res.status).to.equal(200)
            const updates = usersService.usersRepository.updateById.firstCall.args[1]
            expect(updates.hashed_pass).to.be.a('string')
            expect(updates.hashed_pass.startsWith('$2')).to.be.true
            expect(updates.hashed_pass).to.not.equal('newpass123')
        })

        it('requires authentication', async () => {
            const res = await request
                .patch('/api/v1/users/update')
                .send({ first_name: 'Test', nickname: 'newuser', email: 'test@example.com' })

            expect(res.status).to.equal(401)
        })
    })
})
