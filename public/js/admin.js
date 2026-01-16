class AdminLogin {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.errorEl = document.getElementById('loginError');
        this.submitBtn = this.form?.querySelector('button[type="submit"]');

        if (localStorage.getItem('adminToken')) {
            window.location.href = '/admin/dashboard';
            return;
        }

        this.bindEvents();
    }

    bindEvents() {
        this.form?.addEventListener('submit', (e) => this.handleLogin(e));
    }

    async handleLogin(e) {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!username || !password) {
            this.showError('Please enter username and password');
            return;
        }

        this.submitBtn.disabled = true;
        this.submitBtn.textContent = 'Logging in...';

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            localStorage.setItem('adminToken', data.data.token);
            window.location.href = '/admin/dashboard';
        } catch (error) {
            this.showError(error.message);
            this.submitBtn.disabled = false;
            this.submitBtn.textContent = 'Login';
        }
    }

    showError(message) {
        this.errorEl.textContent = message;
        this.errorEl.style.display = 'block';
    }
}

class AdminDashboard {
    constructor() {
        if (!localStorage.getItem('adminToken')) {
            window.location.href = '/admin/login';
            return;
        }

        this.ordersContainer = document.getElementById('ordersTable');
        this.statsContainer = document.getElementById('statsContainer');
        this.currentFilter = null;
        this.orders = [];

        this.init();
    }

    async init() {
        this.bindEvents();
        await Promise.all([this.loadStats(), this.loadOrders()]);
    }

