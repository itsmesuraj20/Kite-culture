class ProductCatalog {
    constructor() {
        this.products = [];
        this.currentCategory = null;
        this.productsContainer = document.getElementById('productsGrid');
        this.loadingEl = document.getElementById('loading');
        this.dummyProducts = this.getDummyProducts();

        this.init();
    }

    getDummyProducts() {
        return [
            {
                id: 'dummy-1',
                name: 'Premium Manjha - 12 Cord',
                price: 250.00,
                variant: '1000 meters',
                stock: 100,
                image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300&fit=crop',
                category: 'manjha'
            },
            {
                id: 'dummy-2',
                name: 'Premium Manjha - 9 Cord',
                price: 200.00,
                variant: '1000 meters',
                stock: 150,
                image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300&fit=crop',
                category: 'manjha'
            },
            {
                id: 'dummy-3',
                name: 'Fighter Manjha - 6 Cord',
                price: 150.00,
                variant: '1000 meters',
                stock: 200,
                image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300&fit=crop',
                category: 'manjha'
            },
            {
                id: 'dummy-4',
                name: 'Glass Coated Manjha',
                price: 350.00,
                variant: '500 meters',
                stock: 80,
                image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300&fit=crop',
                category: 'manjha'
            },
            {
                id: 'dummy-5',
                name: 'Diamond Kite - Large',
                price: 180.00,
                variant: 'Red',
                stock: 50,
                image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
                category: 'kite'
            },
            {
                id: 'dummy-6',
                name: 'Diamond Kite - Large',
                price: 180.00,
                variant: 'Blue',
                stock: 50,
                image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
                category: 'kite'
            },
            {
                id: 'dummy-7',
                name: 'Fighter Kite - Medium',
                price: 120.00,
                variant: 'Multicolor',
                stock: 100,
                image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
                category: 'kite'
            },
            {
                id: 'dummy-8',
                name: 'Box Kite - Premium',
                price: 450.00,
                variant: 'Rainbow',
                stock: 30,
                image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
                category: 'kite'
            },
            {
                id: 'dummy-9',
                name: 'Delta Kite - Kids',
                price: 80.00,
                variant: 'Cartoon Print',
                stock: 200,
                image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
                category: 'kite'
            },
            {
                id: 'dummy-10',
                name: 'Patang Traditional',
                price: 100.00,
                variant: 'Assorted',
                stock: 300,
                image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
                category: 'kite'
            }
        ];
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
            this.hideLoading();
            this.render();
        } catch (error) {
            console.error('Failed to load products:', error);
            console.log('Using dummy products for testing...');
            this.products = this.dummyProducts;
            this.hideLoading();
            this.render();
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

    hideLoading() {
        if (this.loadingEl) this.loadingEl.style.display = 'none';
        if (this.productsContainer) this.productsContainer.style.display = 'grid';
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
