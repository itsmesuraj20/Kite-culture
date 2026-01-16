class CheckoutPage {
    constructor() {
        this.form = document.getElementById('checkoutForm');
        this.summaryContainer = document.getElementById('orderSummary');
        this.submitBtn = document.getElementById('submitBtn');
        this.orderId = new URLSearchParams(window.location.search).get('orderId');

        this.init();
    }

    async init() {
        if (this.orderId) {
            await this.loadExistingOrder();
        } else {
            this.renderSummary();
            this.bindEvents();
        }
    }

    bindEvents() {
        this.form?.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    renderSummary() {
        const cart = getCart();

        if (cart.length === 0) {
            window.location.href = '/';
            return;
        }

        this.summaryContainer.innerHTML = `
            <h3>Order Summary</h3>
            ${cart.map(item => `
                <div class="summary-item">
                    <span>${item.name} ${item.variant ? `(${item.variant})` : ''} × ${item.quantity}</span>
                    <span>${formatCurrency(item.price * item.quantity)}</span>
                </div>
            `).join('')}
            <div class="summary-total">
                <span>Total</span>
                <span>${formatCurrency(getCartTotal())}</span>
            </div>
        `;
    }

    async handleSubmit(e) {
        e.preventDefault();

        const customerName = document.getElementById('customerName').value.trim();
        const customerMobile = document.getElementById('customerMobile').value.trim();
        const customerAddress = document.getElementById('customerAddress').value.trim();

        if (!validateName(customerName)) {
            showToast('Please enter a valid name', 'error');
            return;
        }

        if (!validateMobile(customerMobile)) {
            showToast('Please enter a valid 10-digit mobile number', 'error');
            return;
        }

        if (!validateAddress(customerAddress)) {
            showToast('Please enter a complete address (min 10 characters)', 'error');
            return;
        }

        const cart = getCart();
        if (cart.length === 0) {
            showToast('Your cart is empty', 'error');
            return;
        }

        this.submitBtn.disabled = true;
        this.submitBtn.textContent = 'Processing...';

        try {
            const response = await apiRequest('/orders', {
                method: 'POST',
                body: JSON.stringify({
                    customerName,
                    customerMobile,
                    customerAddress,
                    items: cart.map(item => ({
                        productId: item.id,
                        quantity: item.quantity
                    }))
                })
            });

            this.initiatePayment(response.data, customerName, customerMobile);
        } catch (error) {
            showToast(error.message || 'Failed to create order', 'error');
            this.submitBtn.disabled = false;
            this.submitBtn.textContent = 'Proceed to Pay';
        }
    }

    async loadExistingOrder() {
        try {
            const response = await apiRequest(`/orders/${this.orderId}/payment`);
            const data = response.data;

            document.getElementById('customerName').value = data.customerName;
            document.getElementById('customerMobile').value = data.customerMobile;
            document.getElementById('customerName').disabled = true;
            document.getElementById('customerMobile').disabled = true;

            this.summaryContainer.innerHTML = `
                <h3>Order Summary</h3>
                <div class="summary-item">
                    <span>Order ID</span>
                    <span>${data.orderId}</span>
                </div>
                <div class="summary-total">
                    <span>Total</span>
                    <span>${formatCurrency(data.amount)}</span>
                </div>
            `;

            this.initiatePayment(data, data.customerName, data.customerMobile);
        } catch (error) {
            showToast(error.message || 'Order not found or already processed', 'error');
            setTimeout(() => window.location.href = '/', 2000);
        }
    }

    initiatePayment(orderData, name, mobile) {
        const options = {
            key: orderData.razorpayKeyId,
            amount: orderData.amount * 100,
            currency: orderData.currency,
            name: 'Kite Culture',
            description: `Order #${orderData.orderId}`,
            order_id: orderData.razorpayOrderId,
            prefill: {
                name: name,
                contact: mobile
            },
            theme: {
                color: '#e63946'
            },
            handler: async (response) => {
                await this.verifyPayment(response, orderData.orderId);
            },
            modal: {
                ondismiss: () => {
                    this.submitBtn.disabled = false;
                    this.submitBtn.textContent = 'Proceed to Pay';
                    showToast('Payment cancelled', 'warning');
                }
            }
        };

        const rzp = new Razorpay(options);
        rzp.on('payment.failed', (response) => {
            showToast('Payment failed: ' + response.error.description, 'error');
            this.submitBtn.disabled = false;
            this.submitBtn.textContent = 'Retry Payment';
        });

        rzp.open();
    }

    async verifyPayment(paymentResponse, orderId) {
        try {
            await apiRequest('/orders/verify-payment', {
                method: 'POST',
                body: JSON.stringify({
                    razorpayOrderId: paymentResponse.razorpay_order_id,
                    razorpayPaymentId: paymentResponse.razorpay_payment_id,
                    razorpaySignature: paymentResponse.razorpay_signature
                })
            });

            clearCart();
            window.location.href = `/order-confirmation?orderId=${orderId}`;
        } catch (error) {
            showToast('Payment verification failed', 'error');
            window.location.href = `/order-confirmation?orderId=${orderId}`;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('checkoutForm')) {
        new CheckoutPage();
    }
});
