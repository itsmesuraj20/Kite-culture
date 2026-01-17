# Razorpay Configuration Guide

Complete guide to set up Razorpay payment gateway for Kite Culture.

## Step 1: Create Razorpay Account

1. Go to [https://razorpay.com](https://razorpay.com)
2. Click "Sign Up" and create your account
3. Complete the KYC verification process
4. Once verified, you'll get access to the Dashboard

## Step 2: Get API Keys

1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to **Settings** → **API Keys**
3. Click **Generate Test Key** (for testing) or use **Live Keys** (for production)

### Test Mode (Development)
- **Key ID**: Starts with `rzp_test_...`
- **Key Secret**: Starts with `rzp_test_...`

### Live Mode (Production)
- **Key ID**: Starts with `rzp_live_...`
- **Key Secret**: Starts with `rzp_live_...`

## Step 3: Configure Environment Variables

Add these to your `.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

**Important**: Never commit your `.env` file to version control!

## Step 4: Set Up Webhooks

Webhooks are essential for payment status updates.

### 4.1 Create Webhook in Razorpay Dashboard

1. Go to **Settings** → **Webhooks**
2. Click **+ New Webhook**
3. Configure:
   - **Webhook URL**: `https://yourdomain.com/api/webhooks/razorpay`
   - **For local testing**: Use [ngrok](https://ngrok.com) or similar tool
     - Example: `https://abc123.ngrok.io/api/webhooks/razorpay`

### 4.2 Select Events to Listen

Enable these events:
- ✅ `payment.captured` - When payment is successful
- ✅ `payment.failed` - When payment fails
- ✅ `order.paid` - When order is paid

### 4.3 Get Webhook Secret

1. After creating webhook, click on it
2. Copy the **Webhook Secret**
3. Add it to `.env` as `RAZORPAY_WEBHOOK_SECRET`

## Step 5: Test Mode Setup

### For Local Development:

1. Use Razorpay Test Mode
2. Use test cards from [Razorpay Test Cards](https://razorpay.com/docs/payments/test-cards/)

**Test Cards:**
- **Success**: `4111 1111 1111 1111`
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **Name**: Any name

### Test Payment Flow:
1. Create order → Get Razorpay order ID
2. Use test card to make payment
3. Check webhook receives payment events
4. Verify order status updates in database

## Step 6: Production Setup

### Before Going Live:

1. ✅ Complete Razorpay KYC
2. ✅ Switch to Live API Keys
3. ✅ Update `.env` with live keys
4. ✅ Set up production webhook URL
5. ✅ Test with small amount first
6. ✅ Monitor webhook logs

## Step 7: Verify Configuration

### Check if Razorpay is configured:

```bash
# In your server, check if keys are loaded
node -e "require('dotenv').config(); console.log('Key ID:', process.env.RAZORPAY_KEY_ID ? 'Set' : 'Missing');"
```

### Test API Connection:

```javascript
// Test script (test-razorpay.js)
require('dotenv').config();
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Test creating an order
razorpay.orders.create({
    amount: 10000, // ₹100
    currency: 'INR',
    receipt: 'test_receipt_001'
}).then(order => {
    console.log('✅ Razorpay configured correctly!');
    console.log('Order ID:', order.id);
}).catch(error => {
    console.error('❌ Razorpay configuration error:', error.message);
});
```

Run: `node test-razorpay.js`

## Step 8: Webhook Testing (Local Development)

### Using ngrok:

1. Install ngrok: `npm install -g ngrok` or download from [ngrok.com](https://ngrok.com)
2. Start your server: `npm run dev`
3. Expose local server:
   ```bash
   ngrok http 3000
   ```
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
5. Update webhook URL in Razorpay: `https://abc123.ngrok.io/api/webhooks/razorpay`
6. Test payment and check webhook logs

## Step 9: Common Issues & Solutions

### Issue: "Invalid key_id"
- **Solution**: Check `RAZORPAY_KEY_ID` in `.env` matches dashboard

### Issue: "Webhook signature verification failed"
- **Solution**: Ensure `RAZORPAY_WEBHOOK_SECRET` matches webhook secret in dashboard

### Issue: "Payment not updating in database"
- **Solution**: 
  - Check webhook URL is accessible
  - Verify webhook events are enabled
  - Check server logs for webhook errors

### Issue: "Order creation failed"
- **Solution**: 
  - Verify API keys are correct
  - Check amount is in paise (multiply by 100)
  - Ensure currency is 'INR'

## Step 10: Security Best Practices

1. ✅ Never expose API keys in frontend code
2. ✅ Always verify payment signatures server-side
3. ✅ Use HTTPS for webhook URLs
4. ✅ Store secrets in environment variables
5. ✅ Use different keys for test and production
6. ✅ Regularly rotate API keys
7. ✅ Monitor webhook logs for suspicious activity

## Quick Reference

### Environment Variables Needed:
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### Webhook URL Format:
```
https://yourdomain.com/api/webhooks/razorpay
```

### Required Webhook Events:
- `payment.captured`
- `payment.failed`
- `order.paid`

## Support

- Razorpay Docs: [https://razorpay.com/docs](https://razorpay.com/docs)
- Razorpay Support: [https://razorpay.com/support](https://razorpay.com/support)
- Test Cards: [https://razorpay.com/docs/payments/test-cards](https://razorpay.com/docs/payments/test-cards)
