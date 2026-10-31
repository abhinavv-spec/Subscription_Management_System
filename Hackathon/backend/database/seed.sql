-- Brightloop Subscriptions Initial Seed Data
USE brightloop_db;

-- 1. Users (Staff and Admin)
INSERT INTO users (id, name, email, password, role, department, desk_id, tier) VALUES
(1, 'Sarah Jenkins', 'sarah@brightloop.io', '$2a$10$/SUCGpfbonKrlWgiv4Zn0OVdn9Cd8TieOLoOmzzPn09Yq/bCps0d6', 'STAFF', 'Commercial Operations', 'OP-BOS-402', 'Enterprise Ops Tier 2'),
(2, 'Alexander Vance', 'admin@brightloop.io', '$2a$10$/SUCGpfbonKrlWgiv4Zn0OVdn9Cd8TieOLoOmzzPn09Yq/bCps0d6', 'ADMIN', 'Executive Management', 'HQ-EXEC-01', 'System Administrator');

-- 2. Products
INSERT INTO products (id, code, name, description, base_price, category, is_active) VALUES
(1, 'PROD-CORE', 'Brightloop Cloud Core', 'Core recurring billing and customer lifecycle management engine', 4999.00, 'SaaS Platform', 1),
(2, 'PROD-ENT', 'Brightloop Enterprise Pro', 'Advanced subscription orchestration, custom invoicing and multi-tier SLAs', 8999.00, 'Enterprise Suite', 1),
(3, 'PROD-ULTRA', 'Brightloop Ultra Dedicated', 'Dedicated high-performance cluster with 99.99% uptime guarantee and white-glove onboarding', 14999.00, 'Infrastructure', 1);

-- 3. Product Variants
INSERT INTO product_variants (id, product_id, name, extra_price, description, is_active) VALUES
(1, 1, 'Standard Single-Region', 0.00, 'Standard cloud deployment in Mumbai data center', 1),
(2, 2, 'Multi-Region High Availability', 1500.00, 'Dual-region sync across Mumbai and Hyderabad nodes', 1),
(3, 2, 'Dedicated VPC & Hardware Security', 3000.00, 'Isolated network VPC with dedicated HSM encryption', 1),
(4, 3, '24/7 Dedicated SRE Support', 5000.00, 'Direct access to named site reliability engineer', 1);

-- 4. Subscription Plans
INSERT INTO subscription_plans (id, product_id, name, tier, billing_period, duration_months, plan_price, is_active) VALUES
(1, 1, 'Standard Monthly', 'STANDARD', 'MONTHLY', 1, 4999.00, 1),
(2, 1, 'Standard Annual', 'STANDARD', 'ANNUAL', 12, 53988.00, 1),
(3, 2, 'Enterprise Pro Monthly', 'PRO', 'MONTHLY', 1, 8999.00, 1),
(4, 2, 'Enterprise Pro Annual', 'PRO', 'ANNUAL', 12, 97188.00, 1),
(5, 3, 'Ultra SLA Annual', 'DEDICATED', 'ANNUAL', 12, 161988.00, 1),
(6, 2, 'Enterprise Multi-Year (24 Mo)', 'PRO', 'MULTI_YEAR', 24, 184000.00, 1);

-- 5. Taxes (GST)
INSERT INTO taxes (id, name, rate_percent, is_default, is_active) VALUES
(1, 'GST (18%)', 18.00, 1, 1),
(2, 'Concessional GST (5%)', 5.00, 0, 1),
(3, 'Exempt / Zero Rated (0%)', 0.00, 0, 1);

-- 6. Discounts
INSERT INTO discounts (id, code, name, type, value, is_active) VALUES
(1, 'WELCOME10', 'New Customer Welcome (10%)', 'PERCENT', 10.00, 1),
(2, 'SUMMER20', 'Mid-Year Growth Incentive (20%)', 'PERCENT', 20.00, 1),
(3, 'ENTERPRISE5000', 'Enterprise Flat Rebate (₹5,000)', 'FIXED', 5000.00, 1);

