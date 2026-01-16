const whatsappLogModel = require('../models/whatsappLogModel');

const whatsappService = {
    async sendMessage(phoneNumber, templateName, templateParams) {
        const url = `${process.env.WHATSAPP_API_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
        
        const body = {
            messaging_product: 'whatsapp',
            to: phoneNumber,
            type: 'template',
            template: {
                name: templateName,
                language: { code: 'en' },
                components: [
                    {
                        type: 'body',
                        parameters: templateParams.map(param => ({
                            type: 'text',
                            text: param
                        }))
                    }
                ]
            }
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error?.message || 'WhatsApp API error');
            }

            return {
                success: true,
                messageId: data.messages?.[0]?.id
            };
        } catch (error) {
            console.error('WhatsApp send error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    async sendOrderCreatedMessage(order, paymentLink) {
        const templateName = 'order_created';
        const params = [
            order.customer_name,
            order.order_id,
            order.total_amount.toString(),
            paymentLink
        ];

        const customerResult = await this.sendMessage(
            order.customer_mobile,
            templateName,
            params
        );

        await whatsappLogModel.create({
            orderId: order.id,
            phoneNumber: order.customer_mobile,
            messageType: 'ORDER_CREATED',
            templateName,
            status: customerResult.success ? 'SENT' : 'FAILED',
            whatsappMessageId: customerResult.messageId,
            errorMessage: customerResult.error
        });

        const adminParams = [
            'Admin',
            order.order_id,
            order.total_amount.toString(),
            `Customer: ${order.customer_name}, Mobile: ${order.customer_mobile}`
        ];

        const adminResult = await this.sendMessage(
            process.env.WHATSAPP_ADMIN_NUMBER,
            'order_notification_admin',
            adminParams
        );

        await whatsappLogModel.create({
            orderId: order.id,
            phoneNumber: process.env.WHATSAPP_ADMIN_NUMBER,
            messageType: 'ORDER_CREATED_ADMIN',
            templateName: 'order_notification_admin',
            status: adminResult.success ? 'SENT' : 'FAILED',
            whatsappMessageId: adminResult.messageId,
            errorMessage: adminResult.error
        });

        return { customer: customerResult, admin: adminResult };
    },

    async sendPaymentConfirmation(order) {
        const templateName = 'payment_confirmed';
        const params = [
            order.customer_name,
            order.order_id,
            order.total_amount.toString()
        ];

        const customerResult = await this.sendMessage(
            order.customer_mobile,
            templateName,
            params
        );

        await whatsappLogModel.create({
            orderId: order.id,
            phoneNumber: order.customer_mobile,
            messageType: 'PAYMENT_CONFIRMED',
            templateName,
            status: customerResult.success ? 'SENT' : 'FAILED',
            whatsappMessageId: customerResult.messageId,
            errorMessage: customerResult.error
        });

        const adminParams = [
            order.order_id,
            order.total_amount.toString(),
            order.razorpay_payment_id
        ];

        const adminResult = await this.sendMessage(
            process.env.WHATSAPP_ADMIN_NUMBER,
            'payment_received_admin',
            adminParams
        );

        await whatsappLogModel.create({
            orderId: order.id,
            phoneNumber: process.env.WHATSAPP_ADMIN_NUMBER,
            messageType: 'PAYMENT_CONFIRMED_ADMIN',
            templateName: 'payment_received_admin',
            status: adminResult.success ? 'SENT' : 'FAILED',
            whatsappMessageId: adminResult.messageId,
            errorMessage: adminResult.error
        });

        return { customer: customerResult, admin: adminResult };
    },

    async sendDispatchUpdate(order) {
        const templateName = 'order_dispatched';
        const params = [
            order.customer_name,
            order.order_id,
            order.dispatch_status || 'Dispatched'
        ];

        const result = await this.sendMessage(
            order.customer_mobile,
            templateName,
            params
        );

        await whatsappLogModel.create({
            orderId: order.id,
            phoneNumber: order.customer_mobile,
            messageType: 'ORDER_DISPATCHED',
            templateName,
            status: result.success ? 'SENT' : 'FAILED',
            whatsappMessageId: result.messageId,
            errorMessage: result.error
        });

        return result;
    }
};

module.exports = whatsappService;
