import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.join(__dirname, '../database/local_store.json');

// Default initial state matching seed.sql
const initialData = {
  users: [
    {
      id: 1,
      name: 'Sarah Jenkins',
      email: 'sarah@brightloop.io',
      password: '$2a$10$/SUCGpfbonKrlWgiv4Zn0OVdn9Cd8TieOLoOmzzPn09Yq/bCps0d6',
      role: 'STAFF',
      department: 'Commercial Operations',
      desk_id: 'OP-BOS-402',
      tier: 'Enterprise Ops Tier 2',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Alexander Vance',
      email: 'admin@brightloop.io',
      password: '$2a$10$/SUCGpfbonKrlWgiv4Zn0OVdn9Cd8TieOLoOmzzPn09Yq/bCps0d6',
      role: 'ADMIN',
      department: 'Executive Management',
      desk_id: 'HQ-EXEC-01',
      tier: 'System Administrator',
      created_at: new Date().toISOString()
    }
  ],
  customers: [
    {
      id: 1,
      customer_code: 'CUST-NT-102',
      name: 'Rajiv Nair',
      company_name: 'Nexus Technologies Pvt Ltd',
      email: 'rajiv@nexustech.in',
      phone: '+91 98450 12345',
      address: '74/1 Outer Ring Road, Bellandur',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103',
      gst_number: '29AABCN1234E1Z5',
      outstanding_balance: 0.00,
      status: 'ACTIVE',
      assigned_staff_id: 1,
      created_at: '2024-03-15T10:00:00Z',
      updated_at: '2024-03-15T10:00:00Z'
    },
    {
      id: 2,
      customer_code: 'CUST-CV-204',
      name: 'Priya Sharma',
      company_name: 'CloudVibe Digital Solutions',
      email: 'priya@cloudvibe.com',
      phone: '+91 99801 88776',
      address: '12th Floor, Express Towers, Nariman Point',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400021',
      gst_number: '27AABCC5678F1ZQ',
      outstanding_balance: 24500.00,
      status: 'ACTIVE',
      assigned_staff_id: 1,
      created_at: '2024-04-10T11:30:00Z',
      updated_at: '2024-04-10T11:30:00Z'
    },
    {
      id: 3,
      customer_code: 'CUST-AD-884',
      name: 'Amit Verma',
      company_name: 'Apex Digital Infotech',
      email: 'amit@apexdigital.in',
      phone: '+91 97123 45678',
      address: 'Plot 42, Sector 18, Udyog Vihar',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122015',
      gst_number: '06AABCA9012G1Z3',
      outstanding_balance: 0.00,
      status: 'ACTIVE',
      assigned_staff_id: 1,
      created_at: '2024-05-01T09:15:00Z',
      updated_at: '2024-05-01T09:15:00Z'
    },
    {
      id: 4,
      customer_code: 'CUST-VS-501',
      name: 'Sunita Rao',
      company_name: 'Vertex Systems Private Limited',
      email: 'sunita@vertexsys.co.in',
      phone: '+91 98860 54321',
      address: 'HITEC City Phase 2, Madhapur',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500081',
      gst_number: '36AABCV3456H1Z9',
      outstanding_balance: 18450.00,
      status: 'ACTIVE',
      assigned_staff_id: 1,
      created_at: '2024-05-20T14:45:00Z',
      updated_at: '2024-05-20T14:45:00Z'
    },
    {
      id: 5,
      customer_code: 'CUST-HC-339',
      name: 'Vikram Patel',
      company_name: 'Helios Cloud Labs',
      email: 'vikram@helioslabs.io',
      phone: '+91 91234 56789',
      address: 'E-Park, Baner Pashan Link Road',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411045',
      gst_number: '27AABCH7890J1Z2',
      outstanding_balance: 0.00,
      status: 'ACTIVE',
      assigned_staff_id: 1,
      created_at: '2024-06-05T16:20:00Z',
      updated_at: '2024-06-05T16:20:00Z'
    }
  ],
  products: [
    {
      id: 1,
      code: 'PROD-CORE',
      name: 'Brightloop Cloud Core',
      description: 'Core recurring billing and customer lifecycle management engine',
      base_price: 4999.00,
      category: 'SaaS Platform',
      is_active: 1,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      code: 'PROD-ENT',
      name: 'Brightloop Enterprise Pro',
      description: 'Advanced subscription orchestration, custom invoicing and multi-tier SLAs',
      base_price: 8999.00,
      category: 'Enterprise Suite',
      is_active: 1,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 3,
      code: 'PROD-ULTRA',
      name: 'Brightloop Ultra Dedicated',
      description: 'Dedicated high-performance cluster with 99.99% uptime guarantee and white-glove onboarding',
      base_price: 14999.00,
      category: 'Infrastructure',
      is_active: 1,
      created_at: '2024-01-01T00:00:00Z'
    }
  ],
  product_variants: [
    {
      id: 1,
      product_id: 1,
      name: 'Standard Single-Region',
      extra_price: 0.00,
      description: 'Standard cloud deployment in Mumbai data center',
      is_active: 1
    },
    {
      id: 2,
      product_id: 2,
      name: 'Multi-Region High Availability',
      extra_price: 1500.00,
      description: 'Dual-region sync across Mumbai and Hyderabad nodes',
      is_active: 1
    },
    {
      id: 3,
      product_id: 2,
      name: 'Dedicated VPC & Hardware Security',
      extra_price: 3000.00,
      description: 'Isolated network VPC with dedicated HSM encryption',
      is_active: 1
    },
    {
      id: 4,
      product_id: 3,
      name: '24/7 Dedicated SRE Support',
      extra_price: 5000.00,
      description: 'Direct access to named site reliability engineer',
      is_active: 1
    }
  ],
  subscription_plans: [
    {
      id: 1,
      product_id: 1,
      name: 'Standard Monthly',
      tier: 'STANDARD',
      billing_period: 'MONTHLY',
      duration_months: 1,
      plan_price: 4999.00,
      is_active: 1
    },
    {
      id: 2,
      product_id: 1,
      name: 'Standard Annual',
      tier: 'STANDARD',
      billing_period: 'ANNUAL',
      duration_months: 12,
      plan_price: 53988.00,
      is_active: 1
    },
    {
      id: 3,
      product_id: 2,
      name: 'Enterprise Pro Monthly',
      tier: 'PRO',
      billing_period: 'MONTHLY',
      duration_months: 1,
      plan_price: 8999.00,
      is_active: 1
    },
    {
      id: 4,
      product_id: 2,
      name: 'Enterprise Pro Annual',
      tier: 'PRO',
      billing_period: 'ANNUAL',
      duration_months: 12,
      plan_price: 97188.00,
      is_active: 1
    },
    {
      id: 5,
      product_id: 3,
      name: 'Ultra SLA Annual',
      tier: 'DEDICATED',
      billing_period: 'ANNUAL',
      duration_months: 12,
      plan_price: 161988.00,
      is_active: 1
    },
    {
      id: 6,
      product_id: 2,
      name: 'Enterprise Multi-Year (24 Mo)',
      tier: 'PRO',
      billing_period: 'MULTI_YEAR',
      duration_months: 24,
      plan_price: 184000.00,
      is_active: 1
    }
  ],
  taxes: [
    { id: 1, name: 'GST (18%)', rate_percent: 18.00, is_default: 1, is_active: 1 },
    { id: 2, name: 'Concessional GST (5%)', rate_percent: 5.00, is_default: 0, is_active: 1 },
    { id: 3, name: 'Exempt / Zero Rated (0%)', rate_percent: 0.00, is_default: 0, is_active: 1 }
  ],
  discounts: [
    { id: 1, code: 'WELCOME10', name: 'New Customer Welcome (10%)', type: 'PERCENT', value: 10.00, is_active: 1 },
    { id: 2, code: 'SUMMER20', name: 'Mid-Year Growth Incentive (20%)', type: 'PERCENT', value: 20.00, is_active: 1 },
    { id: 3, code: 'ENTERPRISE5000', name: 'Enterprise Flat Rebate (₹5,000)', type: 'FIXED', value: 5000.00, is_active: 1 }
  ],
  quotations: [
    {
      id: 1,
      quotation_number: 'QT-2024-001',
      customer_id: 1,
      staff_id: 1,
      product_id: 2,
      variant_id: 2,
      plan_id: 4,
      quantity: 5,
      billing_period: 'ANNUAL',
      unit_price: 10499.00,
      subtotal: 52495.00,
      discount_id: 1,
      discount_amount: 5249.50,
      tax_id: 1,
      tax_amount: 8504.19,
      grand_total: 55749.69,
      validity_date: '2026-11-14',
      notes: 'Includes multi-region HA configuration and premium SLA.',
      terms: 'Standard Net-30 payment terms. Validity: 14 days.',
      status: 'SENT',
      is_converted: 0,
      converted_subscription_id: null,
      created_at: '2026-10-31T06:00:00Z',
      updated_at: '2026-10-31T06:00:00Z'
    },
    {
      id: 2,
      quotation_number: 'QT-2024-002',
      customer_id: 3,
      staff_id: 1,
      product_id: 1,
      variant_id: 1,
      plan_id: 2,
      quantity: 10,
      billing_period: 'ANNUAL',
      unit_price: 4999.00,
      subtotal: 49990.00,
      discount_id: 2,
      discount_amount: 9998.00,
      tax_id: 1,
      tax_amount: 7198.56,
      grand_total: 47190.56,
      validity_date: '2026-11-07',
      notes: 'Team growth quote with 20% discount approval.',
      terms: 'Advance payment required. Validity: 7 days.',
      status: 'DRAFT',
      is_converted: 0,
      converted_subscription_id: null,
      created_at: '2026-10-30T10:00:00Z',
      updated_at: '2026-10-30T10:00:00Z'
    },
    {
      id: 3,
      quotation_number: 'QT-2024-003',
      customer_id: 5,
      staff_id: 1,
      product_id: 3,
      variant_id: 4,
      plan_id: 5,
      quantity: 2,
      billing_period: 'ANNUAL',
      unit_price: 19999.00,
      subtotal: 39998.00,
      discount_id: 3,
      discount_amount: 5000.00,
      tax_id: 1,
      tax_amount: 6299.64,
      grand_total: 41297.64,
      validity_date: '2026-11-21',
      notes: 'Ultra dedicated cluster with 24/7 SRE coverage.',
      terms: 'Subject to MSA execution.',
      status: 'ACCEPTED',
      is_converted: 0,
      converted_subscription_id: null,
      created_at: '2026-10-29T14:00:00Z',
      updated_at: '2026-10-30T15:00:00Z'
    }
  ],
  subscriptions: [
    {
      id: 1,
      subscription_number: 'SUB-2024-001',
      quotation_id: null,
      customer_id: 1,
      staff_id: 1,
      product_id: 2,
      variant_id: 2,
      plan_id: 4,
      quantity: 5,
      billing_period: 'ANNUAL',
      amount: 55749.69,
      start_date: '2026-08-30',
      expiry_date: '2027-08-30',
      next_billing_date: '2027-08-30',
      status: 'ACTIVE',
      renewal_count: 0,
      created_at: '2026-08-30T10:00:00Z',
      updated_at: '2026-08-30T10:00:00Z'
    },
    {
      id: 2,
      subscription_number: 'SUB-2024-002',
      quotation_id: null,
      customer_id: 2,
      staff_id: 1,
      product_id: 1,
      variant_id: 1,
      plan_id: 1,
      quantity: 8,
      billing_period: 'MONTHLY',
      amount: 24500.00,
      start_date: '2026-09-25',
      expiry_date: '2027-09-25',
      next_billing_date: '2026-10-25',
      status: 'ACTIVE',
      renewal_count: 1,
      created_at: '2026-09-25T11:00:00Z',
      updated_at: '2026-09-25T11:00:00Z'
    },
    {
      id: 3,
      subscription_number: 'SUB-2024-003',
      quotation_id: null,
      customer_id: 4,
      staff_id: 1,
      product_id: 2,
      variant_id: 3,
      plan_id: 4,
      quantity: 2,
      billing_period: 'ANNUAL',
      amount: 18450.00,
      start_date: '2026-07-30',
      expiry_date: '2027-07-30',
      next_billing_date: '2026-10-18',
      status: 'ACTIVE',
      renewal_count: 0,
      created_at: '2026-07-30T09:00:00Z',
      updated_at: '2026-07-30T09:00:00Z'
    }
  ],
  invoices: [
    {
      id: 1,
      invoice_number: 'INV-2024-001',
      subscription_id: 1,
      quotation_id: null,
      customer_id: 1,
      staff_id: 1,
      invoice_date: '2026-08-30',
      due_date: '2026-09-30',
      subtotal: 52495.00,
      discount_amount: 5249.50,
      tax_amount: 8504.19,
      total_amount: 55749.69,
      paid_amount: 55749.69,
      outstanding_amount: 0.00,
      status: 'PAID',
      notes: 'Annual subscription initial billing - Paid via NEFT.',
      created_at: '2026-08-30T10:00:00Z',
      updated_at: '2026-09-28T14:00:00Z'
    },
    {
      id: 2,
      invoice_number: 'INV-2024-002',
      subscription_id: 2,
      quotation_id: null,
      customer_id: 2,
      staff_id: 1,
      invoice_date: '2026-09-25',
      due_date: '2026-10-25',
      subtotal: 23000.00,
      discount_amount: 2300.00,
      tax_amount: 3800.00,
      total_amount: 24500.00,
      paid_amount: 0.00,
      outstanding_amount: 24500.00,
      status: 'CONFIRMED',
      notes: 'Monthly recurrent bill - Overdue by 6 days.',
      created_at: '2026-09-25T11:00:00Z',
      updated_at: '2026-09-25T11:00:00Z'
    },
    {
      id: 3,
      invoice_number: 'INV-2024-003',
      subscription_id: 3,
      quotation_id: null,
      customer_id: 4,
      staff_id: 1,
      invoice_date: '2026-09-18',
      due_date: '2026-10-18',
      subtotal: 17000.00,
      discount_amount: 1700.00,
      tax_amount: 3150.00,
      total_amount: 18450.00,
      paid_amount: 0.00,
      outstanding_amount: 18450.00,
      status: 'CONFIRMED',
      notes: 'Annual subscription billing - Overdue by 13 days.',
      created_at: '2026-09-18T09:00:00Z',
      updated_at: '2026-09-18T09:00:00Z'
    }
  ],
  invoice_items: [
    {
      id: 1,
      invoice_id: 1,
      item_description: 'Brightloop Enterprise Pro (5 Seats - Annual)',
      quantity: 5,
      unit_price: 10499.00,
      subtotal: 52495.00,
      discount_amount: 5249.50,
      tax_amount: 8504.19,
      total_amount: 55749.69
    },
    {
      id: 2,
      invoice_id: 2,
      item_description: 'Brightloop Cloud Core (8 Seats - Monthly)',
      quantity: 8,
      unit_price: 2875.00,
      subtotal: 23000.00,
      discount_amount: 2300.00,
      tax_amount: 3800.00,
      total_amount: 24500.00
    },
    {
      id: 3,
      invoice_id: 3,
      item_description: 'Brightloop Enterprise Pro (2 Seats - Annual)',
      quantity: 2,
      unit_price: 8500.00,
      subtotal: 17000.00,
      discount_amount: 1700.00,
      tax_amount: 3150.00,
      total_amount: 18450.00
    }
  ],
  payments: [
    {
      id: 1,
      payment_number: 'PAY-2024-001',
      invoice_id: 1,
      customer_id: 1,
      staff_id: 1,
      amount: 55749.69,
      payment_method: 'Bank Transfer',
      payment_date: '2026-09-28',
      transaction_reference: 'NEFT-HDFC-99281923',
      notes: 'Full annual settlement verified by accounts',
      receipt_number: 'REC-2024-001',
      created_at: '2026-09-28T14:30:00Z'
    }
  ],
  activity_logs: [
    {
      id: 1,
      staff_id: 1,
      staff_name: 'Sarah Jenkins',
      action_type: 'CUSTOMER_REGISTER',
      entity_type: 'CUSTOMER',
      entity_reference: 'CUST-HC-339',
      description: 'Registered new customer Helios Cloud Labs',
      created_at: '2026-10-29T10:00:00Z'
    },
    {
      id: 2,
      staff_id: 1,
      staff_name: 'Sarah Jenkins',
      action_type: 'QUOTATION_CREATE',
      entity_type: 'QUOTATION',
      entity_reference: 'QT-2024-003',
      description: 'Created quotation QT-2024-003 for Helios Cloud Labs',
      created_at: '2026-10-29T14:00:00Z'
    },
    {
      id: 3,
      staff_id: 1,
      staff_name: 'Sarah Jenkins',
      action_type: 'QUOTATION_SEND',
      entity_type: 'QUOTATION',
      entity_reference: 'QT-2024-001',
      description: 'Dispatched commercial proposal QT-2024-001 to Rajiv Nair (Nexus Tech)',
      created_at: '2026-10-31T06:30:00Z'
    },
    {
      id: 4,
      staff_id: 1,
      staff_name: 'Sarah Jenkins',
      action_type: 'PAYMENT_RECORD',
      entity_type: 'PAYMENT',
      entity_reference: 'PAY-2024-001',
      description: 'Recorded manual payment of ₹55,749.69 for Invoice INV-2024-001',
      created_at: '2026-10-31T09:15:00Z'
    }
  ]
};

