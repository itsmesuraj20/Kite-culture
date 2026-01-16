const db = require('../config/database');
const bcrypt = require('bcryptjs');

const adminModel = {
    async findByUsername(username) {
        const result = await db.query(
            'SELECT * FROM admin_users WHERE username = $1',
            [username]
        );
        return result.rows[0];
    },

    async create(username, password) {
        const passwordHash = await bcrypt.hash(password, 12);
        const result = await db.query(
            'INSERT INTO admin_users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
            [username, passwordHash]
        );
        return result.rows[0];
    },

    async verifyPassword(password, passwordHash) {
        return bcrypt.compare(password, passwordHash);
    },

    async ensureAdminExists() {
        const admin = await this.findByUsername(process.env.ADMIN_USERNAME);
        if (!admin) {
            await this.create(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD);
            console.log('Default admin user created');
        }
    }
};

module.exports = adminModel;
