export class UsersRepository {
    constructor(dao) {
        this.dao = dao
    }

    async getByEmailRegister(userEmail) {
        return await this.dao.getByEmailRegister(userEmail)
    }

    async checkUser(userEmail) {
        return await this.dao.checkUser(userEmail)
    }

    async create(user) {
        return await this.dao.create(user)
    }

    //For now this method isn't avaible at service layer
    async updateById(userId, updates) {
        return await this.dao.updateById(userId, updates)
    }

    async deleteByEmailRegister(email_register) {
        return await this.dao.deleteByEmailRegister(email_register)
    }

}
