# Kite Culture E-commerce

Production-ready e-commerce website for selling Manjha and Kites.

## Tech Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Payment**: Razorpay
- **Messaging**: WhatsApp Business API

## Setup

### 1. Prerequisites

- Node.js >= 18
- PostgreSQL

### 2. Database Setup

```bash
# Create database
createdb kite_culture

# Run schema
psql -d kite_culture -f database/schema.sql
```

### 3. Environment Variables

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Server

```bash
# Development
npm run dev

# Production
npm start
```

## WhatsApp Templates Required

Create these templates in WhatsApp Business Manager:

1. **order_created** - Parameters: customer_name, order_id, amount, payment_link
2. **order_notification_admin** - Parameters: admin_name, order_id, amount, customer_info
3. **payment_confirmed** - Parameters: customer_name, order_id, amount
4. **payment_received_admin** - Parameters: order_id, amount, payment_id
5. **order_dispatched** - Parameters: customer_name, order_id, dispatch_status

## Razorpay Webhook

Configure webhook URL in Razorpay Dashboard:
```
https://yourdomain.com/api/webhooks/razorpay
```

Events to enable:
- payment.captured
- payment.failed
- order.paid

## Project Structure

```
├── database/
│   └── schema.sql
├── public/
│   ├── css/
│   ├── js/
│   ├── images/
│   ├── admin/
│   ├── index.html
│   ├── checkout.html
│   └── order-confirmation.html
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── webhooks/
│   ├── app.js
│   └── server.js
├── .env.example
├── package.json
└── README.md
```
