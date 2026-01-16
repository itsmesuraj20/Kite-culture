const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { checkoutValidation, orderIdValidation, paymentVerifyValidation } = require('../middleware/validators');

router.post('/', checkoutValidation, orderController.create);
router.get('/:orderId', orderIdValidation, orderController.getByOrderId);
router.get('/:orderId/payment', orderIdValidation, orderController.getPaymentDetails);
router.post('/verify-payment', paymentVerifyValidation, orderController.verifyPayment);

module.exports = router;
