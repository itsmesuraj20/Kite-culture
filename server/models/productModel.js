const db = require('../config/database');

const productModel = {
    async findAll(category = null) {
        let query = 'SELECT * FROM products WHERE is_active = true';
        const params = [];
        
        if (category) {
            query += ' AND category = $1';
            params.push(category);
        }
        
        query += ' ORDER BY category, name';
        const result = await db.query(query, params);
        return result.rows;
    },

    async findById(id) {
        const result = await db.query(
            'SELECT * FROM products WHERE id = $1 AND is_active = true',
            [id]
        );
        return result.rows[0];
    },

    async findByIds(ids) {
        const result = await db.query(
            'SELECT * FROM products WHERE id = ANY($1) AND is_active = true',
            [ids]
        );
        return result.rows;
    },

    async updateStock(id, quantity, client = db) {
        const result = await client.query(
            'UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING *',
            [quantity, id]
        );
        return result.rows[0];
    },

    async restoreStock(id, quantity, client = db) {
        const result = await client.query(
            'UPDATE products SET stock = stock + $1 WHERE id = $2 RETURNING *',
            [quantity, id]
        );
        return result.rows[0];
    }
};

module.exports = productModel;
