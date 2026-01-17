require('dotenv').config();
const Razorpay = require('razorpay');

console.log('\n🔍 Testing Razorpay Configuration...\n');

// Check if keys are set
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error('❌ Error: Razorpay keys not found in .env file');
    console.log('\nPlease add these to your .env file:');
    console.log('RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx');
    console.log('RAZORPAY_KEY_SECRET=your_secret_key_here\n');
    process.exit(1);
}

console.log('✅ Key ID found:', process.env.RAZORPAY_KEY_ID.substring(0, 12) + '...');
console.log('✅ Key Secret found:', process.env.RAZORPAY_KEY_SECRET.substring(0, 12) + '...\n');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Test creating an order
console.log('🧪 Testing order creation...');

razorpay.orders.create({
    amount: 10000, // ₹100 in paise
    currency: 'INR',
    receipt: 'test_receipt_' + Date.now(),
    notes: {
        description: 'Test order from Kite Culture'
    }
})
.then(order => {
    console.log('✅ Razorpay configured correctly!');
    console.log('\n📋 Order Details:');
    console.log('   Order ID:', order.id);
    console.log('   Amount: ₹', order.amount / 100);
    console.log('   Status:', order.status);
    console.log('\n🎉 Your Razorpay integration is working!\n');
    
    // Test fetching the order
    return razorpay.orders.fetch(order.id);
})
.then(order => {
    console.log('✅ Order fetch test successful');
    console.log('   Order Status:', order.status);
    process.exit(0);
})
.catch(error => {
    console.error('\n❌ Razorpay configuration error:');
    console.error('   Error:', error.message);
    
    if (error.error) {
        console.error('   Details:', error.error.description || error.error);
    }
    
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check if API keys are correct');
    console.log('   2. Verify keys are from the same account (test/live)');
    console.log('   3. Ensure you have completed Razorpay KYC');
    console.log('   4. Check your internet connection\n');
    
    process.exit(1);
});
