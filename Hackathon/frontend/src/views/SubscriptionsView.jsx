import React, { useState, useEffect } from 'react';
import {
  Repeat,
  Search,
  Eye,
  Calendar,
  X,
  ArrowRight,
  Plus,
  Play,
  Pause,
  AlertCircle
} from 'lucide-react';
import apiClient from '../api/apiClient';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/Toast';

export const SubscriptionsView = ({ onNavigateToInvoices }) => {
  const { showToast } = useToast();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Details Modal
  const [selectedSub, setSelectedSub] = useState(null);
  const [subDetails, setSubDetails] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Create Subscription Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [catalog, setCatalog] = useState({ products: [], plans: [] });
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: '',
    product_id: '',
    plan_id: '',
    quantity: 1,
    billing_period: 'ANNUAL',
    start_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    loadSubscriptions();
  }, [statusFilter]);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await apiClient.get('/staff/subscriptions', { params });
      if (res.data.success) {
        setSubscriptions(res.data.subscriptions || []);
      }
    } catch (err) {
      showToast('Failed to load subscriptions.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadSubscriptions();
  };

  const openDetailsModal = async (sub) => {
    setSelectedSub(sub);
    setModalLoading(true);
    try {
      const res = await apiClient.get(`/staff/subscriptions/${sub.id}`);
      if (res.data.success) {
        setSubDetails(res.data);
      }
    } catch (err) {
      showToast('Failed to load subscription details.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const openCreateModal = async () => {
    setIsCreateOpen(true);
    try {
      const [catRes, custRes] = await Promise.all([
        apiClient.get('/staff/catalogs'),
        apiClient.get('/staff/customers')
      ]);
      if (catRes.data.success) {
        setCatalog(catRes.data);
        if (catRes.data.products?.length > 0) {
          setFormData((prev) => ({
            ...prev,
            product_id: prev.product_id || catRes.data.products[0].id,
            plan_id: prev.plan_id || catRes.data.plans?.[0]?.id || ''
          }));
        }
      }
      if (custRes.data.success) {
        setCustomers(custRes.data.customers || []);
        if (custRes.data.customers?.length > 0) {
          setFormData((prev) => ({
            ...prev,
            customer_id: prev.customer_id || custRes.data.customers[0].id
          }));
        }
      }
    } catch (err) {
      showToast('Failed to load setup catalogs.', 'error');
    }
  };

  const handleCreateSubscription = async (e) => {
    e.preventDefault();
    if (!formData.customer_id || !formData.product_id || !formData.plan_id) {
      showToast('Please select customer, product, and tier plan.', 'error');
      return;
    }

    try {
      setCreateLoading(true);
      const res = await apiClient.post('/staff/subscriptions', formData);
      if (res.data.success) {
        showToast(res.data.message || 'Subscription provisioned successfully!');
        setIsCreateOpen(false);
        loadSubscriptions();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create subscription.', 'error');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateStatus = async (subId, newStatus) => {
    try {
      const res = await apiClient.put(`/staff/subscriptions/${subId}/status`, { status: newStatus });
      if (res.data.success) {
        showToast(res.data.message);
        loadSubscriptions();
        if (selectedSub) {
          setSelectedSub(null);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Status update failed.', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full pt-2">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#263449]">
        <div>
          <h1 className="text-xl font-semibold text-[#F1F5F9] tracking-tight">Subscription Contracts</h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Monitor active subscriptions, renewal dates, and billing schedules
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#38BDF8] text-[#0B1020] text-xs font-semibold hover:bg-[#38BDF8]/90 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Subscription</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111B2E] border border-[#263449] p-3 rounded-xl">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-sm relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subscription #, customer..."
            className="w-full h-8 px-3 pl-8 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] placeholder:text-[#94A3B8]/60 text-xs outline-none focus:border-[#38BDF8]/60"
          />
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-2.5" />
        </form>

        <div className="flex items-center gap-1 overflow-x-auto">
          {['ALL', 'ACTIVE', 'PAUSED', 'CONFIRMED', 'QUOTATION', 'CLOSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-[#172238] text-[#38BDF8] border border-[#263449]'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#172238]/60'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-[#111B2E] border border-[#263449] rounded-xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#263449] text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider bg-[#0E1526]/40">
                <th className="py-2.5 px-4 font-medium">Subscription ID</th>
                <th className="py-2.5 px-3 font-medium">Customer Account</th>
                <th className="py-2.5 px-3 font-medium">Product & Tier</th>
                <th className="py-2.5 px-3 font-medium text-right">Recurring Fee (₹)</th>
                <th className="py-2.5 px-3 font-medium">Renewal Date</th>
                <th className="py-2.5 px-3 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263449] text-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#94A3B8]">
                    Loading subscription contracts...
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#94A3B8]">
                    No subscriptions match this filter criteria.
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#172238]/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-[#F1F5F9]">
                      {sub.subscription_number}
                      <span className="block text-[10px] text-[#94A3B8] font-sans font-normal">
                        Started {new Date(sub.start_date).toLocaleDateString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-[#F1F5F9]">{sub.company_name}</span>
                        <span className="text-[11px] text-[#94A3B8]">{sub.customer_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-[#F1F5F9]">{sub.product_name}</span>
                        <span className="text-[10px] text-[#94A3B8]">
                          {sub.plan_name || 'Standard'} • {sub.billing_period?.toLowerCase()}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-medium">
                      ₹{parseFloat(sub.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-[#94A3B8]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <span>{new Date(sub.expiry_date).toLocaleDateString('en-IN')}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openDetailsModal(sub)}
                          className="px-2 py-1 rounded bg-[#172238] hover:bg-[#263449] border border-[#263449] text-xs font-medium text-[#F1F5F9] transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#38BDF8]" />
                          <span>Details</span>
                        </button>
                        {sub.status === 'ACTIVE' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(sub.id, 'PAUSED')}
                              className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-medium transition-colors"
                              title="Pause Subscription"
                            >
                              Pause
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(sub.id, 'CLOSED')}
                              className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition-colors"
                              title="Close Subscription"
                            >
                              Close
                            </button>
                          </>
                        )}
                        {sub.status === 'PAUSED' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(sub.id, 'ACTIVE')}
                              className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-colors"
                              title="Resume Subscription"
                            >
                              Resume
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(sub.id, 'CLOSED')}
                              className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition-colors"
                              title="Close Subscription"
                            >
                              Close
                            </button>
                          </>
                        )}
                        {(sub.status === 'DRAFT' || sub.status === 'CONFIRMED' || sub.status === 'QUOTATION') && (
                          <button
                            onClick={() => handleUpdateStatus(sub.id, 'ACTIVE')}
                            className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-colors"
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-[#0E1526]/30 border-t border-[#263449] flex items-center justify-between text-xs text-[#94A3B8]">
          <span>Active Subscriptions: {subscriptions.length}</span>
          <span className="font-mono text-[11px]">SLA: 99.99% Availability</span>
        </div>
      </div>

      {/* Subscription Details Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-[#111B2E] border border-[#263449] rounded-xl shadow-2xl p-6 overflow-hidden">
            <div className="flex justify-between items-center pb-3 border-b border-[#263449] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#172238] border border-[#263449] flex items-center justify-center text-[#38BDF8]">
                  <Repeat className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#F1F5F9]">
                    Subscription: {selectedSub.subscription_number}
                  </h3>
                  <p className="text-xs text-[#94A3B8]">{selectedSub.company_name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalLoading ? (
              <div className="py-12 text-center text-xs text-[#94A3B8]">Loading details...</div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Meta Grid */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-[#0E1526] border border-[#263449]">
                  <div>
                    <span className="text-[10px] text-[#94A3B8] uppercase font-medium block">Plan / Product</span>
                    <span className="font-semibold text-[#F1F5F9]">{subDetails?.subscription?.product_name}</span>
                    <span className="text-[#38BDF8] block text-[11px]">{subDetails?.subscription?.plan_name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#94A3B8] uppercase font-medium block">Contract Valuation</span>
                    <span className="font-bold text-[#F1F5F9]">
                      ₹{parseFloat(subDetails?.subscription?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[#94A3B8] block text-[11px] capitalize">Cycle: {subDetails?.subscription?.billing_period}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#94A3B8] uppercase font-medium block">Start Date</span>
                    <span className="text-[#F1F5F9]">{subDetails?.subscription?.start_date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#94A3B8] uppercase font-medium block">Renewal Date</span>
                    <span className="text-[#F1F5F9]">{subDetails?.subscription?.expiry_date}</span>
                  </div>
                </div>

                {/* Associated Invoices */}
                <div>
                  <h4 className="font-semibold text-[#F1F5F9] text-xs mb-2">Billing Schedule & Invoices</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {subDetails?.invoices?.length === 0 ? (
                      <div className="p-3 text-center text-[#94A3B8] bg-[#0E1526] rounded-lg">
                        No invoices generated for this subscription.
                      </div>
                    ) : (
                      subDetails?.invoices?.map((inv) => (
                        <div
                          key={inv.id}
                          className="p-3 rounded-lg bg-[#0E1526] border border-[#263449] flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-mono font-medium text-[#F1F5F9]">{inv.invoice_number}</span>
                            <span className="text-[#94A3B8] block text-[10px]">
                              Due: {new Date(inv.due_date).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-medium text-[#F1F5F9]">
                              ₹{parseFloat(inv.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                            <div className="mt-0.5">
                              <StatusBadge status={inv.status} />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-[#263449]">
                  <div className="flex items-center gap-2">
                    {subDetails?.subscription?.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleUpdateStatus(subDetails.subscription.id, 'PAUSED')}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-medium transition-colors"
                      >
                        Pause Contract
                      </button>
                    )}
                    {subDetails?.subscription?.status === 'PAUSED' && (
                      <button
                        onClick={() => handleUpdateStatus(subDetails.subscription.id, 'ACTIVE')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-colors"
                      >
                        Resume Contract
                      </button>
                    )}
                    {subDetails?.subscription?.status !== 'CLOSED' && (
                      <button
                        onClick={() => handleUpdateStatus(subDetails.subscription.id, 'CLOSED')}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition-colors"
                      >
                        Terminate
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedSub(null)}
                      className="px-3.5 py-2 rounded-lg bg-[#172238] border border-[#263449] text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSub(null);
                        onNavigateToInvoices && onNavigateToInvoices();
                      }}
                      className="px-4 py-2 rounded-lg bg-[#38BDF8] text-[#0B1020] font-semibold hover:bg-[#38BDF8]/90 transition-colors"
                    >
                      View Invoices
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Subscription Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#111B2E] border border-[#263449] rounded-xl shadow-2xl p-6 overflow-hidden">
            <div className="flex justify-between items-center pb-3 border-b border-[#263449] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#172238] border border-[#263449] flex items-center justify-center text-[#38BDF8]">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#F1F5F9]">Provision New Subscription</h3>
                  <p className="text-xs text-[#94A3B8]">Deploy recurring contract and issue initial invoice</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubscription} className="space-y-4 text-xs">
              {/* Customer Selection */}
              <div>
                <label className="block text-[#94A3B8] mb-1 font-medium">Customer Account *</label>
                <select
                  required
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] text-xs outline-none focus:border-[#38BDF8]/60"
                >
                  <option value="">Select customer...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name} ({c.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Product & Plan Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] mb-1 font-medium">Product *</label>
                  <select
                    required
                    value={formData.product_id}
                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] text-xs outline-none focus:border-[#38BDF8]/60"
                  >
                    <option value="">Select product...</option>
                    {catalog.products?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{parseFloat(p.base_price).toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#94A3B8] mb-1 font-medium">Subscription Tier *</label>
                  <select
                    required
                    value={formData.plan_id}
                    onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] text-xs outline-none focus:border-[#38BDF8]/60"
                  >
                    <option value="">Select tier plan...</option>
                    {catalog.plans?.map((pl) => (
                      <option key={pl.id} value={pl.id}>
                        {pl.name} ({pl.billing_interval})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Billing Cycle & Quantity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] mb-1 font-medium">Billing Period</label>
                  <select
                    value={formData.billing_period}
                    onChange={(e) => setFormData({ ...formData, billing_period: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] text-xs outline-none focus:border-[#38BDF8]/60"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="ANNUAL">Annual (12 Months)</option>
                    <option value="MULTI_YEAR">Multi-Year (24 Months)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#94A3B8] mb-1 font-medium">Seat / License Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full h-9 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] text-xs outline-none focus:border-[#38BDF8]/60"
                  />
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-[#94A3B8] mb-1 font-medium">Effective Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] text-xs outline-none focus:border-[#38BDF8]/60"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[#94A3B8] mb-1 font-medium">Internal Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Approved under Enterprise Q4 bundle"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] text-xs outline-none focus:border-[#38BDF8]/60"
                />
              </div>

              {/* Summary Box */}
              <div className="p-3 rounded-lg bg-[#0E1526] border border-[#263449] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#94A3B8] block text-[11px]">Initial Invoiced Amount</span>
                  <span className="font-semibold text-[#38BDF8] text-sm">
                    ₹
                    {(
                      (parseFloat(catalog.products?.find((p) => String(p.id) === String(formData.product_id))?.base_price || 4999)) *
                      (parseInt(formData.quantity) || 1)
                    ).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <span className="text-[10px] text-[#94A3B8] px-2 py-0.5 rounded bg-[#172238] border border-[#263449]">
                  Status: ACTIVE + Auto INV
                </span>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#263449]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-[#172238] border border-[#263449] text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 rounded-lg bg-[#38BDF8] text-[#0B1020] font-semibold hover:bg-[#38BDF8]/90 transition-colors shadow-sm disabled:opacity-50"
                >
                  {createLoading ? 'Provisioning...' : 'Provision Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsView;
