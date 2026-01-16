const razorpayService = require('../services/razorpayService');
const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel');
const whatsappService = require('../services/whatsappService');
const { asyncHandler } = require('../middleware/errorHandler');

const razorpayWebhook = asyncHandler(async (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    const body = req.body.toString();

    const isValid = razorpayService.verifyWebhookSignature(body, signature);

    if (!isValid) {
        console.error('Invalid webhook signature');
        return res.status(400).json({ error: 'Invalid signature' });
    }

    const webhookData = JSON.parse(body);
    const event = webhookData.event;
    const payload = webhookData.payload;

    switch (event) {
        case 'payment.captured': {
            const payment = payload.payment.entity;
            const razorpayOrderId = payment.order_id;
            
            const existingOrder = await orderModel.findByRazorpayOrderId(razorpayOrderId);
            
            if (!existingOrder) {
                console.error(`Order not found for Razorpay order ID: ${razorpayOrderId}`);
                break;
            }

            if (existingOrder.status === 'PAID') {
                console.log(`Order ${existingOrder.order_id} already paid, skipping webhook processing`);
                break;
            }
            
            const order = await orderModel.updatePaymentSuccess(
                razorpayOrderId,
                payment.id,
                ''
            );

            if (order) {
                whatsappService.sendPaymentConfirmation(order).catch(console.error);
            }
            break;
        }

        case 'payment.failed': {
            const payment = payload.payment.entity;
            const razorpayOrderId = payment.order_id;
            
            const existingOrder = await orderModel.findByRazorpayOrderId(razorpayOrderId);
            
            if (!existingOrder) {
                console.error(`Order not found for Razorpay order ID: ${razorpayOrderId}`);
                break;
            }

            if (existingOrder.status === 'FAILED' || existingOrder.status === 'PAID') {
                console.log(`Order ${existingOrder.order_id} already processed, skipping webhook`);
                break;
            }
            
            const order = await orderModel.updatePaymentFailed(razorpayOrderId);
            
            if (order) {
                const items = await orderModel.getOrderItems(order.id);
                for (const item of items) {
                    await productModel.restoreStock(item.product_id, item.quantity);
                }
            }
            break;
        }

        case 'order.paid': {
            const razorpayOrder = payload.order.entity;
            const order = await orderModel.findByRazorpayOrderId(razorpayOrder.id);
            
            if (order && order.status !== 'PAID') {
                await orderModel.updateStatus(order.order_id, 'PAID');
            }
            break;
        }
    }

    res.json({ status: 'ok' });
});

module.exports = razorpayWebhook;
