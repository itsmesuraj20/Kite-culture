const orderModel = require('../models/orderModel');
const adminModel = require('../models/adminModel');
const whatsappService = require('../services/whatsappService');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateToken } = require('../middleware/auth');

const adminController = {
    login: asyncHandler(async (req, res) => {
        const { username, password } = req.body;

        const admin = await adminModel.findByUsername(username);
        
        if (!admin) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const isValid = await adminModel.verifyPassword(password, admin.password_hash);
        
        if (!isValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const token = generateToken(admin);

        res.json({
            success: true,
            data: {
                token,
                username: admin.username
            }
        });
    }),

    getOrders: asyncHandler(async (req, res) => {
        const { status, limit = 50, offset = 0 } = req.query;
        
        const orders = await orderModel.findAll(
            status || null,
            parseInt(limit),
            parseInt(offset)
        );

        res.json({
            success: true,
            data: orders
        });
    }),

    getOrderDetails: asyncHandler(async (req, res) => {
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

    updateDispatch: asyncHandler(async (req, res) => {
        const { orderId } = req.params;
        const { dispatchStatus, dispatchNotes } = req.body;

        const order = await orderModel.updateDispatch(orderId, dispatchStatus, dispatchNotes);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        whatsappService.sendDispatchUpdate(order).catch(console.error);

        res.json({
            success: true,
            data: order
        });
    }),

    getStats: asyncHandler(async (req, res) => {
        const stats = await orderModel.getStats();
        
        res.json({
            success: true,
            data: stats
        });
    }),

    updateStatus: asyncHandler(async (req, res) => {
        const { orderId } = req.params;
        const { status } = req.body;

        const validStatuses = ['INITIATED', 'PAID', 'FAILED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status'
            });
        }

        const order = await orderModel.updateStatus(orderId, status);
        
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
    })
};

module.exports = adminController;
