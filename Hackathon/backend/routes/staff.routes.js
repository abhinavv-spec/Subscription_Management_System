import { Router } from 'express';
import { verifyToken, verifyStaff, verifyAdmin } from '../middleware/auth.js';
import {
  getDashboardStats,
  getCustomers,
  getCustomerById,
  registerCustomer,
  updateCustomer,
  getQuotations,
  getQuotationById,
  createQuotation,
  sendQuotation,
  acceptQuotation,
  rejectQuotation,
  convertQuotationToSubscription,
  getSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscriptionStatus,
  getInvoices,
  getInvoiceById,
  confirmInvoice,
  cancelInvoice,
  getPayments,
  recordPayment,
  getOverdueInvoices,
  getActivityLogs,
  getCatalogData,
  getReportsData
} from '../controllers/staff.controller.js';

const router = Router();

// Apply auth & staff verification for all routes in this router
router.use(verifyToken, verifyStaff);

// 1. Dashboard
router.get('/dashboard', getDashboardStats);

// 2. Catalogs (Read-only for Staff)
router.get('/catalogs', getCatalogData);

// 3. Customers
router.get('/customers', getCustomers);
router.post('/customers', registerCustomer);
router.get('/customers/:id', getCustomerById);
router.put('/customers/:id', updateCustomer);

// 4. Quotations
router.get('/quotations', getQuotations);
router.post('/quotations', createQuotation);
router.get('/quotations/:id', getQuotationById);
router.post('/quotations/:id/send', sendQuotation);
router.post('/quotations/:id/accept', acceptQuotation);
router.post('/quotations/:id/reject', rejectQuotation);
router.post('/quotations/:id/convert', convertQuotationToSubscription);

// 5. Subscriptions
router.get('/subscriptions', getSubscriptions);
router.post('/subscriptions', createSubscription);
router.get('/subscriptions/:id', getSubscriptionById);
router.put('/subscriptions/:id/status', updateSubscriptionStatus);

// 6. Invoices
router.get('/invoices', getInvoices);
router.get('/invoices/overdue', getOverdueInvoices);
router.get('/invoices/:id', getInvoiceById);
router.put('/invoices/:id/confirm', confirmInvoice);
router.put('/invoices/:id/cancel', cancelInvoice);

// 7. Payments
router.get('/payments', getPayments);
router.post('/payments', recordPayment);

// 8. Activity
router.get('/activity', getActivityLogs);

// 9. Operational Reports
router.get('/reports', getReportsData);

// ==============================================================
// 9. STRICT RESTRICTED ADMIN MODULES
// Staff accounts MUST NOT be allowed to access these. Backend enforcement:
// ==============================================================
router.post('/products', verifyAdmin, (req, res) => res.json({ success: true }));
router.put('/products/:id', verifyAdmin, (req, res) => res.json({ success: true }));
router.delete('/products/:id', verifyAdmin, (req, res) => res.json({ success: true }));

router.post('/plans', verifyAdmin, (req, res) => res.json({ success: true }));
router.put('/plans/:id', verifyAdmin, (req, res) => res.json({ success: true }));
router.delete('/plans/:id', verifyAdmin, (req, res) => res.json({ success: true }));

router.post('/taxes', verifyAdmin, (req, res) => res.json({ success: true }));
router.post('/discounts', verifyAdmin, (req, res) => res.json({ success: true }));
router.post('/users', verifyAdmin, (req, res) => res.json({ success: true }));

export default router;

