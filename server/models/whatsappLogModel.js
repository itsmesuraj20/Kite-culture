const db = require('../config/database');

const whatsappLogModel = {
    async create(logData) {
        const result = await db.query(
            `INSERT INTO whatsapp_logs (order_id, phone_number, message_type, template_name, status, whatsapp_message_id, error_message)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                logData.orderId,
                logData.phoneNumber,
                logData.messageType,
                logData.templateName,
                logData.status,
                logData.whatsappMessageId,
                logData.errorMessage
            ]
        );
        return result.rows[0];
    },

    async findByOrderId(orderId) {
        const result = await db.query(
            'SELECT * FROM whatsapp_logs WHERE order_id = $1 ORDER BY created_at DESC',
            [orderId]
        );
        return result.rows;
    }
};

module.exports = whatsappLogModel;
