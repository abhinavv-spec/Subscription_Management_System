import db from '../config/db.js';

// ==========================================
// 1. DASHBOARD & OPERATIONAL QUEUE
// ==========================================
export const getDashboardStats = async (req, res) => {
  try {
    const staffId = req.user.id;
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Total Customers
    const [custRows] = await db.query('SELECT COUNT(*) as count FROM customers');
    const totalCustomers = custRows[0]?.count || 0;

    // Assigned Customers
    const [assignedRows] = await db.query('SELECT COUNT(*) as count FROM customers WHERE assigned_staff_id = ?', [staffId]);
    const assignedCustomers = assignedRows[0]?.count || totalCustomers;

    // 2. Pending Quotations (DRAFT + SENT)
    const [pendingQuotes] = await db.query('SELECT COUNT(*) as count FROM quotations WHERE status IN (?, ?)', ['DRAFT', 'SENT']);
    const pendingQuotationsCount = pendingQuotes[0]?.count || 0;

    // 3. Accepted Quotations (Ready for conversion)
    const [acceptedQuotes] = await db.query('SELECT COUNT(*) as count FROM quotations WHERE status = ? AND is_converted = 0', ['ACCEPTED']);
    const acceptedQuotationsCount = acceptedQuotes[0]?.count || 0;

    // 4. Active Subscriptions
    const [activeSubs] = await db.query('SELECT COUNT(*) as count FROM subscriptions WHERE status = ?', ['ACTIVE']);
    const activeSubscriptionsCount = activeSubs[0]?.count || 0;

    // 5. Unpaid Invoices
    const [unpaidInvoices] = await db.query('SELECT COUNT(*) as count, SUM(outstanding_amount) as total_due FROM invoices WHERE status = ? AND outstanding_amount > 0', ['CONFIRMED']);
    const unpaidInvoicesCount = unpaidInvoices[0]?.count || 0;
    const totalDueAmount = unpaidInvoices[0]?.total_due || 0;

    // Overdue Invoices
    const [allUnpaid] = await db.query('SELECT * FROM invoices WHERE status = ? AND outstanding_amount > 0', ['CONFIRMED']);
    const overdueList = (allUnpaid || []).filter(i => i.due_date && i.due_date < todayStr);
    const overdueInvoicesCount = overdueList.length;

    // 6. Payments Collected
    const [payments] = await db.query('SELECT COUNT(*) as count, SUM(amount) as total_collected FROM payments');
    const paymentsCount = payments[0]?.count || 0;
    const paymentsCollected = payments[0]?.total_collected || 0;

    // 7. Recent Activities Count
    const [actCountRows] = await db.query('SELECT COUNT(*) as count FROM activity_logs');
    const recentActivitiesCount = actCountRows[0]?.count || 0;

    // Pending Tasks requiring staff attention:
    // A) Quotations SENT awaiting client acceptance
    const [sentQuotes] = await db.query(
      `SELECT q.id, q.quotation_number as ref_no, 'QUOTATION' as record_type, q.grand_total as amount, q.status, q.validity_date as due_date, c.company_name as customer_name
       FROM quotations q
       JOIN customers c ON q.customer_id = c.id
       WHERE q.status = 'SENT'
       ORDER BY q.validity_date ASC LIMIT 5`
    );

    // B) Overdue Invoices
    const [overdueInvoices] = await db.query(
      `SELECT i.id, i.invoice_number as ref_no, 'INVOICE' as record_type, i.outstanding_amount as amount, i.status, i.due_date, c.company_name as customer_name
       FROM invoices i
       JOIN customers c ON i.customer_id = c.id
       WHERE i.status = 'CONFIRMED' AND i.outstanding_amount > 0
       ORDER BY i.due_date ASC LIMIT 5`
    );

    // C) Upcoming Subscription Renewals (within 30 days)
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);
    const in30DaysStr = in30Days.toISOString().split('T')[0];

    const [allActiveSubs] = await db.query(
      `SELECT s.id, s.subscription_number as ref_no, 'SUBSCRIPTION' as record_type, s.amount, s.status, s.next_billing_date as due_date, c.company_name as customer_name
       FROM subscriptions s
       JOIN customers c ON s.customer_id = c.id
       WHERE s.status = 'ACTIVE'
       ORDER BY s.next_billing_date ASC`
    );
    const renewalSubs = (allActiveSubs || []).filter(s => s.due_date && s.due_date <= in30DaysStr).slice(0, 5);

    // Exact category counts for Pending Tasks
    const [sentCountRows] = await db.query("SELECT COUNT(*) as count FROM quotations WHERE status = 'SENT'");
    const quotationsAwaitingResponseCount = sentCountRows[0]?.count || sentQuotes.length;

    const [renewalsCountRows] = await db.query("SELECT COUNT(*) as count FROM subscriptions WHERE status = 'ACTIVE' AND next_billing_date <= ?", [in30DaysStr]);
    const upcomingRenewalsCount = renewalsCountRows[0]?.count || renewalSubs.length;

    // Pending Tasks combined list
    const pendingTasks = [
      ...sentQuotes.map(q => ({
        id: q.id,
        type: 'QUOTATION',
        title: `Quotation awaiting response: ${q.ref_no}`,
        customer_name: q.customer_name,
        ref_no: q.ref_no,
        amount: q.amount,
        due_date: q.due_date,
        status: q.status,
        actionLabel: 'Follow Up'
      })),
      ...overdueList.slice(0, 5).map(inv => ({
        id: inv.id,
        type: 'INVOICE',
        title: `Invoice overdue: ${inv.invoice_number}`,
        customer_name: inv.company_name || 'Client Account',
        ref_no: inv.invoice_number,
        amount: inv.outstanding_amount,
        due_date: inv.due_date,
        status: 'OVERDUE',
        actionLabel: 'Collect Payment'
      })),
      ...renewalSubs.map(sub => ({
        id: sub.id,
        type: 'RENEWAL',
        title: `Subscription renewal approaching: ${sub.ref_no}`,
        customer_name: sub.customer_name,
        ref_no: sub.ref_no,
        amount: sub.amount,
        due_date: sub.due_date,
        status: sub.status,
        actionLabel: 'Review Renewal'
      }))
    ];

    // Action Queue for backward compatibility
    const actionQueue = pendingTasks;

    // Recent Activity by this Staff
    const [recentActivity] = await db.query(
      'SELECT * FROM activity_logs ORDER BY id DESC LIMIT 10'
    );

    return res.status(200).json({
      success: true,
      stats: {
        totalCustomers,
        assignedCustomers,
        activeSubscriptionsCount,
        pendingQuotationsCount,
        acceptedQuotationsCount,
        unpaidInvoicesCount,
        overdueInvoicesCount,
        quotationsAwaitingResponseCount,
        upcomingRenewalsCount,
        recentActivitiesCount,
        totalDueAmount: parseFloat(totalDueAmount),
        paymentsCount,
        paymentsCollected: parseFloat(paymentsCollected)
      },
      pendingTasks,
      actionQueue,
      recentActivity
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. CUSTOMER MANAGEMENT
// ==========================================
export const getCustomers = async (req, res) => {
  try {
    const { search = '', status = '' } = req.query;
    let sql = 'SELECT * FROM customers WHERE 1=1';
    const params = [];

    if (status && status !== 'ALL') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR company_name LIKE ? OR email LIKE ? OR customer_code LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    sql += ' ORDER BY id DESC';

    const [customers] = await db.query(sql, params);

    // Attach active subscription count for each customer
    const [subs] = await db.query('SELECT customer_id, COUNT(*) as active_subs FROM subscriptions WHERE status = "ACTIVE" GROUP BY customer_id');
    const subMap = {};
    (subs || []).forEach(s => { subMap[s.customer_id] = s.active_subs; });

    const enriched = customers.map(c => ({
      ...c,
      active_subscriptions: subMap[c.id] || 0
    }));

    return res.status(200).json({ success: true, customers: enriched });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const [customers] = await db.query('SELECT * FROM customers WHERE id = ?', [id]);
    if (!customers || customers.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const customer = customers[0];

    // Customer 360 Relations
    const [subscriptions] = await db.query(
      `SELECT s.*, p.name as product_name, pv.name as variant_name, sp.name as plan_name
       FROM subscriptions s
       LEFT JOIN products p ON s.product_id = p.id
       LEFT JOIN product_variants pv ON s.variant_id = pv.id
       LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
       WHERE s.customer_id = ? ORDER BY s.id DESC`,
      [id]
    );
    const [quotations] = await db.query('SELECT * FROM quotations WHERE customer_id = ? ORDER BY id DESC', [id]);
    const [invoices] = await db.query('SELECT * FROM invoices WHERE customer_id = ? ORDER BY id DESC', [id]);
    const [payments] = await db.query('SELECT * FROM payments WHERE customer_id = ? ORDER BY id DESC', [id]);
    const [activity] = await db.query('SELECT * FROM activity_logs WHERE entity_type = "CUSTOMER" AND entity_reference = ? ORDER BY id DESC', [customer.customer_code]);

    return res.status(200).json({
      success: true,
      customer,
      subscriptions,
      quotations,
      invoices,
      payments,
      activity
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const registerCustomer = async (req, res) => {
  try {
    const { name, company_name, email, phone, address, city, state, pincode, gst_number } = req.body;

    if (!name || !company_name || !email || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: 'Name, company name, email, phone, and address are required fields.'
      });
    }

    // Check existing email
    const [existing] = await db.query('SELECT id FROM customers WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing && existing.length > 0) {
      return res.status(400).json({ success: false, message: 'A customer with this email address already exists.' });
    }

    // Auto-generate customer code: CUST-XXX
    const [countRows] = await db.query('SELECT COUNT(*) as cnt FROM customers');
    const codeSeq = (countRows[0]?.cnt || 0) + 1;
    const customer_code = `CUST-${company_name.substring(0, 2).toUpperCase()}-${100 + codeSeq}`;

    const [result] = await db.query(
      `INSERT INTO customers (customer_code, name, company_name, email, phone, address, city, state, pincode, gst_number, outstanding_balance, status, assigned_staff_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.00, 'ACTIVE', ?)`,
      [customer_code, name, company_name, email.trim().toLowerCase(), phone, address, city || '', state || '', pincode || '', gst_number || '', req.user.id]
    );

    // Log operational activity
    await db.query(
      `INSERT INTO activity_logs (staff_id, staff_name, action_type, entity_type, entity_reference, description)
       VALUES (?, ?, 'CUSTOMER_REGISTER', 'CUSTOMER', ?, ?)`,
      [req.user.id, req.user.name, customer_code, `Registered new client account: ${company_name} (${name})`]
    );

    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully.',
      customerId: result.insertId,
      customer_code
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, company_name, phone, address, city, state, pincode, gst_number, status } = req.body;

    const [existing] = await db.query('SELECT * FROM customers WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    await db.query(
      `UPDATE customers
       SET name = ?, company_name = ?, phone = ?, address = ?, city = ?, state = ?, pincode = ?, gst_number = ?, status = ?
       WHERE id = ?`,
      [name, company_name, phone, address, city, state, pincode, gst_number, status || 'ACTIVE', id]
    );

    await db.query(
      `INSERT INTO activity_logs (staff_id, staff_name, action_type, entity_type, entity_reference, description)
       VALUES (?, ?, 'CUSTOMER_UPDATE', 'CUSTOMER', ?, ?)`,
      [req.user.id, req.user.name, existing[0].customer_code, `Updated client details for ${company_name}`]
    );

    return res.status(200).json({ success: true, message: 'Customer information updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. QUOTATION MANAGEMENT & PRICING ENGINE
// ==========================================
export const getQuotations = async (req, res) => {
  try {
    const { status = '', search = '' } = req.query;
    let sql = `
      SELECT q.*, c.name as customer_name, c.company_name, c.email as customer_email,
             p.name as product_name, pv.name as variant_name, sp.name as plan_name,
             u.name as staff_name
      FROM quotations q
      LEFT JOIN customers c ON q.customer_id = c.id
      LEFT JOIN products p ON q.product_id = p.id
      LEFT JOIN product_variants pv ON q.variant_id = pv.id
      LEFT JOIN subscription_plans sp ON q.plan_id = sp.id
      LEFT JOIN users u ON q.staff_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'ALL') {
      sql += ' AND q.status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (q.quotation_number LIKE ? OR c.company_name LIKE ? OR c.name LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    sql += ' ORDER BY q.id DESC';

    const [rows] = await db.query(sql, params);
    return res.status(200).json({ success: true, quotations: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getQuotationById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT q.*, c.name as customer_name, c.company_name, c.email as customer_email, c.phone as customer_phone, c.address as customer_address, c.gst_number,
              p.name as product_name, p.code as product_code, pv.name as variant_name, sp.name as plan_name, sp.tier as plan_tier,
              d.code as discount_code, d.name as discount_name, t.name as tax_name, t.rate_percent as tax_rate,
              u.name as staff_name, u.email as staff_email
       FROM quotations q
       LEFT JOIN customers c ON q.customer_id = c.id
       LEFT JOIN products p ON q.product_id = p.id
       LEFT JOIN product_variants pv ON q.variant_id = pv.id
       LEFT JOIN subscription_plans sp ON q.plan_id = sp.id
       LEFT JOIN discounts d ON q.discount_id = d.id
       LEFT JOIN taxes t ON q.tax_id = t.id
       LEFT JOIN users u ON q.staff_id = u.id
       WHERE q.id = ?`,
      [id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Quotation not found.' });
    }

    return res.status(200).json({ success: true, quotation: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Automatic Server-Side Pricing Engine
// Unit price = Product sales price + Variant extra price
// Subtotal = Unit price × Quantity
// Apply eligible discounts
// Tax = Taxable amount × Tax rate
// Grand Total = Subtotal - Discount + Tax
export const createQuotation = async (req, res) => {
  try {
    const {
      customer_id,
      product_id,
      variant_id,
      plan_id,
      quantity = 1,
      billing_period = 'ANNUAL',
      discount_id = null,
      tax_id = null,
      validity_days = 14,
      notes = '',
      terms = 'Standard Net-30 payment terms. Software licenses governed by Brightloop Master Services Agreement.',
      save_as_draft = false
    } = req.body;

    if (!customer_id || !product_id || !plan_id) {
      return res.status(400).json({
        success: false,
        message: 'Customer, product, and subscription plan are mandatory.'
      });
    }

    // 1. Fetch Product
    const [products] = await db.query('SELECT * FROM products WHERE id = ?', [product_id]);
    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid product selected.' });
    }
    const product = products[0];

    // 2. Fetch Variant
    let variantExtraPrice = 0;
    if (variant_id) {
      const [variants] = await db.query('SELECT * FROM product_variants WHERE id = ?', [variant_id]);
      if (variants && variants.length > 0) {
        variantExtraPrice = parseFloat(variants[0].extra_price || 0);
      }
    }

    // 3. Unit price calculation
    const basePrice = parseFloat(product.base_price || 0);
    const unitPrice = basePrice + variantExtraPrice;
    const qty = parseInt(quantity, 10) || 1;
    const subtotal = unitPrice * qty;

    // 4. Calculate Discount
    let discountAmount = 0;
    if (discount_id) {
      const [discounts] = await db.query('SELECT * FROM discounts WHERE id = ? AND is_active = 1', [discount_id]);
      if (discounts && discounts.length > 0) {
        const disc = discounts[0];
        if (disc.type === 'PERCENT') {
          discountAmount = (subtotal * parseFloat(disc.value)) / 100;
        } else {
          discountAmount = Math.min(subtotal, parseFloat(disc.value));
        }
      }
    }

    const taxableAmount = Math.max(0, subtotal - discountAmount);

    // 5. Calculate Tax
    let taxAmount = 0;
    let effectiveTaxId = tax_id;
    if (!effectiveTaxId) {
      const [defaultTax] = await db.query('SELECT id, rate_percent FROM taxes WHERE is_default = 1 LIMIT 1');
      if (defaultTax && defaultTax.length > 0) {
        effectiveTaxId = defaultTax[0].id;
        taxAmount = (taxableAmount * parseFloat(defaultTax[0].rate_percent)) / 100;
      }
    } else {
      const [taxes] = await db.query('SELECT rate_percent FROM taxes WHERE id = ?', [effectiveTaxId]);
      if (taxes && taxes.length > 0) {
        taxAmount = (taxableAmount * parseFloat(taxes[0].rate_percent)) / 100;
      }
    }

    // 6. Grand Total
    const grandTotal = taxableAmount + taxAmount;

    // Generate Quotation Number QT-YYYY-XXX
    const [cntRows] = await db.query('SELECT COUNT(*) as cnt FROM quotations');
    const quoteCount = (cntRows[0]?.cnt || 0) + 1;
    const year = new Date().getFullYear();
    const quotation_number = `QT-${year}-${String(quoteCount).padStart(3, '0')}`;

    // Validity date
    const valDate = new Date();
    valDate.setDate(valDate.getDate() + (parseInt(validity_days, 10) || 14));
    const validity_date = valDate.toISOString().split('T')[0];

    const initialStatus = save_as_draft ? 'DRAFT' : 'SENT';

    const [result] = await db.query(
      `INSERT INTO quotations (quotation_number, customer_id, staff_id, product_id, variant_id, plan_id, quantity, billing_period, unit_price, subtotal, discount_id, discount_amount, tax_id, tax_amount, grand_total, validity_date, notes, terms, status, is_converted)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        quotation_number,
        customer_id,
        req.user.id,
        product_id,
        variant_id || null,
        plan_id,
        qty,
        billing_period,
        unitPrice.toFixed(2),
        subtotal.toFixed(2),
        discount_id || null,
        discountAmount.toFixed(2),
        effectiveTaxId || null,
        taxAmount.toFixed(2),
        grandTotal.toFixed(2),
        validity_date,
        notes,
        terms,
        initialStatus
      ]
    );

    // Activity Log
    await db.query(
      `INSERT INTO activity_logs (staff_id, staff_name, action_type, entity_type, entity_reference, description)
       VALUES (?, ?, 'QUOTATION_CREATE', 'QUOTATION', ?, ?)`,
      [req.user.id, req.user.name, quotation_number, `Created commercial quotation ${quotation_number} with total ₹${grandTotal.toFixed(2)} (${initialStatus})`]
    );

    return res.status(201).json({
      success: true,
      message: `Quotation ${quotation_number} created successfully.`,
      quotationId: result.insertId,
      quotation_number,
      totals: {
        unitPrice,
        subtotal,
        discountAmount,
        taxAmount,
        grandTotal
      }
    });
  } catch (error) {
    console.error('createQuotation error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const sendQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const [quotes] = await db.query('SELECT * FROM quotations WHERE id = ?', [id]);
    if (!quotes || quotes.length === 0) {
      return res.status(404).json({ success: false, message: 'Quotation not found.' });
    }

    const quote = quotes[0];
    if (quote.status === 'ACCEPTED' || quote.status === 'EXPIRED') {
      return res.status(400).json({ success: false, message: `Cannot dispatch quotation with status ${quote.status}.` });
    }

    await db.query('UPDATE quotations SET status = ? WHERE id = ?', ['SENT', id]);

    await db.query(
      `INSERT INTO activity_logs (staff_id, staff_name, action_type, entity_type, entity_reference, description)
       VALUES (?, ?, 'QUOTATION_SEND', 'QUOTATION', ?, ?)`,
      [req.user.id, req.user.name, quote.quotation_number, `Dispatched commercial quotation ${quote.quotation_number} to customer`]
    );

    return res.status(200).json({ success: true, message: `Quotation ${quote.quotation_number} marked as SENT.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const [quotes] = await db.query('SELECT * FROM quotations WHERE id = ?', [id]);
    if (!quotes || quotes.length === 0) {
      return res.status(404).json({ success: false, message: 'Quotation not found.' });
    }
    const quote = quotes[0];

    await db.query('UPDATE quotations SET status = ? WHERE id = ?', ['ACCEPTED', id]);

    await db.query(
      `INSERT INTO activity_logs (staff_id, staff_name, action_type, entity_type, entity_reference, description)
       VALUES (?, ?, 'QUOTATION_ACCEPT', 'QUOTATION', ?, ?)`,
      [req.user.id, req.user.name, quote.quotation_number, `Quotation ${quote.quotation_number} marked as ACCEPTED by client`]
    );

    return res.status(200).json({ success: true, message: `Quotation ${quote.quotation_number} accepted.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const [quotes] = await db.query('SELECT * FROM quotations WHERE id = ?', [id]);
    if (!quotes || quotes.length === 0) {
      return res.status(404).json({ success: false, message: 'Quotation not found.' });
    }
    const quote = quotes[0];

    await db.query('UPDATE quotations SET status = ? WHERE id = ?', ['REJECTED', id]);

    await db.query(
      `INSERT INTO activity_logs (staff_id, staff_name, action_type, entity_type, entity_reference, description)
       VALUES (?, ?, 'QUOTATION_REJECT', 'QUOTATION', ?, ?)`,
      [req.user.id, req.user.name, quote.quotation_number, `Quotation ${quote.quotation_number} marked as REJECTED`]
    );

    return res.status(200).json({ success: true, message: `Quotation ${quote.quotation_number} rejected.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Convert Accepted Quotation to Active Subscription
// "A quotation must not automatically become a subscription just because it is created.
// Only an accepted quotation can be converted into a subscription. Prevent duplicate conversions."
export const convertQuotationToSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const [quotes] = await db.query('SELECT * FROM quotations WHERE id = ?', [id]);
    if (!quotes || quotes.length === 0) {
      return res.status(404).json({ success: false, message: 'Quotation not found.' });
    }

    const quote = quotes[0];

    if (quote.status !== 'ACCEPTED') {
      return res.status(400).json({
        success: false,
        message: 'Only an ACCEPTED quotation can be converted into a subscription.'
      });
    }

    if (quote.is_converted) {
      return res.status(400).json({
        success: false,
        message: `Quotation has already been converted to Subscription #SUB-${quote.converted_subscription_id}. Duplicate conversions are strictly prohibited.`
      });
    }

    // 1. Calculate Start, Expiry, and Next Billing Dates
    const startDate = new Date();
    const expiryDate = new Date();
    const durationMonths = quote.billing_period === 'MONTHLY' ? 1 : (quote.billing_period === 'QUARTERLY' ? 3 : (quote.billing_period === 'MULTI_YEAR' ? 24 : 12));
    expiryDate.setMonth(expiryDate.getMonth() + durationMonths);

    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + (quote.billing_period === 'MONTHLY' ? 1 : durationMonths));

    // Generate Subscription Number
    const [subCntRows] = await db.query('SELECT COUNT(*) as cnt FROM subscriptions');
    const subCount = (subCntRows[0]?.cnt || 0) + 1;
    const year = new Date().getFullYear();
    const subscription_number = `SUB-${year}-${String(subCount).padStart(3, '0')}`;

    // 2. Insert Subscription
    const [subResult] = await db.query(
      `INSERT INTO subscriptions (subscription_number, quotation_id, customer_id, staff_id, product_id, variant_id, plan_id, quantity, billing_period, amount, start_date, expiry_date, next_billing_date, status, renewal_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', 0)`,
      [
        subscription_number,
        quote.id,
        quote.customer_id,
        req.user.id,
        quote.product_id,
        quote.variant_id,
        quote.plan_id,
        quote.quantity,
        quote.billing_period,
        quote.grand_total,
        startDate.toISOString().split('T')[0],
        expiryDate.toISOString().split('T')[0],
        nextBillingDate.toISOString().split('T')[0]
      ]
    );

    const newSubId = subResult.insertId;

    // 3. Mark Quotation as Converted
    await db.query(
      'UPDATE quotations SET is_converted = 1, converted_subscription_id = ? WHERE id = ?',
      [newSubId, quote.id]
    );

    // 4. Automatically generate initial Invoice for this subscription
    const [invCntRows] = await db.query('SELECT COUNT(*) as cnt FROM invoices');
    const invCount = (invCntRows[0]?.cnt || 0) + 1;
    const invoice_number = `INV-${year}-${String(invCount).padStart(3, '0')}`;

    const invoiceDate = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30-day term
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const [invResult] = await db.query(
      `INSERT INTO invoices (invoice_number, subscription_id, quotation_id, customer_id, staff_id, invoice_date, due_date, subtotal, discount_amount, tax_amount, total_amount, paid_amount, outstanding_amount, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoice_number,
        newSubId,
        quote.id,
        quote.customer_id,
        req.user.id,
        invoiceDate,
        dueDateStr,
        quote.subtotal,
        quote.discount_amount,
        quote.tax_amount,
        quote.grand_total,
        0.00,
        quote.grand_total,
        'CONFIRMED',
        `Generated from converted quotation ${quote.quotation_number}`
      ]
    );

    const newInvoiceId = invResult.insertId;

    // 5. Store snapshot item in invoice_items
    const [products] = await db.query('SELECT name FROM products WHERE id = ?', [quote.product_id]);
    const prodName = products[0]?.name || 'Brightloop License';
    await db.query(
      `INSERT INTO invoice_items (invoice_id, item_description, quantity, unit_price, subtotal, discount_amount, tax_amount, total_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newInvoiceId,
        `${prodName} (${quote.quantity} seats - ${quote.billing_period})`,
        quote.quantity,
        quote.unit_price,
        quote.subtotal,
        quote.discount_amount,
        quote.tax_amount,
        quote.grand_total
      ]
    );

    // 6. Update customer outstanding balance
    await db.query(
      'UPDATE customers SET outstanding_balance = outstanding_balance + ? WHERE id = ?',
      [quote.grand_total, quote.customer_id]
    );

    // 7. Activity Log
    await db.query(
      `INSERT INTO activity_logs (staff_id, staff_name, action_type, entity_type, entity_reference, description)
       VALUES (?, ?, 'SUBSCRIPTION_CONVERT', 'SUBSCRIPTION', ?, ?)`,
      [
        req.user.id,
        req.user.name,
        subscription_number,
        `Converted quotation ${quote.quotation_number} into active subscription ${subscription_number} and issued Invoice ${invoice_number}`
      ]
    );

    return res.status(200).json({
      success: true,
      message: `Quotation converted successfully! Subscription ${subscription_number} and Invoice ${invoice_number} created.`,
      subscriptionId: newSubId,
      subscription_number,
      invoiceId: newInvoiceId,
      invoice_number
    });
  } catch (error) {
    console.error('convertQuotationToSubscription error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 4. SUBSCRIPTION MANAGEMENT
// ==========================================
export const getSubscriptions = async (req, res) => {
  try {
    const { status = '', search = '' } = req.query;
    let sql = `
      SELECT s.*, c.name as customer_name, c.company_name, c.email as customer_email,
             p.name as product_name, pv.name as variant_name, sp.name as plan_name,
             u.name as staff_name
      FROM subscriptions s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN products p ON s.product_id = p.id
      LEFT JOIN product_variants pv ON s.variant_id = pv.id
      LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
      LEFT JOIN users u ON s.staff_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'ALL') {
      sql += ' AND s.status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (s.subscription_number LIKE ? OR c.company_name LIKE ? OR c.name LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    sql += ' ORDER BY s.id DESC';

    const [rows] = await db.query(sql, params);
    return res.status(200).json({ success: true, subscriptions: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const [subs] = await db.query(
      `SELECT s.*, c.name as customer_name, c.company_name, c.email as customer_email, c.phone as customer_phone, c.address as customer_address,
              p.name as product_name, p.code as product_code, pv.name as variant_name, sp.name as plan_name, sp.tier as plan_tier,
              u.name as staff_name
       FROM subscriptions s
       LEFT JOIN customers c ON s.customer_id = c.id
       LEFT JOIN products p ON s.product_id = p.id
       LEFT JOIN product_variants pv ON s.variant_id = pv.id
       LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
       LEFT JOIN users u ON s.staff_id = u.id
       WHERE s.id = ?`,
      [id]
    );

    if (!subs || subs.length === 0) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    const subscription = subs[0];
    const [invoices] = await db.query('SELECT * FROM invoices WHERE subscription_id = ? ORDER BY id DESC', [id]);

    return res.status(200).json({ success: true, subscription, invoices });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createSubscription = async (req, res) => {
  try {
    const {
      customer_id,
      product_id,
      plan_id,
      variant_id = null,
      quantity = 1,
      billing_period = 'ANNUAL',
      start_date,
      notes = ''
    } = req.body;

    if (!customer_id || !product_id || !plan_id) {
      return res.status(400).json({ success: false, message: 'Please provide customer, product, and plan.' });
    }

    const [custs] = await db.query('SELECT * FROM customers WHERE id = ?', [customer_id]);
    if (!custs || custs.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }
    const customer = custs[0];

    const [prods] = await db.query('SELECT * FROM products WHERE id = ?', [product_id]);
    const product = prods[0];
    const [plans] = await db.query('SELECT * FROM subscription_plans WHERE id = ?', [plan_id]);
    const plan = plans[0];

    let variantPrice = 0;
    if (variant_id) {
      const [vars] = await db.query('SELECT * FROM product_variants WHERE id = ?', [variant_id]);
      if (vars && vars.length > 0) {
        variantPrice = parseFloat(vars[0].extra_price || 0);
      }
    }

    const basePrice = parseFloat(product?.base_price || plan?.plan_price || 4999);
    const unitPrice = basePrice + variantPrice;
    const qty = parseInt(quantity, 10) || 1;
    const totalAmount = unitPrice * qty;

    const startDate = start_date ? new Date(start_date) : new Date();
    const expiryDate = new Date(startDate);
    const months = billing_period === 'MONTHLY' ? 1 : (billing_period === 'QUARTERLY' ? 3 : (billing_period === 'MULTI_YEAR' ? 24 : 12));
    expiryDate.setMonth(expiryDate.getMonth() + months);

    const year = new Date().getFullYear();
    const [subCntRows] = await db.query('SELECT COUNT(*) as cnt FROM subscriptions');
    const subCount = (subCntRows[0]?.cnt || 0) + 1;
    const subscription_number = `SUB-${year}-${String(subCount).padStart(3, '0')}`;

    const [subResult] = await db.query(
      `INSERT INTO subscriptions (subscription_number, quotation_id, customer_id, staff_id, product_id, variant_id, plan_id, quantity, billing_period, amount, start_date, expiry_date, next_billing_date, status)
       VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      [
        subscription_number,
        customer.id,
        req.user.id,
        product_id,
        variant_id,
        plan_id,
        qty,
        billing_period,
        totalAmount,
        startDate.toISOString().split('T')[0],
        expiryDate.toISOString().split('T')[0],
        expiryDate.toISOString().split('T')[0]
      ]
    );

    const newSubId = subResult.insertId;

    // Generate initial invoice
    const [invCntRows] = await db.query('SELECT COUNT(*) as cnt FROM invoices');
    const invCount = (invCntRows[0]?.cnt || 0) + 1;
    const invoice_number = `INV-${year}-${String(invCount).padStart(3, '0')}`;

    const invoiceDate = startDate.toISOString().split('T')[0];
    const dueDate = new Date(startDate);
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    await db.query(
      `INSERT INTO invoices (invoice_number, subscription_id, quotation_id, customer_id, staff_id, invoice_date, due_date, subtotal, discount_amount, tax_amount, total_amount, paid_amount, outstanding_amount, status, notes)
       VALUES (?, ?, NULL, ?, ?, ?, ?, ?, 0.00, 0.00, ?, 0.00, ?, 'CONFIRMED', ?)`,
      [
        invoice_number,
        newSubId,
        customer.id,
        req.user.id,
        invoiceDate,
        dueDateStr,
        totalAmount,
        totalAmount,
        totalAmount,
        notes || `Subscription initial invoice for ${subscription_number}`
      ]
    );

    await db.query(
      'UPDATE customers SET outstanding_balance = outstanding_balance + ? WHERE id = ?',
      [totalAmount, customer.id]
    );

    await db.query(
      `INSERT INTO activity_logs (staff_id, staff_name, action_type, entity_type, entity_reference, description)
       VALUES (?, ?, 'SUBSCRIPTION_CREATE', 'SUBSCRIPTION', ?, ?)`,
      [req.user.id, req.user.name, subscription_number, `Created subscription ${subscription_number} for ${customer.company_name}`]
    );

    return res.status(201).json({
      success: true,
      message: `Subscription ${subscription_number} created successfully.`,
      subscription_number,
      invoice_number
    });
  } catch (error) {
    console.error('createSubscription error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSubscriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'PAUSED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid subscription status.' });
    }

    const [subs] = await db.query('SELECT * FROM subscriptions WHERE id = ?', [id]);
    if (!subs || subs.length === 0) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    const currentSub = subs[0];
    if (currentSub.status === 'CLOSED' && status !== 'CLOSED') {
      return res.status(400).json({ success: false, message: 'A CLOSED subscription contract cannot be directly reactivated.' });
    }

    await db.query('UPDATE subscriptions SET status = ? WHERE id = ?', [status, id]);

    await db.query(
      `INSERT INTO activity_logs (staff_id, staff_name, action_type, entity_type, entity_reference, description)
       VALUES (?, ?, 'SUBSCRIPTION_STATUS_CHANGE', 'SUBSCRIPTION', ?, ?)`,
      [req.user.id, req.user.name, currentSub.subscription_number, `Updated status to ${status} for subscription ${currentSub.subscription_number}`]
    );

    return res.status(200).json({ success: true, message: `Subscription status updated to ${status}.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 5. INVOICE MANAGEMENT
// ==========================================
export const getInvoices = async (req, res) => {
  try {
    const { status = '', search = '' } = req.query;
    let sql = `
      SELECT i.*, c.name as customer_name, c.company_name, c.email as customer_email,
             s.subscription_number, u.name as staff_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN subscriptions s ON i.subscription_id = s.id
      LEFT JOIN users u ON i.staff_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'ALL') {
      sql += ' AND i.status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (i.invoice_number LIKE ? OR c.company_name LIKE ? OR c.name LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    sql += ' ORDER BY i.id DESC';

    const [rows] = await db.query(sql, params);

    // Calculate days overdue for invoices
    const now = new Date();
    const enriched = rows.map(inv => {
      const dueDate = new Date(inv.due_date);
      const isPastDue = now > dueDate && inv.outstanding_amount > 0 && inv.status === 'CONFIRMED';
      const daysOverdue = isPastDue ? Math.floor((now - dueDate) / (1000 * 60 * 60 * 24)) : 0;
      return {
        ...inv,
        isPastDue,
        daysOverdue
      };
    });

    return res.status(200).json({ success: true, invoices: enriched });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const [invs] = await db.query(
      `SELECT i.*, c.name as customer_name, c.company_name, c.email as customer_email, c.phone as customer_phone, c.address as customer_address, c.gst_number,
              s.subscription_number, u.name as staff_name, u.email as staff_email
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id
       LEFT JOIN subscriptions s ON i.subscription_id = s.id
       LEFT JOIN users u ON i.staff_id = u.id
       WHERE i.id = ?`,
      [id]
    );

    if (!invs || invs.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    const invoice = invs[0];
    const [items] = await db.query('SELECT * FROM invoice_items WHERE invoice_id = ?', [id]);
    const [payments] = await db.query('SELECT * FROM payments WHERE invoice_id = ? ORDER BY id DESC', [id]);

    return res.status(200).json({ success: true, invoice, items, payments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const confirmInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const [invs] = await db.query('SELECT * FROM invoices WHERE id = ?', [id]);
    if (!invs || invs.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    const inv = invs[0];
    if (inv.status !== 'DRAFT') {
      return res.status(400).json({ success: false, message: 'Only DRAFT invoices can be confirmed.' });
    }

    await db.query('UPDATE invoices SET status = ? WHERE id = ?', ['CONFIRMED', id]);

    await db.query(
      `INSERT INTO activity_logs (staff_id, staff_name, action_type, entity_type, entity_reference, description)
       VALUES (?, ?, 'INVOICE_CONFIRM', 'INVOICE', ?, ?)`,
      [req.user.id, req.user.name, inv.invoice_number, `Confirmed invoice ${inv.invoice_number} for customer billing`]
    );

    return res.status(200).json({ success: true, message: `Invoice ${inv.invoice_number} confirmed.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const [invs] = await db.query('SELECT * FROM invoices WHERE id = ?', [id]);
    if (!invs || invs.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    const inv = invs[0];
    if (inv.status === 'PAID') {
      return res.status(400).json({ success: false, message: 'Cannot cancel an invoice that has already been fully paid.' });
    }

    await db.query('UPDATE invoices SET status = ?, outstanding_amount = ? WHERE id = ?', ['CANCELLED', 0.00, id]);

    // Deduct remaining outstanding amount from customer balance
    const [custRows] = await db.query('SELECT outstanding_balance FROM customers WHERE id = ?', [inv.customer_id]);
    const currentBal = custRows && custRows.length > 0 ? parseFloat(custRows[0].outstanding_balance || 0) : 0;
    const newBal = Math.max(0, currentBal - parseFloat(inv.outstanding_amount));
    await db.query(
      'UPDATE customers SET outstanding_balance = ? WHERE id = ?',
      [newBal.toFixed(2), inv.customer_id]
    );

    await db.query(
      `INSERT INTO activity_logs (staff_id, staff_name, action_type, entity_type, entity_reference, description)
       VALUES (?, ?, 'INVOICE_CANCEL', 'INVOICE', ?, ?)`,
      [req.user.id, req.user.name, inv.invoice_number, `Cancelled invoice ${inv.invoice_number}`]
    );

    return res.status(200).json({ success: true, message: `Invoice ${inv.invoice_number} cancelled.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 6. PAYMENT MANAGEMENT
// ==========================================
export const getPayments = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, i.invoice_number, i.total_amount as invoice_total, c.name as customer_name, c.company_name, u.name as staff_name
       FROM payments p
       LEFT JOIN invoices i ON p.invoice_id = i.id
       LEFT JOIN customers c ON p.customer_id = c.id
       LEFT JOIN users u ON p.staff_id = u.id
       ORDER BY p.id DESC`
    );
    return res.status(200).json({ success: true, payments: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const recordPayment = async (req, res) => {
  try {
    const {
      invoice_id,
      amount,
      payment_method,
      payment_date,
      transaction_reference,
      notes = ''
    } = req.body;

    if (!invoice_id || !amount || !payment_method) {
      return res.status(400).json({
        success: false,
        message: 'Invoice ID, payment amount, and payment method are required.'
      });
    }

    const payAmount = parseFloat(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero.' });
    }

    // 1. Fetch Invoice
    const [invoices] = await db.query('SELECT * FROM invoices WHERE id = ?', [invoice_id]);
    if (!invoices || invoices.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    const invoice = invoices[0];
    if (invoice.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Cannot record payment for a cancelled invoice.' });
    }

    if (invoice.outstanding_amount <= 0 || invoice.status === 'PAID') {
      return res.status(400).json({ success: false, message: 'This invoice has already been fully settled.' });
    }

    if (payAmount > parseFloat(invoice.outstanding_amount)) {
      return res.status(400).json({
        success: false,
        message: `Payment amount (₹${payAmount}) cannot exceed outstanding invoice balance (₹${invoice.outstanding_amount}).`
      });
    }

    // 2. Prevent duplicate transaction reference if provided
    if (transaction_reference && transaction_reference.trim() !== '') {
      const [dups] = await db.query('SELECT id FROM payments WHERE transaction_reference = ?', [transaction_reference.trim()]);
      if (dups && dups.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Transaction reference '${transaction_reference}' has already been recorded. Duplicate payments are not allowed.`
        });
      }
    }

    // 3. Generate Payment and Receipt Numbers
    const [payCntRows] = await db.query('SELECT COUNT(*) as cnt FROM payments');
    const payCount = (payCntRows[0]?.cnt || 0) + 1;
    const year = new Date().getFullYear();
    const payment_number = `PAY-${year}-${String(payCount).padStart(3, '0')}`;
    const receipt_number = `REC-${year}-${String(payCount).padStart(3, '0')}`;
    const payDate = payment_date || new Date().toISOString().split('T')[0];

    // 4. Insert Payment record
    const [result] = await db.query(
      `INSERT INTO payments (payment_number, invoice_id, customer_id, staff_id, amount, payment_method, payment_date, transaction_reference, notes, receipt_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payment_number,
        invoice.id,
        invoice.customer_id,
        req.user.id,
        payAmount.toFixed(2),
        payment_method,
        payDate,
        transaction_reference ? transaction_reference.trim() : null,
        notes,
        receipt_number
      ]
    );

    // 5. Update Invoice paid_amount and outstanding_amount
    const newPaidAmount = parseFloat(invoice.paid_amount || 0) + payAmount;
    const newOutstandingAmount = Math.max(0, parseFloat(invoice.total_amount) - newPaidAmount);
    // Never mark invoice paid unless its recorded payments cover the invoice total!
    const newStatus = newOutstandingAmount <= 0.01 ? 'PAID' : 'CONFIRMED';

    await db.query(
      'UPDATE invoices SET paid_amount = ?, outstanding_amount = ?, status = ? WHERE id = ?',
      [newPaidAmount.toFixed(2), newOutstandingAmount.toFixed(2), newStatus, invoice.id]
    );

    // 6. Update Customer outstanding balance
    const [custRows] = await db.query('SELECT outstanding_balance FROM customers WHERE id = ?', [invoice.customer_id]);
    const currentBal = custRows && custRows.length > 0 ? parseFloat(custRows[0].outstanding_balance || 0) : 0;
    const newBal = Math.max(0, currentBal - payAmount);
    await db.query(
      'UPDATE customers SET outstanding_balance = ? WHERE id = ?',
      [newBal.toFixed(2), invoice.customer_id]
    );

    // 7. Activity Log
    await db.query(
      `INSERT INTO activity_logs (staff_id, staff_name, action_type, entity_type, entity_reference, description)
       VALUES (?, ?, 'PAYMENT_RECORD', 'PAYMENT', ?, ?)`,
      [
        req.user.id,
        req.user.name,
        payment_number,
        `Recorded manual payment of ₹${payAmount.toFixed(2)} via ${payment_method} for Invoice ${invoice.invoice_number} (Receipt ${receipt_number})`
      ]
    );

    return res.status(201).json({
      success: true,
      message: `Payment ${payment_number} recorded successfully. Receipt ${receipt_number} issued.`,
      paymentId: result.insertId,
      payment_number,
      receipt_number,
      invoice: {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        paid_amount: newPaidAmount,
        outstanding_amount: newOutstandingAmount,
        status: newStatus
      }
    });
  } catch (error) {
    console.error('recordPayment error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 7. OVERDUE INVOICE FOLLOW-UP
// ==========================================
export const getOverdueInvoices = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT i.*, c.name as customer_name, c.company_name, c.email as customer_email, c.phone as customer_phone
       FROM invoices i
       JOIN customers c ON i.customer_id = c.id
       WHERE i.status = 'CONFIRMED' AND i.outstanding_amount > 0
       ORDER BY i.due_date ASC`
    );

    const now = new Date();
    const categories = {
      under7Days: [],
      under30Days: [],
      over30Days: []
    };

    rows.forEach(inv => {
      const dueDate = new Date(inv.due_date);
      const daysOverdue = Math.max(0, Math.floor((now - dueDate) / (1000 * 60 * 60 * 24)));
      const reminderText = `Hello ${inv.customer_name}, this is a friendly reminder that invoice ${inv.invoice_number} for ₹${parseFloat(inv.outstanding_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} is pending. Kindly complete the payment at your earliest convenience. Thank you, Brightloop.`;

      const item = {
        ...inv,
        daysOverdue,
        reminderText
      };

      if (daysOverdue <= 7) {
        categories.under7Days.push(item);
      } else if (daysOverdue <= 30) {
        categories.under30Days.push(item);
      } else {
        categories.over30Days.push(item);
      }
    });

    return res.status(200).json({
      success: true,
      categories,
      totalOverdueCount: rows.length
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 8. ACTIVITY LOGS
// ==========================================
export const getActivityLogs = async (req, res) => {
  try {
    const { action_type = '', search = '' } = req.query;
    let sql = 'SELECT * FROM activity_logs WHERE 1=1';
    const params = [];

    if (action_type && action_type !== 'ALL') {
      sql += ' AND action_type = ?';
      params.push(action_type);
    }

    if (search) {
      sql += ' AND (description LIKE ? OR entity_reference LIKE ? OR staff_name LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    sql += ' ORDER BY id DESC LIMIT 100';

    const [rows] = await db.query(sql, params);
    return res.status(200).json({ success: true, activities: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 9. READ-ONLY CATALOGS (FOR QUOTATION BUILDER)
// ==========================================
export const getCatalogData = async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM products WHERE is_active = 1 ORDER BY base_price ASC');
    const [variants] = await db.query('SELECT * FROM product_variants WHERE is_active = 1 ORDER BY extra_price ASC');
    const [plans] = await db.query('SELECT * FROM subscription_plans WHERE is_active = 1 ORDER BY plan_price ASC');
    const [taxes] = await db.query('SELECT * FROM taxes WHERE is_active = 1');
    const [discounts] = await db.query('SELECT * FROM discounts WHERE is_active = 1');

    return res.status(200).json({
      success: true,
      products,
      variants,
      plans,
      taxes,
      discounts
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 10. OPERATIONAL REPORTS
// ==========================================
export const getReportsData = async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Calculate startDate filter based on range
    let startDateFilter = null;
    if (range === '7d') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      startDateFilter = d.toISOString().split('T')[0];
    } else if (range === '30d') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      startDateFilter = d.toISOString().split('T')[0];
    } else if (range === 'quarter') {
      const d = new Date();
      d.setMonth(d.getMonth() - 3);
      startDateFilter = d.toISOString().split('T')[0];
    } else if (range === 'ytd') {
      startDateFilter = `${today.getFullYear()}-01-01`;
    }

    // 1. Core Summary Metrics
    const [activeSubsRows] = await db.query('SELECT COUNT(*) as count, SUM(amount) as total_arr FROM subscriptions WHERE status = ?', ['ACTIVE']);
    const activeSubscriptions = activeSubsRows[0]?.count || 0;
    const totalArr = activeSubsRows[0]?.total_arr || 0;

    let paymentsSql = 'SELECT COUNT(*) as count, SUM(amount) as total_collected FROM payments';
    let paymentsParams = [];
    if (startDateFilter) {
      paymentsSql += ' WHERE payment_date >= ?';
      paymentsParams.push(startDateFilter);
    }
    const [paymentsRows] = await db.query(paymentsSql, paymentsParams);
    const paymentsReceived = paymentsRows[0]?.total_collected || 0;
    const paymentsCount = paymentsRows[0]?.count || 0;

    const [unpaidInvRows] = await db.query('SELECT COUNT(*) as count, SUM(outstanding_amount) as total_outstanding FROM invoices WHERE status = ? AND outstanding_amount > 0', ['CONFIRMED']);
    const outstandingInvoicesAmount = unpaidInvRows[0]?.total_outstanding || 0;
    const outstandingInvoicesCount = unpaidInvRows[0]?.count || 0;

    const [allUnpaid] = await db.query('SELECT * FROM invoices WHERE status = ? AND outstanding_amount > 0', ['CONFIRMED']);
    const overdueList = (allUnpaid || []).filter(i => i.due_date && i.due_date < todayStr);
    const overdueInvoicesCount = overdueList.length;
    const overdueInvoicesAmount = overdueList.reduce((sum, i) => sum + parseFloat(i.outstanding_amount || 0), 0);

    // Upcoming renewals in next 30 days
    const next30Days = new Date();
    next30Days.setDate(next30Days.getDate() + 30);
    const next30DaysStr = next30Days.toISOString().split('T')[0];

    const [allSubs] = await db.query('SELECT s.*, c.company_name, c.name as customer_name FROM subscriptions s LEFT JOIN customers c ON s.customer_id = c.id WHERE s.status = ?', ['ACTIVE']);
    const upcomingRenewalsList = (allSubs || []).filter(s => {
      const dateToCheck = s.next_billing_date || s.expiry_date;
      return dateToCheck && dateToCheck >= todayStr && dateToCheck <= next30DaysStr;
    });
    const upcomingRenewalsCount = upcomingRenewalsList.length;

    // 2. Monthly Trend Data (Last 6 Months: Billed vs Collected)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthLabel = d.toLocaleString('en-US', { month: 'short' });
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyTrends.push({
        month: monthLabel,
        yearMonth,
        billed: 0,
        collected: 0
      });
    }

    const [invRows] = await db.query('SELECT invoice_date, total_amount FROM invoices WHERE status != ?', ['CANCELLED']);
    (invRows || []).forEach(inv => {
      if (inv.invoice_date) {
        const ym = String(inv.invoice_date).substring(0, 7);
        const match = monthlyTrends.find(m => m.yearMonth === ym);
        if (match) {
          match.billed += parseFloat(inv.total_amount || 0);
        }
      }
    });

    const [allPayRows] = await db.query('SELECT payment_date, amount FROM payments');
    (allPayRows || []).forEach(p => {
      if (p.payment_date) {
        const ym = String(p.payment_date).substring(0, 7);
        const match = monthlyTrends.find(m => m.yearMonth === ym);
        if (match) {
          match.collected += parseFloat(p.amount || 0);
        }
      }
    });

    // 3. Payment Methods Breakdown
    const [pmRows] = await db.query('SELECT payment_method, COUNT(*) as count, SUM(amount) as total FROM payments GROUP BY payment_method');
    const paymentMethods = (pmRows || []).map(r => ({
      name: r.payment_method || 'Other',
      value: parseFloat(r.total || 0),
      count: r.count
    }));

    // 4. Subscription Status Distribution
    const [subStatusRows] = await db.query('SELECT status, COUNT(*) as count FROM subscriptions GROUP BY status');
    const subscriptionStatusDist = (subStatusRows || []).map(r => ({
      status: r.status,
      count: r.count
    }));

    // 5. Quotation Conversion Rate
    const [quoteTotal] = await db.query('SELECT COUNT(*) as count FROM quotations');
    const [quoteConverted] = await db.query('SELECT COUNT(*) as count FROM quotations WHERE is_converted = 1');
    const totalQuotes = quoteTotal[0]?.count || 0;
    const convertedQuotes = quoteConverted[0]?.count || 0;
    const conversionRate = totalQuotes > 0 ? Math.round((convertedQuotes / totalQuotes) * 100) : 0;

    return res.status(200).json({
      success: true,
      summary: {
        activeSubscriptions,
        totalArr,
        paymentsReceived,
        paymentsCount,
        outstandingInvoicesAmount,
        outstandingInvoicesCount,
        overdueInvoicesCount,
        overdueInvoicesAmount,
        upcomingRenewalsCount,
        conversionRate,
        totalQuotes,
        convertedQuotes
      },
      monthlyTrends,
      paymentMethods,
      subscriptionStatusDist,
      upcomingRenewals: upcomingRenewalsList.slice(0, 10),
      overdueInvoices: overdueList.slice(0, 10)
    });
  } catch (error) {
    console.error('getReportsData error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
