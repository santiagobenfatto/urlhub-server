import { DatabaseError, UserAlreadyExists, UserNotFound } from '../../errors/custom-errors.js'
import logger from '../../utils/logger.js'


export class UsersMySQL {
    constructor(connection) {
        logger.info('UsersDAO initialized')
        this.connection = connection
    }

    getByEmailRegister = async (email) => {
        try {
            const result = await this.connection.execute({
                sql: `SELECT id, first_name, last_name, nickname, email, hashed_pass, role FROM users WHERE email = ?`,
                args: [email]
            })

            return result.rows
        } catch (error) {
            throw new DatabaseError(`Error al obtener usuario por email (${email}): ${error.message}`)
        }
    }

    async checkUser(email) {
    try {
        const result = await this.connection.execute({
            sql: `SELECT COUNT(*) AS count FROM users WHERE email = ?`,
            args: [email]
        })

        return result.rows[0].count > 0
        } catch (error) {
            throw new DatabaseError(`Error al verificar existencia de usuario con email (${email}): ${error.message}`)
        }
    }

    async checkNickname(nickname) {
    try {
        const result = await this.connection.execute({
            sql: `SELECT COUNT(*) AS count FROM users WHERE LOWER(nickname) = LOWER(?)`,
            args: [nickname]
        })

        return result.rows[0].count > 0
        } catch (error) {
            throw new DatabaseError(`Error al verificar existencia de usuario con nickname (${nickname}): ${error.message}`)
        }
    }

    async getById(userId) {
        try {
            const result = await this.connection.execute({
                sql: `SELECT id, first_name, last_name, nickname, img_url, email, hashed_pass, role FROM users WHERE id = ?`,
                args: [userId]
            })

            return result.rows[0] || null
        } catch (error) {
            throw new DatabaseError(`Error al obtener usuario con ID (${userId}): ${error.message}`)
        }
    }

    async checkEmailExcept(userId, email) {
    try {
        const result = await this.connection.execute({
            sql: `SELECT COUNT(*) AS count FROM users WHERE email = ? AND id != ?`,
            args: [email, userId]
        })

        return result.rows[0].count > 0
        } catch (error) {
            throw new DatabaseError(`Error al verificar existencia de email (${email}) para otro usuario: ${error.message}`)
        }
    }

    async checkNicknameExcept(userId, nickname) {
    try {
        const result = await this.connection.execute({
            sql: `SELECT COUNT(*) AS count FROM users WHERE LOWER(nickname) = LOWER(?) AND id != ?`,
            args: [nickname, userId]
        })

        return result.rows[0].count > 0
        } catch (error) {
            throw new DatabaseError(`Error al verificar existencia de nickname (${nickname}) para otro usuario: ${error.message}`)
        }
    }


    create = async (user) => {
        try {
            const result = await this.connection.execute({
                sql: `INSERT INTO users (id, first_name, last_name, nickname, img_url, email, hashed_pass, role) VALUES (?,?,?,?,?,?,?, ?)`,
                args: [user.id, user.first_name, user.last_name, user.nickname, user.img_url, user.email_register, user.password, user.role]
            })
            return result.rows[0]
        } catch (error) {
            if (error.message.includes("Duplicate entry")) {
                throw new UserAlreadyExists(`El usuario con email ${user.email_register} ya existe.`)
            }
            throw new DatabaseError(`Error al crear usuario (${user.email_register}): ${error.message}`)
        }
    }

    updateById = async (userId, updates) => {
        try {
            const allowedFields = ['first_name', 'nickname', 'email', 'hashed_pass']
            const fields = []
            const args = []

            for (const [key, value] of Object.entries(updates)) {
                if (allowedFields.includes(key) && value !== undefined) {
                    fields.push(`${key} = ?`)
                    args.push(value)
                }
            }

            if (fields.length === 0) {
                throw new DatabaseError('No valid fields provided for update')
            }

            args.push(userId)
            const result = await this.connection.execute({
                sql: `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
                args
            })

            return result
        } catch (error) {
            throw new DatabaseError(`Error al actualizar usuario con ID (${userId}): ${error.message}`)
        }
    }

    deleteByEmailRegister = async (email) => {
        try {
            const result = await this.connection.execute({
                sql: `DELETE FROM users WHERE email = ?`,
                args: [email]
            })

            if (result.affectedRows === 0) {
                throw new UserNotFound(`No se encontró un usuario con email: ${email}`)
            }

            return result.rows[0]
        } catch (error) {
            throw new DatabaseError(`Error al eliminar usuario con email ${email}: ${error.message}`)
        }
    }
}