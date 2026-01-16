const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel');
const razorpayService = require('../services/razorpayService');
const whatsappService = require('../services/whatsappService');
const { asyncHandler } = require('../middleware/errorHandler');
const db = require('../config/database');

const orderController = {
    create: asyncHandler(async (req, res) => {
        const { customerName, customerMobile, customerAddress, items } = req.body;
        
        const client = await db.getClient();
        
        try {
            await client.query('BEGIN');
            
            const productIds = items.map(item => item.productId);
            const products = await productModel.findByIds(productIds);
            
            if (products.length !== productIds.length) {
                throw Object.assign(new Error('One or more products not found'), { statusCode: 400 });
            }

            const productMap = products.reduce((acc, p) => {
                acc[p.id] = p;
                return acc;
            }, {});

            let totalAmount = 0;
            const orderItems = [];

            for (const item of items) {
                const product = productMap[item.productId];
                
                if (product.stock < item.quantity) {
                    throw Object.assign(
                        new Error(`Insufficient stock for ${product.name}`),
                        { statusCode: 400 }
                    );
                }

                await productModel.updateStock(item.productId, item.quantity, client);

                const itemTotal = product.price * item.quantity;
                totalAmount += itemTotal;

                orderItems.push({
                    productId: product.id,
                    productName: product.name,
                    productVariant: product.variant,
                    quantity: item.quantity,
                    unitPrice: product.price,
                    totalPrice: itemTotal
                });
            }

            const order = await orderModel.create(
                { customerName, customerMobile, customerAddress, totalAmount },
                orderItems,
                client
            );

            const razorpayOrder = await razorpayService.createOrder(
                totalAmount,
                order.order_id,
                { customer_name: customerName, customer_mobile: customerMobile }
            );

            await orderModel.updateRazorpayOrderId(order.order_id, razorpayOrder.id);

            await client.query('COMMIT');

            const paymentLink = `${process.env.APP_URL}/checkout?orderId=${order.order_id}`;
            whatsappService.sendOrderCreatedMessage(order, paymentLink).catch(console.error);

            res.status(201).json({
                success: true,
                data: {
                    orderId: order.order_id,
                    razorpayOrderId: razorpayOrder.id,
                    razorpayKeyId: razorpayService.getKeyId(),
                    amount: totalAmount,
                    currency: 'INR'
                }
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }),

    getByOrderId: asyncHandler(async (req, res) => {
        const order = await orderModel.getOrderWithItems(req.params.orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });
    }),

    verifyPayment: asyncHandler(async (req, res) => {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

        const isValid = razorpayService.verifyPaymentSignature(
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        );

        if (!isValid) {
            return res.status(400).json({
                success: false,
                error: 'Invalid payment signature'
            });
        }

        const order = await orderModel.updatePaymentSuccess(
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        whatsappService.sendPaymentConfirmation(order).catch(console.error);

        res.json({
            success: true,
            data: {
                orderId: order.order_id,
                status: order.status
            }
        });
    }),

    getPaymentDetails: asyncHandler(async (req, res) => {
        const order = await orderModel.findByOrderId(req.params.orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        if (order.status !== 'INITIATED') {
            return res.status(400).json({
                success: false,
                error: 'Order already processed',
                data: { status: order.status }
            });
        }

        res.json({
            success: true,
            data: {
                orderId: order.order_id,
                razorpayOrderId: order.razorpay_order_id,
                razorpayKeyId: razorpayService.getKeyId(),
                amount: order.total_amount,
                currency: 'INR',
                customerName: order.customer_name,
                customerMobile: order.customer_mobile
            }
        });
    })
};

module.exports = orderController;
