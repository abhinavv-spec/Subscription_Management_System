import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  Building,
  Layers,
  Percent,
  CheckCircle2,
  Send,
  Save,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import apiClient from '../api/apiClient';
import { useToast } from './Toast';

export const CreateQuotationModal = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedCustomerId = null
}) => {
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [plans, setPlans] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    customer_id: '',
    product_id: '',
    variant_id: '',
    plan_id: '',
    quantity: 5,
    billing_period: 'ANNUAL',
    discount_id: '',
    tax_id: '',
    validity_days: 14,
    notes: 'Standard enterprise subscription agreement with Tier-2 support.',
    terms: 'Payment terms: Net-30 upon signature. Governed by Brightloop SaaS Master Agreement.',
    save_as_draft: false
  });

  // Dynamic preview totals
  const [previewTotals, setPreviewTotals] = useState({
    basePrice: 0,
    variantExtra: 0,
    unitPrice: 0,
    subtotal: 0,
    discountAmount: 0,
    taxableAmount: 0,
    taxAmount: 0,
    grandTotal: 0
  });

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      setFetching(true);
      const [custRes, catRes] = await Promise.all([
        apiClient.get('/staff/customers'),
        apiClient.get('/staff/catalogs')
      ]);

      if (custRes.data.success) {
        setCustomers(custRes.data.customers || []);
      }
      if (catRes.data.success) {
        setProducts(catRes.data.products || []);
        setVariants(catRes.data.variants || []);
        setPlans(catRes.data.plans || []);
        setTaxes(catRes.data.taxes || []);
        setDiscounts(catRes.data.discounts || []);

        const defProd = catRes.data.products[0];
        const defPlan = catRes.data.plans[0];
        const defTax = catRes.data.taxes.find((t) => t.is_default) || catRes.data.taxes[0];

        setFormData((prev) => ({
          ...prev,
          customer_id: preselectedCustomerId || (custRes.data.customers[0]?.id || ''),
          product_id: defProd ? defProd.id : '',
          plan_id: defPlan ? defPlan.id : '',
          tax_id: defTax ? defTax.id : ''
        }));
      }
    } catch (err) {
      showToast('Failed to load quotation catalog data.', 'error');
    } finally {
      setFetching(false);
    }
  };

  // Recalculate local preview whenever fields change
  useEffect(() => {
    if (!formData.product_id) return;

    const prod = products.find((p) => p.id === parseInt(formData.product_id, 10));
    const basePrice = prod ? parseFloat(prod.base_price) : 0;

    let variantExtra = 0;
    if (formData.variant_id) {
      const v = variants.find((item) => item.id === parseInt(formData.variant_id, 10));
      if (v) variantExtra = parseFloat(v.extra_price || 0);
    }

    const unitPrice = basePrice + variantExtra;
    const qty = parseInt(formData.quantity, 10) || 1;
    const subtotal = unitPrice * qty;

    let discountAmount = 0;
    if (formData.discount_id) {
      const disc = discounts.find((d) => d.id === parseInt(formData.discount_id, 10));
      if (disc) {
        if (disc.type === 'PERCENT') {
          discountAmount = (subtotal * parseFloat(disc.value)) / 100;
        } else {
          discountAmount = Math.min(subtotal, parseFloat(disc.value));
        }
      }
    }

    const taxableAmount = Math.max(0, subtotal - discountAmount);

    let taxAmount = 0;
    if (formData.tax_id) {
      const tax = taxes.find((t) => t.id === parseInt(formData.tax_id, 10));
      if (tax) {
        taxAmount = (taxableAmount * parseFloat(tax.rate_percent)) / 100;
      }
    }

    const grandTotal = taxableAmount + taxAmount;

    setPreviewTotals({
      basePrice,
      variantExtra,
      unitPrice,
      subtotal,
      discountAmount,
      taxableAmount,
      taxAmount,
      grandTotal
    });
  }, [formData, products, variants, discounts, taxes]);

  if (!isOpen) return null;

  const handleSubmit = async (isDraft = false) => {
    if (!formData.customer_id || !formData.product_id || !formData.plan_id) {
      showToast('Please select customer, product, and plan.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        save_as_draft: isDraft
      };
      const res = await apiClient.post('/staff/quotations', payload);
      if (res.data.success) {
        showToast(
          `Quotation ${res.data.quotation_number} ${isDraft ? 'saved as Draft' : 'created & dispatched'}!`
        );
        onSuccess && onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error creating quotation.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredVariants = variants.filter(
    (v) => v.product_id === parseInt(formData.product_id, 10)
  );
  const filteredPlans = plans.filter(
    (p) => p.product_id === parseInt(formData.product_id, 10)
  );

  const selectedCustomerObj = customers.find((c) => c.id === parseInt(formData.customer_id, 10));
  const selectedProductObj = products.find((p) => p.id === parseInt(formData.product_id, 10));
  const selectedPlanObj = plans.find((pl) => pl.id === parseInt(formData.plan_id, 10));
  const selectedDiscountObj = discounts.find((d) => d.id === parseInt(formData.discount_id, 10));
  const selectedTaxObj = taxes.find((t) => t.id === parseInt(formData.tax_id, 10));

  const steps = [
    { num: 1, title: 'Customer' },
    { num: 2, title: 'Plan & Product' },
    { num: 3, title: 'Discounts & Terms' },
    { num: 4, title: 'Review' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#111B2E] border border-[#263449] rounded-xl shadow-2xl overflow-hidden my-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#263449] bg-[#0E1526]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#172238] border border-[#263449] flex items-center justify-center text-[#38BDF8]">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#F1F5F9]">Commercial Quotation Builder</h2>
              <p className="text-xs text-[#94A3B8]">Configure recurring subscription proposal and pricing terms</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#172238] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator Tabs */}
        <div className="flex items-center border-b border-[#263449] bg-[#0E1526]/50 px-6">
          {steps.map((st) => (
            <button
              key={st.num}
              onClick={() => setCurrentStep(st.num)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-medium border-b-2 transition-colors ${
                currentStep === st.num
                  ? 'border-[#38BDF8] text-[#38BDF8]'
                  : currentStep > st.num
                  ? 'border-transparent text-[#34D399]'
                  : 'border-transparent text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentStep === st.num
                    ? 'bg-[#38BDF8] text-[#0B1020]'
                    : currentStep > st.num
                    ? 'bg-[#34D399]/20 text-[#34D399]'
                    : 'bg-[#172238] text-[#94A3B8]'
                }`}
              >
                {st.num}
              </span>
              <span>{st.title}</span>
            </button>
          ))}
        </div>

        {/* Main Content Area (2-column layout: Form Left, Pricing Breakdown Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-h-[70vh] overflow-y-auto">
          {/* Left Form Area (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {fetching ? (
              <div className="py-12 text-center text-xs text-[#94A3B8]">
                Loading catalog components and customer profiles...
              </div>
            ) : (
              <>
                {/* Step 1: Customer Selection */}
                {currentStep === 1 && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1">
                        Select Target Customer Account
                      </h3>
                      <p className="text-xs text-[#94A3B8] mb-3">
                        Choose the enterprise account receiving this formal quotation.
                      </p>
                      <select
                        value={formData.customer_id}
                        onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-xs text-[#F1F5F9] outline-none focus:border-[#38BDF8]/60"
                      >
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.company_name} ({c.customer_code}) – Attn: {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedCustomerObj && (
                      <div className="p-3.5 rounded-lg bg-[#172238]/60 border border-[#263449] text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[#94A3B8]">Contact Person:</span>
                          <span className="font-medium text-[#F1F5F9]">{selectedCustomerObj.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#94A3B8]">Email:</span>
                          <span className="text-[#F1F5F9] font-mono text-[11px]">{selectedCustomerObj.email}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#94A3B8]">Phone:</span>
                          <span className="text-[#F1F5F9]">{selectedCustomerObj.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#94A3B8]">Outstanding Balance:</span>
                          <span className="font-semibold text-rose-400">
                            ₹{parseFloat(selectedCustomerObj.outstanding_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#38BDF8] text-[#0B1020] text-xs font-semibold hover:bg-[#38BDF8]/90 transition-colors"
                      >
                        <span>Next: Configure Product</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Plan and Product Configuration */}
                {currentStep === 2 && (
                  <div className="flex flex-col gap-4">
                    <h3 className="text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider">
                      Product Core & Tier Configuration
                    </h3>

                    <div>
                      <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                        Product Core *
                      </label>
                      <select
                        value={formData.product_id}
                        onChange={(e) => setFormData({ ...formData, product_id: e.target.value, variant_id: '' })}
                        className="w-full h-10 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-xs text-[#F1F5F9] outline-none focus:border-[#38BDF8]/60"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Base: ₹{parseFloat(p.base_price).toLocaleString('en-IN')})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                          Infrastructure Variant (Optional)
                        </label>
                        <select
                          value={formData.variant_id}
                          onChange={(e) => setFormData({ ...formData, variant_id: e.target.value })}
                          className="w-full h-10 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-xs text-[#F1F5F9] outline-none focus:border-[#38BDF8]/60"
                        >
                          <option value="">Standard Cloud (No Surcharge)</option>
                          {filteredVariants.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name} (+₹{parseFloat(v.extra_price).toLocaleString('en-IN')})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                          Subscription Tier *
                        </label>
                        <select
                          value={formData.plan_id}
                          onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
                          className="w-full h-10 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-xs text-[#F1F5F9] outline-none focus:border-[#38BDF8]/60"
                        >
                          {filteredPlans.map((pl) => (
                            <option key={pl.id} value={pl.id}>
                              {pl.name} ({pl.tier})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                          Billing Cycle *
                        </label>
                        <select
                          value={formData.billing_period}
                          onChange={(e) => setFormData({ ...formData, billing_period: e.target.value })}
                          className="w-full h-10 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-xs text-[#F1F5F9] outline-none focus:border-[#38BDF8]/60"
                        >
                          <option value="MONTHLY">Monthly Rolling</option>
                          <option value="QUARTERLY">Quarterly (3 Months)</option>
                          <option value="ANNUAL">Annual Commercial (12 Months)</option>
                          <option value="MULTI_YEAR">Multi-Year (24 Months)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                          Allocated Seats / Units *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                          className="w-full h-10 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-xs text-[#F1F5F9] font-medium outline-none focus:border-[#38BDF8]/60"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#172238] border border-[#263449] text-xs text-[#F1F5F9] font-medium hover:bg-[#263449] transition-colors"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#38BDF8] text-[#0B1020] text-xs font-semibold hover:bg-[#38BDF8]/90 transition-colors"
                      >
                        <span>Next: Pricing & Terms</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Discounts, Taxes and Terms */}
                {currentStep === 3 && (
                  <div className="flex flex-col gap-4">
                    <h3 className="text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider">
                      Commercial Discounts & Contract Terms
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                          Approved Discount Campaign
                        </label>
                        <select
                          value={formData.discount_id}
                          onChange={(e) => setFormData({ ...formData, discount_id: e.target.value })}
                          className="w-full h-10 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-xs text-[#F1F5F9] outline-none focus:border-[#38BDF8]/60"
                        >
                          <option value="">No Discount Applied (0%)</option>
                          {discounts.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.code} - {d.name} ({d.type === 'PERCENT' ? `${d.value}%` : `₹${d.value}`})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                          Applicable Tax (GST) *
                        </label>
                        <select
                          value={formData.tax_id}
                          onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                          className="w-full h-10 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-xs text-[#F1F5F9] outline-none focus:border-[#38BDF8]/60"
                        >
                          {taxes.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} ({t.rate_percent}%)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                          Quotation Validity (Days) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="90"
                          value={formData.validity_days}
                          onChange={(e) => setFormData({ ...formData, validity_days: e.target.value })}
                          className="w-full h-10 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-xs text-[#F1F5F9] outline-none focus:border-[#38BDF8]/60"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                          Internal Notes
                        </label>
                        <input
                          type="text"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="w-full h-10 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-xs text-[#F1F5F9] outline-none focus:border-[#38BDF8]/60"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                        Contract Payment Terms
                      </label>
                      <textarea
                        rows={2}
                        value={formData.terms}
                        onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                        className="w-full p-2.5 rounded-lg bg-[#0E1526] border border-[#263449] text-xs text-[#F1F5F9] outline-none focus:border-[#38BDF8]/60"
                      />
                    </div>

                    <div className="pt-2 flex justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#172238] border border-[#263449] text-xs text-[#F1F5F9] font-medium hover:bg-[#263449] transition-colors"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(4)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#38BDF8] text-[#0B1020] text-xs font-semibold hover:bg-[#38BDF8]/90 transition-colors"
                      >
                        <span>Review Proposal</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Review and Send */}
                {currentStep === 4 && (
                  <div className="flex flex-col gap-4">
                    <h3 className="text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider">
                      Proposal Summary & Verification
                    </h3>

                    <div className="p-4 rounded-lg bg-[#172238]/60 border border-[#263449] text-xs space-y-2.5">
                      <div className="flex items-center justify-between border-b border-[#263449] pb-2">
                        <span className="text-[#94A3B8]">Target Customer:</span>
                        <span className="font-semibold text-[#F1F5F9]">{selectedCustomerObj?.company_name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#94A3B8]">Product Core:</span>
                        <span className="text-[#F1F5F9]">{selectedProductObj?.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#94A3B8]">Subscription Tier:</span>
                        <span className="text-[#F1F5F9]">{selectedPlanObj?.name} ({selectedPlanObj?.tier})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#94A3B8]">Billing Cadence:</span>
                        <span className="text-[#F1F5F9]">{formData.billing_period}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#94A3B8]">Quantity / Seats:</span>
                        <span className="font-semibold text-[#F1F5F9]">{formData.quantity} units</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#94A3B8]">Validity Period:</span>
                        <span className="text-[#F1F5F9]">{formData.validity_days} days from dispatch</span>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#172238] border border-[#263449] text-xs text-[#F1F5F9] font-medium hover:bg-[#263449] transition-colors"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Edit Terms</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Sticky Pricing Summary Panel (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-[#0E1526] border border-[#263449] rounded-xl p-5">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#263449] mb-4">
                <span className="text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider">
                  Pricing Breakdown
                </span>
                <span className="text-[10px] font-medium text-[#38BDF8] bg-[#38BDF8]/10 border border-[#38BDF8]/20 px-2 py-0.5 rounded">
                  INR (₹)
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-[#94A3B8]">
                  <span>Base Unit Price:</span>
                  <span className="text-[#F1F5F9] font-mono">
                    ₹{previewTotals.basePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {previewTotals.variantExtra > 0 && (
                  <div className="flex items-center justify-between text-[#94A3B8]">
                    <span>Variant Surcharge:</span>
                    <span className="text-[#F1F5F9] font-mono">
                      +₹{previewTotals.variantExtra.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[#94A3B8]">
                  <span>Effective Seat Rate:</span>
                  <span className="text-[#F1F5F9] font-mono">
                    ₹{previewTotals.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#94A3B8]">
                  <span>Subtotal ({formData.quantity}x units):</span>
                  <span className="text-[#F1F5F9] font-mono">
                    ₹{previewTotals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {previewTotals.discountAmount > 0 && (
                  <div className="flex items-center justify-between text-[#34D399]">
                    <span>Discount Applied:</span>
                    <span className="font-mono">
                      -₹{previewTotals.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[#94A3B8]">
                  <span>Taxable Net Amount:</span>
                  <span className="text-[#F1F5F9] font-mono">
                    ₹{previewTotals.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#94A3B8]">
                  <span>Applicable GST / Tax:</span>
                  <span className="text-[#F1F5F9] font-mono">
                    +₹{previewTotals.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="pt-3 border-t border-[#263449] flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-[#F1F5F9]">Final Total:</span>
                  <div className="text-right">
                    <div className="text-xl font-bold text-[#38BDF8] tracking-tight">
                      ₹{previewTotals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <span className="text-[10px] text-[#94A3B8]">
                      / {formData.billing_period.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-[#263449] flex flex-col gap-2">
              <button
                type="button"
                disabled={loading || fetching}
                onClick={() => handleSubmit(false)}
                className="w-full h-10 rounded-lg bg-[#38BDF8] text-[#0B1020] text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#38BDF8]/90 transition-colors shadow-sm disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Creating...' : 'Create & Dispatch Quotation'}</span>
              </button>

              <button
                type="button"
                disabled={loading || fetching}
                onClick={() => handleSubmit(true)}
                className="w-full h-9 rounded-lg bg-[#172238] border border-[#263449] text-xs font-medium text-[#F1F5F9] flex items-center justify-center gap-2 hover:bg-[#263449] transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span>Save as Draft</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuotationModal;
