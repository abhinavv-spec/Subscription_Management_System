CREATE DATABASE IF NOT EXISTS brightloop_subscriptions;

USE brightloop_subscriptions;

-- 1. Roles
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    role_id INT NOT NULL,
    status ENUM('active', 'inactive', 'blocked')
        DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (role_id)
        REFERENCES roles(id)
);

-- 3. Customer profiles
CREATE TABLE customer_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    company_name VARCHAR(150),
    billing_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),

    FOREIGN KEY (user_id)
        REFERENCES users(id)
);

-- 4. Employee profiles
CREATE TABLE employee_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    employee_code VARCHAR(50) UNIQUE,
    department VARCHAR(100),
    designation VARCHAR(100),
    joining_date DATE,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
);

-- 5. Products
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    status ENUM('active', 'inactive')
        DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Plans
CREATE TABLE plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    billing_interval ENUM('monthly', 'yearly', 'weekly')
        NOT NULL,
    status ENUM('active', 'inactive', 'archived')
        DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id)
        REFERENCES products(id)
);

-- 7. Plan features
CREATE TABLE plan_features (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    plan_id BIGINT NOT NULL,
    feature_name VARCHAR(150) NOT NULL,
    feature_value VARCHAR(255),

    FOREIGN KEY (plan_id)
        REFERENCES plans(id)
);

-- Initial roles
INSERT INTO roles (name, description)
VALUES
('ADMIN', 'Full platform administration'),
('EMPLOYEE', 'Internal employee access'),
('CUSTOMER', 'Customer portal access');