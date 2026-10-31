-- Brightloop Subscriptions MySQL Schema
-- Hackathon Database Definition

CREATE DATABASE IF NOT EXISTS brightloop_db;
USE brightloop_db;

-- 1. Users table (Staff and Admin)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('STAFF', 'ADMIN') NOT NULL DEFAULT 'STAFF',
    department VARCHAR(100) DEFAULT 'Operations',
    desk_id VARCHAR(50) DEFAULT 'OP-BOS-402',
    tier VARCHAR(50) DEFAULT 'Enterprise Ops Tier 2',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Customers table
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    gst_number VARCHAR(30),
    outstanding_balance DECIMAL(12,2) DEFAULT 0.00,
    status ENUM('ACTIVE', 'INACTIVE', 'PROSPECT') DEFAULT 'ACTIVE',
    assigned_staff_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_staff_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Products
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) DEFAULT 'SaaS',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Product Variants
CREATE TABLE IF NOT EXISTS product_variants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    extra_price DECIMAL(10,2) DEFAULT 0.00,
    description VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 5. Subscription Plans
CREATE TABLE IF NOT EXISTS subscription_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    tier ENUM('STANDARD', 'PRO', 'DEDICATED') DEFAULT 'STANDARD',
    billing_period ENUM('MONTHLY', 'QUARTERLY', 'ANNUAL', 'MULTI_YEAR') DEFAULT 'ANNUAL',
    duration_months INT DEFAULT 12,
    plan_price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 6. Taxes (e.g. GST)
CREATE TABLE IF NOT EXISTS taxes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    rate_percent DECIMAL(5,2) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

-- 7. Discounts
CREATE TABLE IF NOT EXISTS discounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('PERCENT', 'FIXED') DEFAULT 'PERCENT',
    value DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- 8. Quotations
CREATE TABLE IF NOT EXISTS quotations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quotation_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    staff_id INT NOT NULL,
    product_id INT NOT NULL,
    variant_id INT,
    plan_id INT NOT NULL,
    quantity INT DEFAULT 1,
    billing_period VARCHAR(50) DEFAULT 'ANNUAL',
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    discount_id INT,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    tax_id INT,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    grand_total DECIMAL(12,2) NOT NULL,
    validity_date DATE NOT NULL,
    notes TEXT,
    terms TEXT,
    status ENUM('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED') DEFAULT 'DRAFT',
    is_converted BOOLEAN DEFAULT FALSE,
    converted_subscription_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (staff_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),
    FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE SET NULL,
    FOREIGN KEY (tax_id) REFERENCES taxes(id) ON DELETE SET NULL
);

-- 9. Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subscription_number VARCHAR(50) UNIQUE NOT NULL,
    quotation_id INT,
    customer_id INT NOT NULL,
    staff_id INT NOT NULL,
    product_id INT NOT NULL,
    variant_id INT,
    plan_id INT NOT NULL,
    quantity INT DEFAULT 1,
    billing_period VARCHAR(50) DEFAULT 'ANNUAL',
    amount DECIMAL(12,2) NOT NULL,
    start_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    next_billing_date DATE NOT NULL,
    status ENUM('DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'CLOSED') DEFAULT 'ACTIVE',
    renewal_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (staff_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
);

-- 10. Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    subscription_id INT,
    quotation_id INT,
    customer_id INT NOT NULL,
    staff_id INT NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(12,2) NOT NULL,
    paid_amount DECIMAL(12,2) DEFAULT 0.00,
    outstanding_amount DECIMAL(12,2) NOT NULL,
    status ENUM('DRAFT', 'CONFIRMED', 'PAID', 'CANCELLED') DEFAULT 'CONFIRMED',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
    FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (staff_id) REFERENCES users(id)
);

-- 11. Invoice Line Items (Historical Price Snapshots)
CREATE TABLE IF NOT EXISTS invoice_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    item_description VARCHAR(255) NOT NULL,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- 12. Payments
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_id INT NOT NULL,
    customer_id INT NOT NULL,
    staff_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method ENUM('UPI', 'Bank Transfer', 'Cash', 'Card', 'Other') NOT NULL,
    payment_date DATE NOT NULL,
    transaction_reference VARCHAR(100),
    notes TEXT,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (staff_id) REFERENCES users(id)
);

-- 13. Operational Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT,
    staff_name VARCHAR(100),
    action_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_reference VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE SET NULL
);

