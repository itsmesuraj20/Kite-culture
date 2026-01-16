-- Database Schema for Kite Culture E-commerce

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    variant VARCHAR(100),
    stock INTEGER NOT NULL DEFAULT 0,
    image VARCHAR(500),
    category VARCHAR(50) NOT NULL CHECK (category IN ('manjha', 'kite')),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_mobile VARCHAR(15) NOT NULL,
    customer_address TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'INITIATED' CHECK (status IN ('INITIATED', 'PAID', 'FAILED', 'DISPATCHED', 'DELIVERED', 'CANCELLED')),
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    dispatch_status VARCHAR(50),
    dispatch_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    product_variant VARCHAR(100),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin users table
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- WhatsApp message logs
CREATE TABLE whatsapp_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    phone_number VARCHAR(15) NOT NULL,
    message_type VARCHAR(50) NOT NULL,
    template_name VARCHAR(100),
    status VARCHAR(20),
    whatsapp_message_id VARCHAR(100),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_id ON orders(order_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed data for products
INSERT INTO products (name, price, variant, stock, image, category, description) VALUES
('Premium Manjha - 12 Cord', 250.00, '1000 meters', 100, '/images/manjha-12-cord.jpg', 'manjha', 'High quality 12 cord manjha, perfect for competitive kite flying'),
('Premium Manjha - 9 Cord', 200.00, '1000 meters', 150, '/images/manjha-9-cord.jpg', 'manjha', 'Premium 9 cord manjha for smooth cutting'),
('Fighter Manjha - 6 Cord', 150.00, '1000 meters', 200, '/images/manjha-6-cord.jpg', 'manjha', 'Standard 6 cord manjha for beginners'),
('Glass Coated Manjha', 350.00, '500 meters', 80, '/images/glass-manjha.jpg', 'manjha', 'Extra sharp glass coated manjha'),
('Diamond Kite - Large', 180.00, 'Red', 50, '/images/kite-diamond-red.jpg', 'kite', 'Traditional diamond shaped kite, large size'),
('Diamond Kite - Large', 180.00, 'Blue', 50, '/images/kite-diamond-blue.jpg', 'kite', 'Traditional diamond shaped kite, large size'),
('Fighter Kite - Medium', 120.00, 'Multicolor', 100, '/images/kite-fighter.jpg', 'kite', 'Professional fighter kite for competitions'),
('Box Kite - Premium', 450.00, 'Rainbow', 30, '/images/kite-box.jpg', 'kite', 'Premium box kite with stable flight'),
('Delta Kite - Kids', 80.00, 'Cartoon Print', 200, '/images/kite-delta-kids.jpg', 'kite', 'Easy to fly delta kite for children'),
('Patang Traditional', 100.00, 'Assorted', 300, '/images/kite-patang.jpg', 'kite', 'Traditional Indian patang in assorted colors');
