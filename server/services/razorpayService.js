const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const razorpayService = {
    async createOrder(amount, orderId, notes = {}) {
        const options = {
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: orderId,
            notes: {
                order_id: orderId,
                ...notes
            }
        };

        const order = await razorpay.orders.create(options);
        return order;
    },

    verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
        const body = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');
        
        return expectedSignature === razorpaySignature;
    },

    verifyWebhookSignature(body, signature) {
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(body)
            .digest('hex');
        
        return expectedSignature === signature;
    },

    async fetchPayment(paymentId) {
        return razorpay.payments.fetch(paymentId);
    },

    async fetchOrder(orderId) {
        return razorpay.orders.fetch(orderId);
    },

    getKeyId() {
        return process.env.RAZORPAY_KEY_ID;
    }
};

module.exports = razorpayService;
