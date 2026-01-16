const API_BASE = '/api';

async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('adminToken');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }

    return data;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
}

function formatDate(dateString) {
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(dateString));
}

function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart(product, quantity = 1) {
    const cart = getCart();
    const existingIndex = cart.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            variant: product.variant,
            price: parseFloat(product.price),
            image: product.image,
            quantity
        });
    }

    saveCart(cart);
    showToast('Added to cart!', 'success');
}

function removeFromCart(productId) {
    const cart = getCart().filter(item => item.id !== productId);
    saveCart(cart);
}

function updateCartItemQuantity(productId, quantity) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity = quantity;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart(cart);
        }
    }
}

function getCartTotal() {
    return getCart().reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getCartCount() {
    return getCart().reduce((count, item) => count + item.quantity, 0);
}

function updateCartCount() {
    const countElements = document.querySelectorAll('.cart-count');
    const count = getCartCount();
    
    countElements.forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'flex' : 'none';
    });
}

function clearCart() {
    localStorage.removeItem('cart');
    updateCartCount();
}

function validateMobile(mobile) {
    return /^[6-9]\d{9}$/.test(mobile);
}

function validateName(name) {
    return name.trim().length >= 2;
}

function validateAddress(address) {
    return address.trim().length >= 10;
}
