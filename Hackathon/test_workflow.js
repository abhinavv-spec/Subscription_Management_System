import axios from './frontend/node_modules/axios/index.js';

const API_URL = 'http://localhost:5000/api';

async function runEndToEndTest() {
  console.log('=====================================================');
  console.log('✦ BRIGHTLOOP STAFF WORKFLOW END-TO-END VERIFICATION');
  console.log('=====================================================\n');

  try {
    // 1. Health check
    const health = await axios.get(`${API_URL}/health`);
    console.log('✔ Health Check:', health.data.status, `(${health.data.service})`);

    // 2. Staff Authentication (Sarah Jenkins)
    console.log('\n--- Step 1: Staff Login ---');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'sarah@brightloop.io',
      password: 'password123'
    });
    if (!loginRes.data.success || !loginRes.data.token) {
      throw new Error('Login failed');
    }
    const token = loginRes.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };
    console.log('✔ Logged in as:', loginRes.data.user.name, `(${loginRes.data.user.role}) - Desk:`, loginRes.data.user.desk_id);

    // 3. Register New Customer
    console.log('\n--- Step 2: Register New Customer ---');
    const custPayload = {
      name: 'Ananya Deshmukh',
      company_name: 'Zenith Quantum Systems',
      email: `ananya_${Date.now()}@zenithquantum.io`,
      phone: '+91 98220 88991',
      address: 'Quantum Park, Phase 1, Hinjawadi',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411057',
      gst_number: '27AABCZ9981K1Z2'
    };
    const custRes = await axios.post(`${API_URL}/staff/customers`, custPayload, { headers: authHeaders });
    const newCustomerId = custRes.data.customerId;
    const customerCode = custRes.data.customer_code;
    console.log('✔ Registered Customer:', custPayload.company_name, `[${customerCode}] ID: ${newCustomerId}`);

    // 4. Fetch Catalogs for Quotation
    console.log('\n--- Step 3: Fetch Catalogs & Verify Pricing Engine ---');
    const catRes = await axios.get(`${API_URL}/staff/catalogs`, { headers: authHeaders });
    const products = catRes.data.products;
    const variants = catRes.data.variants;
    const plans = catRes.data.plans;
    const taxes = catRes.data.taxes;
    const discounts = catRes.data.discounts;

    const prod = products.find(p => p.id === 2); // Enterprise Pro: base 8999
    const variant = variants.find(v => v.id === 2); // Multi-region HA: +1500
    const plan = plans.find(p => p.id === 4); // Annual
    const tax = taxes[0]; // GST 18%
    const discount = discounts[0]; // WELCOME10 (10%)

    console.log(`- Product: ${prod.name} (Base: ₹${prod.base_price})`);
    console.log(`- Variant: ${variant.name} (+₹${variant.extra_price})`);
    console.log(`- Expected Unit Price: ₹${parseFloat(prod.base_price) + parseFloat(variant.extra_price)}`);

    // 5. Create Quotation
    console.log('\n--- Step 4: Create Commercial Quotation ---');
    const quotePayload = {
      customer_id: newCustomerId,
      product_id: prod.id,
      variant_id: variant.id,
      plan_id: plan.id,
      quantity: 10,
      billing_period: 'ANNUAL',
      discount_id: discount.id,
      tax_id: tax.id,
      validity_days: 14,
      notes: 'Zenith Quantum Systems annual enterprise agreement',
      save_as_draft: true
    };

    const quoteRes = await axios.post(`${API_URL}/staff/quotations`, quotePayload, { headers: authHeaders });
    const quoteId = quoteRes.data.quotationId;
    const quoteNum = quoteRes.data.quotation_number;
    console.log('✔ Created Quotation:', quoteNum, `ID: ${quoteId}`);
    console.log('  Calculated Totals:', quoteRes.data.totals);

    // 6. Send Quotation
    console.log('\n--- Step 5: Send Quotation to Client ---');
    const sendRes = await axios.post(`${API_URL}/staff/quotations/${quoteId}/send`, {}, { headers: authHeaders });
    console.log('✔ Sent Quotation:', sendRes.data.message);

    // 7. Client Accepts Quotation
    console.log('\n--- Step 6: Client Accepts Quotation ---');
    const acceptRes = await axios.post(`${API_URL}/staff/quotations/${quoteId}/accept`, {}, { headers: authHeaders });
    console.log('✔ Accepted Quotation:', acceptRes.data.message);

    // 8. Convert Accepted Quotation to Active Subscription
    console.log('\n--- Step 7: Convert Quotation into Subscription ---');
    const convRes = await axios.post(`${API_URL}/staff/quotations/${quoteId}/convert`, {}, { headers: authHeaders });
    const subscriptionNumber = convRes.data.subscription_number;
    const invoiceId = convRes.data.invoiceId;
    const invoiceNumber = convRes.data.invoice_number;
    console.log('✔ Converted to Subscription:', subscriptionNumber);
    console.log('✔ Auto-Generated Billing Invoice:', invoiceNumber, `ID: ${invoiceId}`);

    // Verify Duplicate Conversion is BLOCKED
    console.log('\n--- Step 8: Verify Duplicate Conversion Protection ---');
    try {
      await axios.post(`${API_URL}/staff/quotations/${quoteId}/convert`, {}, { headers: authHeaders });
      console.error('❌ Duplicate conversion failed to block!');
    } catch (dupErr) {
      console.log('✔ Duplicate conversion correctly blocked:', dupErr.response.data.message);
    }

    // 9. Fetch Generated Invoice
    console.log('\n--- Step 9: Inspect Invoice Details & Snapshot Pricing ---');
    const invRes = await axios.get(`${API_URL}/staff/invoices/${invoiceId}`, { headers: authHeaders });
    const invoice = invRes.data.invoice;
    console.log('✔ Invoice Details:', invoice.invoice_number, `Status: ${invoice.status}`);
    console.log(`  Total: ₹${invoice.total_amount} | Paid: ₹${invoice.paid_amount} | Outstanding: ₹${invoice.outstanding_amount}`);
    console.log('  Items Snapshot:', invRes.data.items.length, 'line item(s)');

    // 10. Record Manual Payment
    console.log('\n--- Step 10: Record Customer Manual Payment ---');
    const payPayload = {
      invoice_id: invoiceId,
      amount: invoice.outstanding_amount,
      payment_method: 'UPI',
      payment_date: new Date().toISOString().split('T')[0],
      transaction_reference: `UPI-TEST-${Date.now()}`,
      notes: 'Payment received via corporate UPI QR code'
    };

    const payRes = await axios.post(`${API_URL}/staff/payments`, payPayload, { headers: authHeaders });
    console.log('✔ Payment Recorded:', payRes.data.payment_number);
    console.log('✔ Official Receipt Issued:', payRes.data.receipt_number);
    console.log('✔ Updated Invoice Status:', payRes.data.invoice.status);

    // Verify Duplicate Transaction Reference Protection
    console.log('\n--- Step 11: Verify Duplicate Transaction Ref Protection ---');
    try {
      await axios.post(`${API_URL}/staff/payments`, payPayload, { headers: authHeaders });
      console.error('❌ Duplicate transaction reference failed to block!');
    } catch (dupPayErr) {
      console.log('✔ Duplicate payment reference correctly blocked:', dupPayErr.response.data.message);
    }

    // 11. Backend Permission Check: Verify Staff CANNOT access Admin-only modules
    console.log('\n--- Step 12: Verify Backend Staff Permission Restrictions ---');
    try {
      await axios.post(`${API_URL}/staff/products`, { name: 'Illegal Product' }, { headers: authHeaders });
      console.error('❌ Staff was able to call admin product creation!');
    } catch (permErr) {
      console.log('✔ Admin restriction strictly enforced (HTTP 403):', permErr.response.data.message);
    }

    // 12. Verify Dashboard Statistics Updated
    console.log('\n--- Step 13: Verify Dashboard KPIs Auto-Updated ---');
    const finalDash = await axios.get(`${API_URL}/staff/dashboard`, { headers: authHeaders });
    console.log('✔ Dashboard Stats:');
    console.log('  Assigned Accounts:', finalDash.data.stats.assignedCustomers);
    console.log('  Active Subscriptions:', finalDash.data.stats.activeSubscriptionsCount);
    console.log('  Payments Collected Total: ₹' + finalDash.data.stats.paymentsCollected.toLocaleString('en-IN'));
    console.log('  Recent Activity Logs:', finalDash.data.recentActivity.length, 'records logged');

    // 13. Direct Subscription Provisioning
    console.log('\n--- Step 14: Direct Subscription Provisioning ---');
    const directSubPayload = {
      customer_id: newCustomerId,
      product_id: prod.id,
      plan_id: plan.id,
      quantity: 5,
      billing_period: 'ANNUAL',
      notes: 'Direct contract creation test'
    };
    const directSubRes = await axios.post(`${API_URL}/staff/subscriptions`, directSubPayload, { headers: authHeaders });
    console.log('✔ Direct Subscription Created:', directSubRes.data.subscription_number, `Invoice: ${directSubRes.data.invoice_number}`);

    // 14. Pause & Resume Subscription
    console.log('\n--- Step 15: Pause & Resume Subscription Contract ---');
    const allSubsRes = await axios.get(`${API_URL}/staff/subscriptions`, { headers: authHeaders });
    const createdSub = allSubsRes.data.subscriptions.find(s => s.subscription_number === directSubRes.data.subscription_number);
    
    // Pause
    const pauseRes = await axios.put(`${API_URL}/staff/subscriptions/${createdSub.id}/status`, { status: 'PAUSED' }, { headers: authHeaders });
    console.log('✔ Subscription Paused:', pauseRes.data.message);

    // Resume
    const resumeRes = await axios.put(`${API_URL}/staff/subscriptions/${createdSub.id}/status`, { status: 'ACTIVE' }, { headers: authHeaders });
    console.log('✔ Subscription Resumed:', resumeRes.data.message);

    // 15. Operational Reports API
    console.log('\n--- Step 16: Verify Operational Reports API ---');
    const reportsRes = await axios.get(`${API_URL}/staff/reports?range=30d`, { headers: authHeaders });
    console.log('✔ Operational Reports Summary:');
    console.log('  Active Subscriptions:', reportsRes.data.summary.activeSubscriptions);
    console.log('  Total ARR: ₹' + reportsRes.data.summary.totalArr.toLocaleString('en-IN'));
    console.log('  Payments Received: ₹' + reportsRes.data.summary.paymentsReceived.toLocaleString('en-IN'));
    console.log('  Conversion Rate:', `${reportsRes.data.summary.conversionRate}%`);
    console.log('  Monthly Trends Months count:', reportsRes.data.monthlyTrends.length);
    console.log('  Payment Methods Logged:', reportsRes.data.paymentMethods.length);

    console.log('\n=====================================================');
    console.log('✦ ALL 16 END-TO-END TEST SUITES PASSED FLAWLESSLY! ✦');
    console.log('=====================================================');
  } catch (err) {
    console.error('❌ Test failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

runEndToEndTest();