-- 7. Customers
INSERT INTO customers (id, customer_code, name, company_name, email, phone, address, city, state, pincode, gst_number, outstanding_balance, status, assigned_staff_id) VALUES
(1, 'CUST-NT-102', 'Rajiv Nair', 'Nexus Technologies Pvt Ltd', 'rajiv@nexustech.in', '+91 98450 12345', '74/1 Outer Ring Road, Bellandur', 'Bengaluru', 'Karnataka', '560103', '29AABCN1234E1Z5', 0.00, 'ACTIVE', 1),
(2, 'CUST-CV-204', 'Priya Sharma', 'CloudVibe Digital Solutions', 'priya@cloudvibe.com', '+91 99801 88776', '12th Floor, Express Towers, Nariman Point', 'Mumbai', 'Maharashtra', '400021', '27AABCC5678F1ZQ', 24500.00, 'ACTIVE', 1),
(3, 'CUST-AD-884', 'Amit Verma', 'Apex Digital Infotech', 'amit@apexdigital.in', '+91 97123 45678', 'Plot 42, Sector 18, Udyog Vihar', 'Gurugram', 'Haryana', '122015', '06AABCA9012G1Z3', 0.00, 'ACTIVE', 1),
(4, 'CUST-VS-501', 'Sunita Rao', 'Vertex Systems Private Limited', 'sunita@vertexsys.co.in', '+91 98860 54321', 'HITEC City Phase 2, Madhapur', 'Hyderabad', 'Telangana', '500081', '36AABCV3456H1Z9', 18450.00, 'ACTIVE', 1),
(5, 'CUST-HC-339', 'Vikram Patel', 'Helios Cloud Labs', 'vikram@helioslabs.io', '+91 91234 56789', 'E-Park, Baner Pashan Link Road', 'Pune', 'Maharashtra', '411045', '27AABCH7890J1Z2', 0.00, 'ACTIVE', 1);

-- 8. Existing Quotations
INSERT INTO quotations (id, quotation_number, customer_id, staff_id, product_id, variant_id, plan_id, quantity, billing_period, unit_price, subtotal, discount_id, discount_amount, tax_id, tax_amount, grand_total, validity_date, notes, terms, status, is_converted, converted_subscription_id) VALUES
(1, 'QT-2024-001', 1, 1, 2, 2, 4, 5, 'ANNUAL', 10499.00, 52495.00, 1, 5249.50, 1, 8504.19, 55749.69, DATE_ADD(CURRENT_DATE, INTERVAL 14 DAY), 'Includes multi-region HA configuration and premium SLA.', 'Standard Net-30 payment terms. Validity: 14 days.', 'SENT', 0, NULL),
(2, 'QT-2024-002', 3, 1, 1, 1, 2, 10, 'ANNUAL', 4999.00, 49990.00, 2, 9998.00, 1, 7198.56, 47190.56, DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY), 'Team growth quote with 20% discount approval.', 'Advance payment required. Validity: 7 days.', 'DRAFT', 0, NULL),
(3, 'QT-2024-003', 5, 1, 3, 4, 5, 2, 'ANNUAL', 19999.00, 39998.00, 3, 5000.00, 1, 6299.64, 41297.64, DATE_ADD(CURRENT_DATE, INTERVAL 21 DAY), 'Ultra dedicated cluster with 24/7 SRE coverage.', 'Subject to MSA execution.', 'ACCEPTED', 0, NULL);

