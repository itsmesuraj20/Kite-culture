const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.type = 'validation';
        error.errors = errors.array();
        return next(error);
    }
    next();
};

const checkoutValidation = [
    body('customerName')
        .trim()
        .notEmpty().withMessage('Full name is required')
        .isLength({ min: 2, max: 255 }).withMessage('Name must be 2-255 characters'),
    body('customerMobile')
        .trim()
        .notEmpty().withMessage('Mobile number is required')
        .matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian mobile number'),
    body('customerAddress')
        .trim()
        .notEmpty().withMessage('Address is required')
        .isLength({ min: 10, max: 500 }).withMessage('Address must be 10-500 characters'),
    body('items')
        .isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.productId')
        .isUUID().withMessage('Invalid product ID'),
    body('items.*.quantity')
        .isInt({ min: 1, max: 100 }).withMessage('Quantity must be 1-100'),
    validate
];

const orderIdValidation = [
    param('orderId')
        .trim()
        .notEmpty().withMessage('Order ID is required')
        .matches(/^KC[A-Z0-9]+$/).withMessage('Invalid order ID format'),
    validate
];

const paymentVerifyValidation = [
    body('razorpayOrderId')
        .notEmpty().withMessage('Razorpay order ID is required'),
    body('razorpayPaymentId')
        .notEmpty().withMessage('Razorpay payment ID is required'),
    body('razorpaySignature')
        .notEmpty().withMessage('Razorpay signature is required'),
    validate
];

const adminLoginValidation = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required'),
    body('password')
        .notEmpty().withMessage('Password is required'),
    validate
];

const dispatchValidation = [
    param('orderId')
        .trim()
        .notEmpty().withMessage('Order ID is required'),
    body('dispatchStatus')
        .trim()
        .notEmpty().withMessage('Dispatch status is required')
        .isLength({ max: 50 }).withMessage('Dispatch status too long'),
    body('dispatchNotes')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Notes too long'),
    validate
];

module.exports = {
    checkoutValidation,
    orderIdValidation,
    paymentVerifyValidation,
    adminLoginValidation,
    dispatchValidation
};