class LocalSqlEngine {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, 'utf8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Error reading store file, using initial data:', e.message);
    }
    this.saveData(initialData);
    return JSON.parse(JSON.stringify(initialData));
  }

  saveData(dataToSave) {
    try {
      const dir = path.dirname(STORE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(STORE_PATH, JSON.stringify(dataToSave || this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to persist store:', e.message);
    }
  }

  nextId(table) {
    if (!this.data[table] || this.data[table].length === 0) return 1;
    return Math.max(...this.data[table].map(r => r.id || 0)) + 1;
  }

  // Universal query execution that processes SQL strings and parameters
  async query(sql, params = []) {
    const trimmed = sql.trim();
    const upper = trimmed.toUpperCase();

    // 1. SELECT queries
    if (upper.startsWith('SELECT')) {
      return this.handleSelect(trimmed, params);
    }

    // 2. INSERT queries
    if (upper.startsWith('INSERT INTO')) {
      return this.handleInsert(trimmed, params);
    }

    // 3. UPDATE queries
    if (upper.startsWith('UPDATE')) {
      return this.handleUpdate(trimmed, params);
    }

    // 4. DELETE queries
    if (upper.startsWith('DELETE FROM')) {
      return this.handleDelete(trimmed, params);
    }

    // Default for DDL or unhandled
    return [[], []];
  }

  handleInsert(sql, params) {
    const match = sql.match(/INSERT\s+INTO\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)\s*VALUES/i);
    if (!match) throw new Error('Cannot parse INSERT query: ' + sql);

    const table = match[1].toLowerCase();
    const columns = match[2].split(',').map(c => c.trim().replace(/[`"']/g, ''));

    if (!this.data[table]) {
      this.data[table] = [];
    }

    const row = {};
    columns.forEach((col, idx) => {
      row[col] = params[idx] !== undefined ? params[idx] : null;
    });

    if (!row.id) {
      row.id = this.nextId(table);
    }
    if (!row.created_at) {
      row.created_at = new Date().toISOString();
    }
    if (!row.updated_at) {
      row.updated_at = new Date().toISOString();
    }

    this.data[table].push(row);
    this.saveData();

    return [{ insertId: row.id, affectedRows: 1 }, []];
  }

  handleUpdate(sql, params) {
    const match = sql.match(/UPDATE\s+([a-zA-Z0-9_]+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/is);
    if (!match) throw new Error('Cannot parse UPDATE query: ' + sql);

    const table = match[1].toLowerCase();
    const setClause = match[2];
    const whereClause = match[3] || '';

    if (!this.data[table]) return [{ affectedRows: 0 }, []];

    // Count place holders in SET clause
    const setAssignments = setClause.split(',').map(s => s.trim());
    const setFields = [];
    let paramIndex = 0;

    for (const assignment of setAssignments) {
      const parts = assignment.split('=').map(p => p.trim());
      if (parts.length < 2) continue;
      const col = parts[0].replace(/[`"']/g, '');
      const rawVal = parts[1];
      let val;
      if (rawVal === '?') {
        val = params[paramIndex++];
      } else {
        val = rawVal.replace(/^['"]|['"]$/g, '');
        if (!isNaN(Number(val)) && rawVal.trim() !== '' && !rawVal.includes('"') && !rawVal.includes("'")) {
          val = Number(val);
        }
      }
      setFields.push({ col, val });
    }

    const whereParams = params.slice(paramIndex);
    let affected = 0;

    this.data[table] = this.data[table].map(row => {
      if (this.matchesWhere(row, whereClause, whereParams)) {
        affected++;
        const updated = { ...row };
        for (const { col, val } of setFields) {
          updated[col] = val;
        }
        updated.updated_at = new Date().toISOString();
        return updated;
      }
      return row;
    });

    this.saveData();
    return [{ affectedRows: affected }, []];
  }

  handleDelete(sql, params) {
    const match = sql.match(/DELETE\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.+))?$/is);
    if (!match) throw new Error('Cannot parse DELETE query: ' + sql);

    const table = match[1].toLowerCase();
    const whereClause = match[2] || '';

    if (!this.data[table]) return [{ affectedRows: 0 }, []];

    const initialLen = this.data[table].length;
    this.data[table] = this.data[table].filter(row => !this.matchesWhere(row, whereClause, params));
    const affected = initialLen - this.data[table].length;

    this.saveData();
    return [{ affectedRows: affected }, []];
  }

  handleSelect(sql, params) {
    // Regex for basic table name extraction
    const fromMatch = sql.match(/FROM\s+([a-zA-Z0-9_]+)(?:\s+([a-zA-Z0-9_]+))?/i);
    if (!fromMatch) return [[], []];

    const primaryTable = fromMatch[1].toLowerCase();
    const primaryAlias = fromMatch[2] ? fromMatch[2].toLowerCase() : primaryTable;

    let rows = (this.data[primaryTable] || []).map(r => ({ ...r }));

    // Check for JOINs
    const joinMatches = [...sql.matchAll(/(?:LEFT\s+JOIN|JOIN)\s+([a-zA-Z0-9_]+)(?:\s+([a-zA-Z0-9_]+))?\s+ON\s+([^\s]+)\s*=\s*([^\s]+)/gi)];
    for (const join of joinMatches) {
      const joinTable = join[1].toLowerCase();
      const joinAlias = join[2] ? join[2].toLowerCase() : joinTable;
      const leftKeyParts = join[3].split('.');
      const rightKeyParts = join[4].split('.');

      const targetData = this.data[joinTable] || [];

      rows = rows.map(primaryRow => {
        const match = targetData.find(joinRow => {
          let leftVal = leftKeyParts.length === 2 && (leftKeyParts[0].toLowerCase() === primaryAlias || leftKeyParts[0].toLowerCase() === primaryTable)
            ? primaryRow[leftKeyParts[1]]
            : primaryRow[rightKeyParts[1]];
          let rightVal = rightKeyParts.length === 2 && (rightKeyParts[0].toLowerCase() === joinAlias || rightKeyParts[0].toLowerCase() === joinTable)
            ? joinRow[rightKeyParts[1]]
            : joinRow[leftKeyParts[1]];
          return leftVal == rightVal;
        });

        const combined = { ...primaryRow };
        if (match) {
          // Add joined fields prefixed or directly if non-colliding
          for (const [k, v] of Object.entries(match)) {
            if (combined[k] === undefined) {
              combined[k] = v;
            }
            combined[`${joinAlias}_${k}`] = v;
          }
        }
        return combined;
      });
    }

    // WHERE filtering
    const whereMatch = sql.match(/\s+WHERE\s+(.+?)(?:\s+GROUP\s+BY|\s+ORDER\s+BY|\s+LIMIT|$)/is);
    if (whereMatch) {
      const whereClause = whereMatch[1];
      rows = rows.filter(row => this.matchesWhere(row, whereClause, params));
    }

    // ORDER BY
    const orderMatch = sql.match(/ORDER\s+BY\s+([a-zA-Z0-9_.]+)(?:\s+(ASC|DESC))?/i);
    if (orderMatch) {
      let sortCol = orderMatch[1].replace(/[`"']/g, '');
      if (sortCol.includes('.')) sortCol = sortCol.split('.')[1];
      const sortDir = (orderMatch[2] || 'ASC').toUpperCase();

      rows.sort((a, b) => {
        let valA = a[sortCol];
        let valB = b[sortCol];
        if (valA === undefined) valA = '';
        if (valB === undefined) valB = '';
        if (valA < valB) return sortDir === 'DESC' ? 1 : -1;
        if (valA > valB) return sortDir === 'DESC' ? -1 : 1;
        return 0;
      });
    }

    // Aggregations check: COUNT(*), SUM(col)
    const hasCount = sql.match(/COUNT\(\*\)(?:\s+AS\s+([a-zA-Z0-9_]+))?/i);
    const sumMatches = [...sql.matchAll(/SUM\(([a-zA-Z0-9_]+)\)(?:\s+AS\s+([a-zA-Z0-9_]+))?/gi)];

    if (hasCount || sumMatches.length > 0) {
      const aggResult = {};
      if (hasCount) {
        const countAlias = hasCount[1] || 'count';
        aggResult[countAlias] = rows.length;
      }
      for (const sm of sumMatches) {
        const col = sm[1];
        const alias = sm[2] || 'total';
        aggResult[alias] = rows.reduce((acc, r) => acc + (parseFloat(r[col]) || 0), 0);
      }
      return [[aggResult], []];
    }

    // LIMIT
    const limitMatch = sql.match(/LIMIT\s+(\d+)(?:\s+OFFSET\s+(\d+))?/i);
    if (limitMatch) {
      const limit = parseInt(limitMatch[1], 10);
      const offset = limitMatch[2] ? parseInt(limitMatch[2], 10) : 0;
      rows = rows.slice(offset, offset + limit);
    }

    return [rows, []];
  }

  matchesWhere(row, whereClause, params = []) {
    if (!whereClause || whereClause.trim() === '') return true;

    // Handle simple 1 = 1
    if (whereClause.includes('1 = 1') || whereClause.includes('1=1')) {
      // evaluate remaining conditions if any
    }

    let pIdx = 0;
    // Replace parameters sequentially into condition tokens
    const conditions = whereClause.split(/\s+AND\s+/i);

    for (const cond of conditions) {
      const trimmedCond = cond.trim();
      if (trimmedCond === '1=1' || trimmedCond === '1 = 1') continue;

      // Check for status = ? or id = ?
      const eqMatch = trimmedCond.match(/([a-zA-Z0-9_.]+)\s*(=|!=|<>|>|<|>=|<=|LIKE|IS|IN)\s*(.+)/i);
      if (eqMatch) {
        let field = eqMatch[1].trim().replace(/[`"']/g, '');
        if (field.includes('.')) field = field.split('.')[1];
        const op = eqMatch[2].toUpperCase();
        let targetVal = eqMatch[3].trim();

        if (targetVal === '?') {
          targetVal = params[pIdx++];
        } else if (targetVal.startsWith("'") && targetVal.endsWith("'")) {
          targetVal = targetVal.slice(1, -1);
        }

        const rowVal = row[field];

        if (op === '=') {
          if (rowVal != targetVal) return false;
        } else if (op === '!=' || op === '<>') {
          if (rowVal == targetVal) return false;
        } else if (op === 'IN') {
          const inside = targetVal.replace(/[()]/g, '');
          const parts = inside.split(',').map(p => p.trim());
          const inValues = parts.map(p => {
            if (p === '?') return params[pIdx++];
            return p.replace(/^['"]|['"]$/g, '');
          });
          if (!inValues.some(v => v == rowVal)) return false;
        } else if (op === 'LIKE') {
          const pattern = String(targetVal).replace(/%/g, '.*');
          const reg = new RegExp(`^${pattern}$`, 'i');
          if (!reg.test(String(rowVal || ''))) return false;
        } else if (op === '>') {
          if (!(parseFloat(rowVal) > parseFloat(targetVal))) return false;
        } else if (op === '<') {
          if (!(parseFloat(rowVal) < parseFloat(targetVal))) return false;
        } else if (op === '>=') {
          if (!(parseFloat(rowVal) >= parseFloat(targetVal))) return false;
        } else if (op === '<=') {
          if (!(parseFloat(rowVal) <= parseFloat(targetVal))) return false;
        }
      }
    }

    return true;
  }
}

export const localSqlEngine = new LocalSqlEngine();
