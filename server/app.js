const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const razorpayWebhook = require('./webhooks/razorpayWebhook');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.razorpay.com"],
            frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"]
        }
    }
}));

app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.APP_URL : '*',
    credentials: true
}));

app.post('/api/webhooks/razorpay', express.raw({ type: 'application/json' }), razorpayWebhook);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/checkout.html'));
});

app.get('/order-confirmation', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/order-confirmation.html'));
});

app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin/login.html'));
});

app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin/dashboard.html'));
});

app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Not found' });
});

app.use(errorHandler);

module.exports = app;