    bindEvents() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const status = e.target.dataset.status || null;
                this.filterOrders(status);

                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        document.querySelector('.logout-btn')?.addEventListener('click', () => this.logout());
        document.querySelector('.modal-overlay')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeModal();
        });
    }

    async loadStats() {
        try {
            const response = await apiRequest('/admin/stats');
            this.renderStats(response.data);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    renderStats(stats) {
        const statsMap = stats.reduce((acc, s) => {
            acc[s.status] = { count: parseInt(s.count), amount: parseFloat(s.total_amount) };
            return acc;
        }, {});

        const totalOrders = stats.reduce((sum, s) => sum + parseInt(s.count), 0);
        const totalRevenue = statsMap['PAID']?.amount || 0;

        this.statsContainer.innerHTML = `
            <div class="stat-card">
                <h3>Total Orders</h3>
                <div class="stat-value">${totalOrders}</div>
            </div>
            <div class="stat-card paid">
                <h3>Revenue</h3>
                <div class="stat-value">${formatCurrency(totalRevenue)}</div>
            </div>
            <div class="stat-card pending">
                <h3>Pending</h3>
                <div class="stat-value">${statsMap['INITIATED']?.count || 0}</div>
            </div>
            <div class="stat-card paid">
                <h3>Paid</h3>
                <div class="stat-value">${statsMap['PAID']?.count || 0}</div>
            </div>
            <div class="stat-card failed">
                <h3>Failed</h3>
                <div class="stat-value">${statsMap['FAILED']?.count || 0}</div>
            </div>
        `;
    }

    async loadOrders() {
        try {
            const query = this.currentFilter ? `?status=${this.currentFilter}` : '';
            const response = await apiRequest(`/admin/orders${query}`);
            this.orders = response.data;
            this.renderOrders();
        } catch (error) {
            if (error.message === 'Invalid or expired token') {
                this.logout();
            }
            console.error('Failed to load orders:', error);
        }
    }

    filterOrders(status) {
        this.currentFilter = status;
        this.loadOrders();
    }

    renderOrders() {
        if (this.orders.length === 0) {
            this.ordersContainer.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px;">
                        No orders found
                    </td>
                </tr>
            `;
            return;
        }

        this.ordersContainer.innerHTML = this.orders.map(order => `
            <tr>
                <td><strong>${order.order_id}</strong></td>
                <td>${order.customer_name}</td>
                <td>${order.customer_mobile}</td>
                <td>${formatCurrency(order.total_amount)}</td>
                <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
                <td>${formatDate(order.created_at)}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn-sm btn-info" onclick="dashboard.viewOrder('${order.order_id}')">View</button>
                        ${order.status === 'PAID' ? `
                            <button class="btn btn-sm btn-success" onclick="dashboard.showDispatchModal('${order.order_id}')">Dispatch</button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async viewOrder(orderId) {
        try {
            const response = await apiRequest(`/admin/orders/${orderId}`);
            this.showOrderModal(response.data);
        } catch (error) {
            alert('Failed to load order details');
        }
    }

    showOrderModal(order) {
        const modal = document.getElementById('orderModal');
        const modalBody = modal.querySelector('.modal-body');

        modalBody.innerHTML = `
            <div class="order-detail-section">
                <h4>Order Information</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Order ID</span>
                        <span class="detail-value">${order.order_id}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Status</span>
                        <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Created</span>
                        <span class="detail-value">${formatDate(order.created_at)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Total</span>
                        <span class="detail-value">${formatCurrency(order.total_amount)}</span>
                    </div>
                </div>
            </div>

            <div class="order-detail-section">
                <h4>Customer Details</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Name</span>
                        <span class="detail-value">${order.customer_name}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Mobile</span>
                        <span class="detail-value">${order.customer_mobile}</span>
                    </div>
                    <div class="detail-item" style="grid-column: 1/-1;">
                        <span class="detail-label">Address</span>
                        <span class="detail-value">${order.customer_address}</span>
                    </div>
                </div>
            </div>

            <div class="order-detail-section">
                <h4>Order Items</h4>
                <table class="order-items-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Variant</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.product_name}</td>
                                <td>${item.product_variant || '-'}</td>
                                <td>${item.quantity}</td>
                                <td>${formatCurrency(item.unit_price)}</td>
                                <td>${formatCurrency(item.total_price)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            ${order.razorpay_payment_id ? `
                <div class="order-detail-section">
                    <h4>Payment Details</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Razorpay Order ID</span>
                            <span class="detail-value">${order.razorpay_order_id}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Payment ID</span>
                            <span class="detail-value">${order.razorpay_payment_id}</span>
                        </div>
                    </div>
                </div>
            ` : ''}

            ${order.dispatch_status ? `
                <div class="order-detail-section">
                    <h4>Dispatch Details</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Status</span>
                            <span class="detail-value">${order.dispatch_status}</span>
                        </div>
                        <div class="detail-item" style="grid-column: 1/-1;">
                            <span class="detail-label">Notes</span>
                            <span class="detail-value">${order.dispatch_notes || '-'}</span>
                        </div>
                    </div>
                </div>
            ` : ''}
        `;

        modal.querySelector('.modal-overlay').classList.add('open');
    }

    showDispatchModal(orderId) {
        const modal = document.getElementById('dispatchModal');
        modal.dataset.orderId = orderId;
        document.getElementById('dispatchStatus').value = '';
        document.getElementById('dispatchNotes').value = '';
        modal.querySelector('.modal-overlay').classList.add('open');
    }

    async submitDispatch() {
        const modal = document.getElementById('dispatchModal');
        const orderId = modal.dataset.orderId;
        const dispatchStatus = document.getElementById('dispatchStatus').value.trim();
        const dispatchNotes = document.getElementById('dispatchNotes').value.trim();

        if (!dispatchStatus) {
            alert('Please enter dispatch status');
            return;
        }

        try {
            await apiRequest(`/admin/orders/${orderId}/dispatch`, {
                method: 'PUT',
                body: JSON.stringify({ dispatchStatus, dispatchNotes })
            });

            this.closeModal();
            await this.loadOrders();
            await this.loadStats();
            alert('Order dispatched successfully! WhatsApp notification sent.');
        } catch (error) {
            alert('Failed to update dispatch status');
        }
    }

    closeModal() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
    }

    logout() {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
    }
}

let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('loginForm')) {
        new AdminLogin();
    } else if (document.getElementById('ordersTable')) {
        dashboard = new AdminDashboard();
    }
});
