class CartSidebar {
    constructor() {
        this.sidebar = document.getElementById('cartSidebar');
        this.overlay = document.getElementById('cartOverlay');
        this.cartItems = document.getElementById('cartItems');
        this.cartTotal = document.getElementById('cartTotal');
        this.checkoutBtn = document.getElementById('checkoutBtn');

        this.bindEvents();
    }

    bindEvents() {
        document.querySelector('.cart-icon')?.addEventListener('click', () => this.open());
        document.querySelector('.cart-close')?.addEventListener('click', () => this.close());
        this.overlay?.addEventListener('click', () => this.close());
        this.checkoutBtn?.addEventListener('click', () => this.goToCheckout());
    }

    open() {
        this.render();
        this.sidebar?.classList.add('open');
        this.overlay?.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.sidebar?.classList.remove('open');
        this.overlay?.classList.remove('open');
        document.body.style.overflow = '';
    }

    render() {
        const cart = getCart();

        if (cart.length === 0) {
            this.cartItems.innerHTML = `
                <div class="cart-empty">
                    <p>Your cart is empty</p>
                </div>
            `;
            this.checkoutBtn.disabled = true;
        } else {
            this.cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image || '/images/placeholder.jpg'}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-variant">${item.variant || ''}</div>
                        <div class="quantity-selector">
                            <button class="qty-btn" onclick="cartSidebar.updateQuantity('${item.id}', ${item.quantity - 1})">−</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" onclick="cartSidebar.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        </div>
                        <div class="cart-item-price">${formatCurrency(item.price * item.quantity)}</div>
                    </div>
                    <button class="cart-item-remove" onclick="cartSidebar.removeItem('${item.id}')">×</button>
                </div>
            `).join('');
            this.checkoutBtn.disabled = false;
        }

        this.cartTotal.textContent = formatCurrency(getCartTotal());
    }

    updateQuantity(productId, quantity) {
        if (quantity <= 0) {
            this.removeItem(productId);
        } else {
            updateCartItemQuantity(productId, quantity);
            this.render();
        }
    }

    removeItem(productId) {
        removeFromCart(productId);
        this.render();
        showToast('Item removed from cart');
    }

    goToCheckout() {
        if (getCart().length > 0) {
            window.location.href = '/checkout';
        }
    }
}

let cartSidebar;
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('cartSidebar')) {
        cartSidebar = new CartSidebar();
    }
    updateCartCount();
});
