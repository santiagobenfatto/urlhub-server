import { CannotDelete, DatabaseError, ElementNotFound } from '../../errors/custom-errors.js'
import logger from '../../utils/logger.js'

export class HubsMySQL {
    constructor(connection) {
        logger.info('HubsDAO initialized')
        this.connection = connection
    }

    async createHub(hub) {
        try {
            const result = await this.connection.execute({
                sql: `INSERT INTO hubs (id, user_id, title, alias) VALUES (?, ?, ?, ?) RETURNING *`,
                args: [hub.id, hub.user_id, hub.title, hub.alias]
            })
            return result.rows[0]
        } catch (error) {
            throw new DatabaseError(`Error al crear el hub '${hub.title}': ${error.message}`)
        }
    }

    async getUserHubs(userId) {
        try {
            const result = await this.connection.execute({
                sql: `SELECT * FROM hubs WHERE user_id = ?`,
                args: [userId]
            })
            return result.rows
        } catch (error) {
            throw new DatabaseError(`Error al obtener hubs del usuario con ID ${userId}: ${error.message}`)
        }
    }

    async getHubById(hubId) {
        try {
            const result = await this.connection.execute({
                sql: `SELECT * FROM hubs WHERE id = ?`,
                args: [hubId]
            })
            if (result.rows.length === 0) {
                throw new ElementNotFound(`No se encontró un hub con ID: ${hubId}`)
            }
            return result.rows[0]
        } catch (error) {
            if (error instanceof ElementNotFound) throw error
            throw new DatabaseError(`Error al obtener el hub con ID ${hubId}: ${error.message}`)
        }
    }

    async updateHub(hubId, updates) {
        try {
            const result = await this.connection.execute({
                sql: `UPDATE hubs SET title = ?, alias = ? WHERE id = ?`,
                args: [updates.title, updates.alias, hubId]
            })
            return result
        } catch (error) {
            throw new DatabaseError(`Error al actualizar el hub con ID ${hubId}: ${error.message}`)
        }
    }

    async deleteHub(hubId) {
        try {
            const result = await this.connection.execute({
                sql: `DELETE FROM hubs WHERE id = ?`,
                args: [hubId]
            })
            return result
        } catch (error) {
            throw new CannotDelete(`Error al eliminar el hub con ID ${hubId}: ${error.message}`)
        }
    }

    async checkHub(hubId) {
        try {
            const result = await this.connection.execute({
                sql: `SELECT COUNT(*) AS count FROM hubs WHERE id = ?`,
                args: [hubId]
            })
            return result.rows[0].count > 0
        } catch (error) {
            throw new DatabaseError(`Error al verificar existencia del hub con ID '${hubId}': ${error.message}`)
        }
    }

    async checkUserHub(userId) {
        try {
            const result = await this.connection.execute({
                sql: `SELECT COUNT(*) AS count FROM hubs WHERE user_id = ?`,
                args: [userId]
            })
            return result.rows[0].count > 0
        } catch (error) {
            throw new DatabaseError(`Error al verificar existencia de hub para el usuario con ID '${userId}': ${error.message}`)
        }
    }

    async addLinkToHub(hubLink) {
        try {
            const result = await this.connection.execute({
                sql: `INSERT INTO hub_links (id, hub_id, link_id, order_index) VALUES (?, ?, ?, ?) RETURNING *`,
                args: [hubLink.id, hubLink.hub_id, hubLink.link_id, hubLink.order_index]
            })
            return result.rows[0]
        } catch (error) {
            throw new DatabaseError(`Error al agregar el enlace al hub: ${error.message}`)
        }
    }

    async removeLinkFromHub(hubId, linkId) {
        try {
            const result = await this.connection.execute({
                sql: `DELETE FROM hub_links WHERE hub_id = ? AND link_id = ?`,
                args: [hubId, linkId]
            })
            return result
        } catch (error) {
            throw new CannotDelete(`Error al eliminar el enlace del hub: ${error.message}`)
        }
    }

    async getHubLinks(hubId) {
        try {
            const result = await this.connection.execute({
                sql: `SELECT * FROM hub_links WHERE hub_id = ? ORDER BY order_index ASC`,
                args: [hubId]
            })
            return result.rows
        } catch (error) {
            throw new DatabaseError(`Error al obtener enlaces del hub con ID ${hubId}: ${error.message}`)
        }
    }

    async getPublicHub(hubId) {
        try {
            const hubResult = await this.connection.execute({
                sql: `SELECT title AS name FROM hubs WHERE id = ?`,
                args: [hubId]
            })

            if (hubResult.rows.length === 0) {
                return null
            }

            const name = hubResult.rows[0].name

            const linksResult = await this.connection.execute({
                sql: `SELECT l.id, l.title, l.icon
                      FROM hub_links hl
                      JOIN links l ON hl.link_id = l.id
                      WHERE hl.hub_id = ?
                      ORDER BY hl.order_index ASC`,
                args: [hubId]
            })

            const links = linksResult.rows.map(({ id, title, icon }) => ({
                id, title, icon
            }))

            return { name, links }
        } catch (error) {
            throw new DatabaseError(`Error al obtener hub público con ID ${hubId}: ${error.message}`)
        }
    }

    async getPublicHubByAlias(alias) {
        try {
            const result = await this.connection.execute({
                sql: `SELECT id FROM hubs WHERE alias = ?`,
                args: [alias]
            })

            if (result.rows.length === 0) {
                return null
            }

            return this.getPublicHub(result.rows[0].id)
        } catch (error) {
            throw new DatabaseError(`Error al obtener hub público con alias '${alias}': ${error.message}`)
        }
    }

    async updateLinkOrder(hubId, linkId, orderIndex) {
        try {
            const result = await this.connection.execute({
                sql: `UPDATE hub_links SET order_index = ? WHERE hub_id = ? AND link_id = ?`,
                args: [orderIndex, hubId, linkId]
            })
            return result
        } catch (error) {
            throw new DatabaseError(`Error al actualizar el orden del enlace en el hub: ${error.message}`)
        }
    }
}
