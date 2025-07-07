import { DatabaseError, UserAlreadyExists, UserNotFound } from '../../errors/custom-errors.js'


export class UsersMySQL {
    constructor(connection) {
        console.log('Working UsersDB with MySQL')
        this.connection = connection
    }

    getByEmailRegister = async (email) => {
        try {
            const result = await this.connection.execute({
                sql: `SELECT first_name, last_name, nickname, email, hashed_pass FROM users WHERE email = ?`,
                args: [email]
            })

            if (!result || result.length === 0) {
                throw new UserNotFound(`No se encontró un usuario con el email: ${email}`)
            }
            
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

        return result.rows[0].count > 0 // Retorna true si el usuario existe
        } catch (error) {
            throw new DatabaseError(`Error al verificar existencia de usuario con email (${email}): ${error.message}`)
        }
    }


    create = async (user) => {
        console.log(user)
        try {
            const result = await this.connection.execute({
                sql: `INSERT INTO users (id, first_name, last_name, nickname, img_url, email, hashed_pass) VALUES (?,?,?,?,?,?,?)`,
                args: [user.first_name, user.last_name, user.nickname, user.email_register, user.password]
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
            const result = await this.connection.execute({
                sql: `UPDATE users SET first_name = ?, last_name = ?, nickname = ?, email = ? WHERE user_id = ?`,
                args: [updates.first_name, updates.last_name, updates.nickname, updates.email, userId]
            })

            if (result.affectedRows === 0) {
                throw new UserNotFound(`No se encontró un usuario con ID: ${userId}`)
            }

            return result.rows[0]
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