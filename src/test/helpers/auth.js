import jwt from 'jsonwebtoken'
import config from '../../config/config.js'

export const generateTestToken = (userOverrides = {}) => {
    const user = {
        id: 'test-user-id',
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        role: 'USER',
        ...userOverrides
    }
    return jwt.sign({ user }, config.privateKey, { expiresIn: '1h' })
}
