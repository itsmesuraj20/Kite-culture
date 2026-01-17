# Razorpay Quick Setup Checklist

## ✅ Current Status
- Keys found in `.env` file
- ⚠️ Authentication test failed - needs verification

## 🔧 Step-by-Step Setup

### 1. Verify Your Razorpay Account
- [ ] Login to [Razorpay Dashboard](https://dashboard.razorpay.com)
- [ ] Complete KYC verification (if not done)
- [ ] Check account status is "Active"

### 2. Get Correct API Keys

#### For Testing (Recommended First):
1. Go to **Settings** → **API Keys**
2. Click **Generate Test Key** (if not already generated)
3. Copy:
   - **Key ID** (starts with `rzp_test_...`)
   - **Key Secret** (starts with `rzp_test_...`)

#### For Production:
1. Use **Live Keys** (starts with `rzp_live_...`)
2. Only use after thorough testing!

### 3. Update .env File

```env
# Replace with your actual keys
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_actual_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

**Important**: 
- Test and Live keys are different
- Use Test keys for development
- Never commit `.env` to git

### 4. Test Configuration

Run the test script:
```bash
node test-razorpay.js
```

Expected output: ✅ Razorpay configured correctly!

### 5. Set Up Webhook (Critical!)

#### For Local Development:
1. Install ngrok: `npm install -g ngrok`
2. Start your server: `npm run dev`
3. In another terminal: `ngrok http 3000`
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

#### Configure in Razorpay Dashboard:
1. Go to **Settings** → **Webhooks**
2. Click **+ New Webhook**
3. **Webhook URL**: `https://your-ngrok-url.ngrok.io/api/webhooks/razorpay`
4. **Events to listen**:
   - ✅ `payment.captured`
   - ✅ `payment.failed`
   - ✅ `order.paid`
5. **Save** and copy the **Webhook Secret**
6. Add to `.env`: `RAZORPAY_WEBHOOK_SECRET=your_secret`

### 6. Test Payment Flow

#### Using Test Cards:
- **Card Number**: `4111 1111 1111 1111`
- **CVV**: Any 3 digits (e.g., `123`)
- **Expiry**: Any future date (e.g., `12/25`)
- **Name**: Any name

#### Test Flow:
1. Add product to cart
2. Go to checkout
3. Fill customer details
4. Click "Proceed to Pay"
5. Use test card details
6. Complete payment
7. Check order status updates

### 7. Verify Webhook is Working

After test payment:
1. Check server logs for webhook events
2. Verify order status changed to "PAID"
3. Check database for payment_id and signature

## 🔍 Troubleshooting

### Issue: "Authentication failed"
**Solutions:**
- Verify Key ID and Secret are correct
- Ensure both keys are from same account (test/live)
- Check if keys are active in dashboard
- Try regenerating keys

### Issue: "Webhook not receiving events"
**Solutions:**
- Verify webhook URL is accessible (use ngrok for local)
- Check webhook is active in dashboard
- Ensure events are enabled
- Check server logs for errors
- Verify webhook secret matches

### Issue: "Payment not updating"
**Solutions:**
- Check webhook is configured correctly
- Verify webhook signature verification
- Check database connection
- Review server error logs

## 📋 Quick Reference

### Environment Variables:
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=webhook_secret
```

### Webhook URL Format:
```
https://yourdomain.com/api/webhooks/razorpay
```

### Test Card:
```
Card: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
```

## 🚀 Next Steps

1. ✅ Fix authentication issue (verify keys)
2. ✅ Set up webhook for local testing
3. ✅ Test complete payment flow
4. ✅ Verify order status updates
5. ✅ Test with multiple scenarios
6. ✅ Switch to live keys for production

## 📚 Resources

- [Razorpay Docs](https://razorpay.com/docs)
- [Test Cards](https://razorpay.com/docs/payments/test-cards)
- [Webhook Guide](https://razorpay.com/docs/webhooks)
- [Support](https://razorpay.com/support)
