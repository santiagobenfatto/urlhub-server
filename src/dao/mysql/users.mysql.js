export default class UsersMySQL {
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

            return result
        } catch (error) {
            throw new DatabaseError(`Error al obtener usuario por email (${email}): ${error.message}`)
        }
    }

    create = async (user) => {
        try {
            const result = await this.connection.execute({
                sql: `INSERT INTO users (first_name, last_name, nickname, email, hashed_pass) VALUES (?,?,?,?,?)`,
                args: [user.first_name, user.last_name, user.nickname, user.email, user.password]
            })

            return result
        } catch (error) {
            if (error.message.includes("Duplicate entry")) {
                throw new UserAlreadyExists(`El usuario con email ${user.email} ya existe.`)
            }
            throw new DatabaseError(`Error al crear usuario (${user.email}): ${error.message}`)
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

            return result
        } catch (error) {
            throw new DatabaseError(`Error al actualizar usuario con ID (${userId}): ${error.message}`)
        }
    }
}