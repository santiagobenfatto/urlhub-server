export default class linksMySQL {
    constructor(connection) {
        this.connection = connection;
    }

    getUserLinks = async (userId) => {
        try {
            const result = await this.connection.execute({
                sql: `SELECT * FROM links WHERE user_id = ?`,
                args: [userId]
            });
            return result;
        } catch (error) {
            throw new DatabaseError(`Error al obtener enlaces del usuario con ID ${userId}: ${error.message}`);
        }
    };

    addLink = async (link) => {
        try {
            const result = await this.connection.execute({
                sql: `INSERT INTO links(big_link, short_link, title, icon, alias) VALUES (?, ?, ?, ?, ?)`,
                args: [link.big_link, link.short_link, link.title, link.icon, link.alias]
            });
            return result;
        } catch (error) {
            throw new DatabaseError(`Error al agregar el enlace '${link.title}': ${error.message}`);
        }
    };

    updateLink = async (linkId, updates) => {
        try {
            const result = await this.connection.execute({
                sql: `UPDATE links SET title = ?, icon = ?, alias = ? WHERE id = ?`,
                args: [updates.title, updates.icon, updates.alias, linkId]
            });
            return result;
        } catch (error) {
            throw new DatabaseError(`Error al actualizar el enlace con ID ${linkId}: ${error.message}`);
        }
    };

    removeLink = async (linkId) => {
        try {
            const result = await this.connection.execute({
                sql: `DELETE FROM links WHERE id = ?`,
                args: [linkId]
            });
            return result;
        } catch (error) {
            throw new CannotDelete(`Error al eliminar el enlace con ID ${linkId}: ${error.message}`);
        }
    };
}