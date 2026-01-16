class ProductCatalog {
    constructor() {
        this.products = [];
        this.currentCategory = null;
        this.productsContainer = document.getElementById('productsGrid');
        this.loadingEl = document.getElementById('loading');

        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadProducts();
    }

    bindEvents() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category || null;
                this.filterByCategory(category);
                
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    async loadProducts() {
        try {
            this.showLoading();
            const response = await apiRequest('/products');
            this.products = response.data;
            this.render();
        } catch (error) {
            console.error('Failed to load products:', error);
            this.showError('Failed to load products. Please refresh the page.');
        }
    }

    filterByCategory(category) {
        this.currentCategory = category;
        this.render();
    }

    getFilteredProducts() {
        if (!this.currentCategory) return this.products;
        return this.products.filter(p => p.category === this.currentCategory);
    }

    render() {
        const filtered = this.getFilteredProducts();

        if (filtered.length === 0) {
            this.productsContainer.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <p>No products found</p>
                </div>
            `;
            return;
        }

        this.productsContainer.innerHTML = filtered.map(product => `
            <div class="product-card">
                <img src="${product.image || '/images/placeholder.jpg'}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-variant">${product.variant || ''}</p>
                    <p class="product-price">${formatCurrency(product.price)}</p>
                    <p class="product-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                        ${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </p>
                    ${product.stock > 0 ? `
                        <div class="quantity-selector">
                            <button class="qty-btn" onclick="catalog.decrementQty('${product.id}')">−</button>
                            <input type="number" class="qty-input" id="qty-${product.id}" value="1" min="1" max="${product.stock}">
                            <button class="qty-btn" onclick="catalog.incrementQty('${product.id}', ${product.stock})">+</button>
                        </div>
                        <button class="btn btn-primary btn-block" onclick="catalog.addToCart('${product.id}')">
                            Add to Cart
                        </button>
                    ` : `
                        <button class="btn btn-primary btn-block" disabled>
                            Out of Stock
                        </button>
                    `}
                </div>
            </div>
        `).join('');
    }

    incrementQty(productId, maxStock) {
        const input = document.getElementById(`qty-${productId}`);
        if (parseInt(input.value) < maxStock) {
            input.value = parseInt(input.value) + 1;
        }
    }

    decrementQty(productId) {
        const input = document.getElementById(`qty-${productId}`);
        if (parseInt(input.value) > 1) {
            input.value = parseInt(input.value) - 1;
        }
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        const quantity = parseInt(document.getElementById(`qty-${productId}`).value);

        if (product && quantity > 0) {
            addToCart(product, quantity);
        }
    }

    showLoading() {
        if (this.loadingEl) this.loadingEl.style.display = 'block';
        if (this.productsContainer) this.productsContainer.style.display = 'none';
    }

    showError(message) {
        if (this.loadingEl) this.loadingEl.style.display = 'none';
        if (this.productsContainer) {
            this.productsContainer.style.display = 'block';
            this.productsContainer.innerHTML = `
                <div class="alert alert-error" style="grid-column: 1/-1;">
                    ${message}
                </div>
            `;
        }
    }
}

let catalog;
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('productsGrid')) {
        catalog = new ProductCatalog();
    }
});
