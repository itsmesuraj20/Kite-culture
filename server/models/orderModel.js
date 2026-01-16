const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const orderModel = {
    generateOrderId() {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `KC${timestamp}${random}`;
    },

    async create(orderData, items, client = db) {
        const orderId = this.generateOrderId();
        
        const orderResult = await client.query(
            `INSERT INTO orders (order_id, customer_name, customer_mobile, customer_address, total_amount, status)
             VALUES ($1, $2, $3, $4, $5, 'INITIATED')
             RETURNING *`,
            [orderId, orderData.customerName, orderData.customerMobile, orderData.customerAddress, orderData.totalAmount]
        );
        
        const order = orderResult.rows[0];

        for (const item of items) {
            await client.query(
                `INSERT INTO order_items (order_id, product_id, product_name, product_variant, quantity, unit_price, total_price)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [order.id, item.productId, item.productName, item.productVariant, item.quantity, item.unitPrice, item.totalPrice]
            );
        }

        return order;
    },

    async findByOrderId(orderId) {
        const result = await db.query(
            'SELECT * FROM orders WHERE order_id = $1',
            [orderId]
        );
        return result.rows[0];
    },

    async findById(id) {
        const result = await db.query(
            'SELECT * FROM orders WHERE id = $1',
            [id]
        );
        return result.rows[0];
    },

    async findByRazorpayOrderId(razorpayOrderId) {
        const result = await db.query(
            'SELECT * FROM orders WHERE razorpay_order_id = $1',
            [razorpayOrderId]
        );
        return result.rows[0];
    },

    async getOrderItems(orderId) {
        const result = await db.query(
            'SELECT * FROM order_items WHERE order_id = $1',
            [orderId]
        );
        return result.rows;
    },

    async updateRazorpayOrderId(orderId, razorpayOrderId) {
        const result = await db.query(
            'UPDATE orders SET razorpay_order_id = $1 WHERE order_id = $2 RETURNING *',
            [razorpayOrderId, orderId]
        );
        return result.rows[0];
    },

    async updatePaymentSuccess(razorpayOrderId, paymentId, signature) {
        const result = await db.query(
            `UPDATE orders 
             SET status = 'PAID', razorpay_payment_id = $1, razorpay_signature = $2
             WHERE razorpay_order_id = $3
             RETURNING *`,
            [paymentId, signature, razorpayOrderId]
        );
        return result.rows[0];
    },

    async updatePaymentFailed(razorpayOrderId) {
        const result = await db.query(
            `UPDATE orders SET status = 'FAILED' WHERE razorpay_order_id = $1 RETURNING *`,
            [razorpayOrderId]
        );
        return result.rows[0];
    },

    async updateStatus(orderId, status) {
        const result = await db.query(
            'UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *',
            [status, orderId]
        );
        return result.rows[0];
    },

    async updateDispatch(orderId, dispatchStatus, dispatchNotes) {
        const result = await db.query(
            `UPDATE orders SET dispatch_status = $1, dispatch_notes = $2, status = 'DISPATCHED'
             WHERE order_id = $3 RETURNING *`,
            [dispatchStatus, dispatchNotes, orderId]
        );
        return result.rows[0];
    },

    async findAll(status = null, limit = 50, offset = 0) {
        let query = 'SELECT * FROM orders';
        const params = [];
        
        if (status) {
            query += ' WHERE status = $1';
            params.push(status);
        }
        
        query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        params.push(limit, offset);
        
        const result = await db.query(query, params);
        return result.rows;
    },

    async getOrderWithItems(orderId) {
        const order = await this.findByOrderId(orderId);
        if (!order) return null;
        
        const items = await this.getOrderItems(order.id);
        return { ...order, items };
    },

    async getStats() {
        const result = await db.query(`
            SELECT 
                status,
                COUNT(*) as count,
                COALESCE(SUM(total_amount), 0) as total_amount
            FROM orders
            GROUP BY status
        `);
        return result.rows;
    }
};

module.exports = orderModel;
