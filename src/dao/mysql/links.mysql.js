import { CannotDelete, DatabaseError } from '../../errors/custom-errors.js'

export class LinksMySQL {
    constructor(connection) {
        console.log('Working LinksDB with MySQL')
        this.connection = connection
    }

    getUserLinks = async (userId) => {
        try {
            const result = await this.connection.execute({
                sql: `SELECT * FROM links WHERE user_id = ?`,
                args: [userId]
            })
            return result.rows
        } catch (error) {
            throw new DatabaseError(`Error al obtener enlaces del usuario con ID ${userId}: ${error.message}`)
        }
    }

    async checkAlias(alias) {
        try {
            const result = await this.connection.execute({
                sql: `SELECT COUNT(*) AS count FROM links WHERE alias = ?`,
                args: [alias]
            })
            console.log('result del  checkALias', result)
            return result[0].count > 0
        } catch (error) {
            throw new DatabaseError(`Error al verificar existencia del alias '${alias}': ${error.message}`)
        }
    }

    async checkLink(linkId) {
        try {
            const result = await this.connection.execute({
                sql: `SELECT COUNT(*) AS count FROM links WHERE id = ?`,
                args: [linkId]
            })

            return result[0].count > 0
        } catch (error) {
            throw new DatabaseError(`Error al verificar existencia del link ID '${linkId}': ${error.message}`)
        }
    }

    addPublicLink = async (link) => {
        try {
            const result = await this.connection.execute({
                sql: `INSERT INTO links(id, big_link, short_link, title,  alias) VALUES (?, ?, ?, ?, ?)`,
                args: [link.id, link.big_link, link.short_link, link.title, link.alias]
            })
            return result
        } catch (error) {
            throw new DatabaseError(`Error al agregar el enlace '${link.title}': ${error.message}`)
        }
    }

    addLink = async (link) => {
        try {
            const result = await this.connection.execute({
                sql: `INSERT INTO links(user_id, big_link, short_link, title, icon, alias) VALUES (?, ?, ?, ?, ?, ?)`,
                args: [link.id, link.user_id, link.big_link, link.short_link, link.title, link.icon, link.alias]
            })
            return result
        } catch (error) {
            throw new DatabaseError(`Error al agregar el enlace '${link.title}': ${error.message}`)
        }
    }

    updateLink = async (linkId, updates) => {
        try {
            const result = await this.connection.execute({
                sql: `UPDATE links SET title = ?, icon = ?, alias = ? WHERE id = ?`,
                args: [updates.title, updates.icon, updates.alias, linkId]
            })
            return result
        } catch (error) {
            throw new DatabaseError(`Error al actualizar el enlace con ID ${linkId}: ${error.message}`)
        }
    }

    removeLink = async (linkId) => {
        try {
            const result = await this.connection.execute({
                sql: `DELETE FROM links WHERE id = ?`,
                args: [linkId]
            })
            return result
        } catch (error) {
            throw new CannotDelete(`Error al eliminar el enlace con ID ${linkId}: ${error.message}`)
        }
    }
}