-- 9. Existing Subscriptions
INSERT INTO subscriptions (id, subscription_number, quotation_id, customer_id, staff_id, product_id, variant_id, plan_id, quantity, billing_period, amount, start_date, expiry_date, next_billing_date, status, renewal_count) VALUES
(1, 'SUB-2024-001', NULL, 1, 1, 2, 2, 4, 5, 'ANNUAL', 55749.69, DATE_SUB(CURRENT_DATE, INTERVAL 60 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 305 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 305 DAY), 'ACTIVE', 0),
(2, 'SUB-2024-002', NULL, 2, 1, 1, 1, 1, 8, 'MONTHLY', 24500.00, DATE_SUB(CURRENT_DATE, INTERVAL 35 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 330 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 5 DAY), 'ACTIVE', 1),
(3, 'SUB-2024-003', NULL, 4, 1, 2, 3, 4, 2, 'ANNUAL', 18450.00, DATE_SUB(CURRENT_DATE, INTERVAL 90 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 275 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 12 DAY), 'ACTIVE', 0);

-- 10. Existing Invoices
INSERT INTO invoices (id, invoice_number, subscription_id, quotation_id, customer_id, staff_id, invoice_date, due_date, subtotal, discount_amount, tax_amount, total_amount, paid_amount, outstanding_amount, status, notes) VALUES
(1, 'INV-2024-001', 1, NULL, 1, 1, DATE_SUB(CURRENT_DATE, INTERVAL 60 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY), 52495.00, 5249.50, 8504.19, 55749.69, 55749.69, 0.00, 'PAID', 'Annual subscription initial billing - Paid via NEFT.'),
(2, 'INV-2024-002', 2, NULL, 2, 1, DATE_SUB(CURRENT_DATE, INTERVAL 35 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 5 DAY), 23000.00, 2300.00, 3800.00, 24500.00, 0.00, 24500.00, 'CONFIRMED', 'Monthly recurrent bill - Overdue by 5 days.'),
(3, 'INV-2024-003', 3, NULL, 4, 1, DATE_SUB(CURRENT_DATE, INTERVAL 42 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 12 DAY), 17000.00, 1700.00, 3150.00, 18450.00, 0.00, 18450.00, 'CONFIRMED', 'Annual subscription billing - Overdue by 12 days.');

-- 11. Invoice Items
INSERT INTO invoice_items (id, invoice_id, item_description, quantity, unit_price, subtotal, discount_amount, tax_amount, total_amount) VALUES
(1, 1, 'Brightloop Enterprise Pro (5 Seats - Annual)', 5, 10499.00, 52495.00, 5249.50, 8504.19, 55749.69),
(2, 2, 'Brightloop Cloud Core (8 Seats - Monthly)', 8, 2875.00, 23000.00, 2300.00, 3800.00, 24500.00),
(3, 3, 'Brightloop Enterprise Pro (2 Seats - Annual)', 2, 8500.00, 17000.00, 1700.00, 3150.00, 18450.00);

-- 12. Payments
INSERT INTO payments (id, payment_number, invoice_id, customer_id, staff_id, amount, payment_method, payment_date, transaction_reference, notes, receipt_number) VALUES
(1, 'PAY-2024-001', 1, 1, 1, 55749.69, 'Bank Transfer', DATE_SUB(CURRENT_DATE, INTERVAL 32 DAY), 'NEFT-HDFC-99281923', 'Full annual settlement verified by accounts', 'REC-2024-001');

-- 13. Activity Logs
INSERT INTO activity_logs (id, staff_id, staff_name, action_type, entity_type, entity_reference, description, created_at) VALUES
(1, 1, 'Sarah Jenkins', 'CUSTOMER_REGISTER', 'CUSTOMER', 'CUST-HC-339', 'Registered new customer Helios Cloud Labs', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 1, 'Sarah Jenkins', 'QUOTATION_CREATE', 'QUOTATION', 'QT-2024-003', 'Created quotation QT-2024-003 for Helios Cloud Labs', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 1, 'Sarah Jenkins', 'QUOTATION_SEND', 'QUOTATION', 'QT-2024-001', 'Dispatched commercial proposal QT-2024-001 to Rajiv Nair (Nexus Tech)', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(4, 1, 'Sarah Jenkins', 'PAYMENT_RECORD', 'PAYMENT', 'PAY-2024-001', 'Recorded manual payment of ₹55,749.69 for Invoice INV-2024-001', DATE_SUB(NOW(), INTERVAL 2 HOUR));

