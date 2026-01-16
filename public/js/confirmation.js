class OrderConfirmation {
    constructor() {
        this.orderId = new URLSearchParams(window.location.search).get('orderId');
        this.container = document.getElementById('confirmationContainer');

        if (this.orderId) {
            this.loadOrder();
        } else {
            this.showError('No order ID provided');
        }
    }

    async loadOrder() {
        try {
            const response = await apiRequest(`/orders/${this.orderId}`);
            this.render(response.data);
        } catch (error) {
            this.showError('Order not found');
        }
    }

    render(order) {
        const statusConfig = {
            'PAID': { icon: '✓', class: 'success', text: 'Payment Successful' },
            'INITIATED': { icon: '⏳', class: 'pending', text: 'Payment Pending' },
            'FAILED': { icon: '✗', class: 'failed', text: 'Payment Failed' },
            'DISPATCHED': { icon: '🚚', class: 'success', text: 'Order Dispatched' },
            'DELIVERED': { icon: '📦', class: 'success', text: 'Order Delivered' }
        };

        const status = statusConfig[order.status] || statusConfig['INITIATED'];

        this.container.innerHTML = `
            <div class="confirmation-icon ${status.class}">${status.icon}</div>
            <h1>${status.text}</h1>
            <p>Thank you for your order!</p>

            <div class="confirmation-details">
                <div class="detail-row">
                    <span class="detail-label">Order ID</span>
                    <span class="detail-value">${order.order_id}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status</span>
                    <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Customer Name</span>
                    <span class="detail-value">${order.customer_name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Mobile</span>
                    <span class="detail-value">${order.customer_mobile}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Delivery Address</span>
                    <span class="detail-value">${order.customer_address}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Order Date</span>
                    <span class="detail-value">${formatDate(order.created_at)}</span>
                </div>

                <h3 style="margin-top: 25px; margin-bottom: 15px;">Order Items</h3>
                ${order.items.map(item => `
                    <div class="detail-row">
                        <span class="detail-label">${item.product_name} ${item.product_variant ? `(${item.product_variant})` : ''} × ${item.quantity}</span>
                        <span class="detail-value">${formatCurrency(item.total_price)}</span>
                    </div>
                `).join('')}

                <div class="detail-row" style="border-top: 2px solid #ddd; padding-top: 15px; margin-top: 15px;">
                    <span class="detail-label" style="font-weight: bold; font-size: 1.1rem;">Total Amount</span>
                    <span class="detail-value" style="font-weight: bold; font-size: 1.2rem; color: var(--primary-color);">
                        ${formatCurrency(order.total_amount)}
                    </span>
                </div>

                ${order.razorpay_payment_id ? `
                    <div class="detail-row">
                        <span class="detail-label">Payment ID</span>
                        <span class="detail-value">${order.razorpay_payment_id}</span>
                    </div>
                ` : ''}

                ${order.dispatch_status ? `
                    <div class="detail-row">
                        <span class="detail-label">Dispatch Status</span>
                        <span class="detail-value">${order.dispatch_status}</span>
                    </div>
                ` : ''}
            </div>

            <div style="margin-top: 30px;">
                <a href="/" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
    }

    showError(message) {
        this.container.innerHTML = `
            <div class="confirmation-icon failed">✗</div>
            <h1>Error</h1>
            <p>${message}</p>
            <div style="margin-top: 30px;">
                <a href="/" class="btn btn-primary">Go to Home</a>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('confirmationContainer')) {
        new OrderConfirmation();
    }
});
