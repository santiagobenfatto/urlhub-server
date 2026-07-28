import { CannotDelete, DatabaseError } from '../../errors/custom-errors.js'
import logger from '../../utils/logger.js'

export class LinksMySQL {
    constructor(connection) {
        logger.info('LinksDAO initialized')
        this.connection = connection
    }

    async getUserLinks (userId) {
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
            const count = result.rows[0].count
            //Return boolean
            return count > 0
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
            const count = result.rows[0].count
            //Return boolean
            return count > 0
        } catch (error) {
            throw new DatabaseError(`Error al verificar existencia del link ID '${linkId}': ${error.message}`)
        }
    }

    addPublicLink = async (link) => {
        try {
            const result = await this.connection.execute({
                sql: `INSERT INTO public_links (id, big_link, short_link, alias) VALUES (?, ?, ?, ?) RETURNING *`,
                args: [link.id, link.big_link, link.short_link, link.alias]
            })
            return result.rows[0]
        } catch (error) {
            console.error("Error en addPublicLink:", error)
            throw new DatabaseError(`Error al agregar el enlace '${link.big_link}': ${error.message}`)
        }
    }

    addLink = async (link) => {
        try {
            const result = await this.connection.execute({
                sql: `INSERT INTO links(id, user_id, big_link, short_link, title, icon, alias) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`,
                args: [link.id, link.user_id, link.big_link, link.short_link, link.title, link.icon, link.alias]
            })
            return result.rows[0]
        } catch (error) {
            throw new DatabaseError(`Error al agregar el enlace '${link.title}': ${error.message}`)
        }
    }

    updateLink = async (linkId, updates) => {
        try {
            const allowedFields = ['title', 'icon', 'alias', 'short_link']
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

            args.push(linkId)
            const result = await this.connection.execute({
                sql: `UPDATE links SET ${fields.join(', ')} WHERE id = ?`,
                args
            })
            return result
        } catch (error) {
            throw new DatabaseError(`Error al actualizar el enlace con ID ${linkId}: ${error.message}`)
        }
    }

    getPublicLink = async (linkId) => {
        try {
            const result = await this.connection.execute({
                sql: `SELECT * FROM public_links WHERE id = ?`,
                args: [linkId]
            })
            return result.rows[0] || null
        } catch (error) {
            throw new DatabaseError(`Error al obtener el enlace público con ID ${linkId}: ${error.message}`)
        }
    }

    migratePublicLink = async (userId, publicLink) => {
        try {
            await this.connection.execute({
                sql: `INSERT INTO links(id, user_id, big_link, short_link, alias) VALUES (?, ?, ?, ?, ?)`,
                args: [publicLink.id, userId, publicLink.big_link, publicLink.short_link, publicLink.alias]
            })
            await this.connection.execute({
                sql: `DELETE FROM public_links WHERE id = ?`,
                args: [publicLink.id]
            })
            return { id: publicLink.id, user_id: userId, big_link: publicLink.big_link, short_link: publicLink.short_link, alias: publicLink.alias }
        } catch (error) {
            throw new DatabaseError(`Error al migrar el enlace público con ID ${publicLink.id}: ${error.message}`)
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

    getLinkByAlias = async (alias) => {
        try {
            let result = await this.connection.execute({
                sql: `SELECT big_link, alias FROM links WHERE alias = ?`,
                args: [alias]
            })

            if (result.rows.length > 0) {
                return result.rows[0]
            }

            result = await this.connection.execute({
                sql: `SELECT big_link, alias FROM public_links WHERE alias = ?`,
                args: [alias]
            })

            if (result.rows.length > 0) {
                return result.rows[0]
            }

            return null
        } catch (error) {
            throw new DatabaseError(`Error al buscar enlace por alias '${alias}': ${error.message}`)
        }
    }
}