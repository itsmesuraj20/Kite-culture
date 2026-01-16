const razorpayService = require('../services/razorpayService');
const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel');
const whatsappService = require('../services/whatsappService');
const { asyncHandler } = require('../middleware/errorHandler');

const razorpayWebhook = asyncHandler(async (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    const isValid = razorpayService.verifyWebhookSignature(body, signature);

    if (!isValid) {
        console.error('Invalid webhook signature');
        return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    switch (event) {
        case 'payment.captured': {
            const payment = payload.payment.entity;
            const razorpayOrderId = payment.order_id;
            
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
