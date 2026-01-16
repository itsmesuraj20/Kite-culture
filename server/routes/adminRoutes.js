const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/auth');
const { adminLoginValidation, dispatchValidation } = require('../middleware/validators');

router.post('/login', adminLoginValidation, adminController.login);

router.use(authMiddleware);

router.get('/orders', adminController.getOrders);
router.get('/orders/:orderId', adminController.getOrderDetails);
router.put('/orders/:orderId/dispatch', dispatchValidation, adminController.updateDispatch);
router.put('/orders/:orderId/status', adminController.updateStatus);
router.get('/stats', adminController.getStats);

module.exports = router;
