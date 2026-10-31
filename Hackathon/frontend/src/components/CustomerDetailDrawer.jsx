import React, { useState, useEffect } from 'react';
import {
  X,
  Building,
  Mail,
  Phone,
  FileSpreadsheet,
  Repeat,
  Receipt,
  CreditCard,
  History
} from 'lucide-react';
import apiClient from '../api/apiClient';
import StatusBadge from './StatusBadge';
import { useToast } from './Toast';

export const CustomerDetailDrawer = ({ customerId, isOpen, onClose, onCreateQuote, onRecordPayment }) => {
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('subscriptions');

  useEffect(() => {
    if (isOpen && customerId) {
      loadCustomerDetails();
    }
  }, [isOpen, customerId]);

  const loadCustomerDetails = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/staff/customers/${customerId}`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      showToast('Failed to load customer details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubscriptionStatus = async (subId, newStatus) => {
    try {
      const res = await apiClient.put(`/staff/subscriptions/${subId}/status`, { status: newStatus });
      if (res.data.success) {
        showToast(res.data.message || `Subscription status updated to ${newStatus}.`);
        loadCustomerDetails();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Status update failed.', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl h-full bg-[#111B2E] border-l border-[#263449] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-[#263449] flex items-center justify-between bg-[#0E1526]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#172238] border border-[#263449] flex items-center justify-center font-semibold text-[#38BDF8] text-xs">
              {data?.customer?.company_name?.substring(0, 2).toUpperCase() || 'CU'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[#F1F5F9] text-sm">
                  {data?.customer?.company_name || 'Loading...'}
                </h3>
                {data?.customer?.status && <StatusBadge status={data.customer.status} />}
              </div>
              <p className="text-xs text-[#94A3B8]">
                {data?.customer?.customer_code} • Contact: {data?.customer?.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-xs text-[#94A3B8]">
            Loading customer intelligence profile...
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Quick Stats Overview Banner */}
            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-lg bg-[#0E1526] border border-[#263449]">
              <div>
                <span className="text-[10px] text-[#94A3B8] uppercase font-medium block">
                  Outstanding Balance
                </span>
                <span className={`text-base font-bold ${parseFloat(data?.customer?.outstanding_balance) > 0 ? 'text-[#F87171]' : 'text-[#34D399]'}`}>
                  ₹{parseFloat(data?.customer?.outstanding_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#94A3B8] uppercase font-medium block">
                  Active Subscriptions
                </span>
                <span className="text-base font-bold text-[#F1F5F9]">
                  {(data?.subscriptions || []).filter((s) => s.status === 'ACTIVE').length}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#94A3B8] uppercase font-medium block">
                  Quotations
                </span>
                <span className="text-base font-bold text-[#38BDF8]">
                  {(data?.quotations || []).length}
                </span>
              </div>
            </div>

            {/* Basic Info & Contact Details */}
            <div className="p-3.5 rounded-lg bg-[#0E1526] border border-[#263449] space-y-2 text-xs">
              <h4 className="font-semibold text-[#F1F5F9] text-xs flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Contact & Tax Details</span>
              </h4>
              <div className="grid grid-cols-2 gap-2.5 text-[#94A3B8] pt-1">
                <div>
                  <span className="text-[10px] text-[#94A3B8]/70 block">Email:</span>
                  <span className="text-[#F1F5F9]">{data?.customer?.email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#94A3B8]/70 block">Phone:</span>
                  <span className="text-[#F1F5F9]">{data?.customer?.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#94A3B8]/70 block">Address:</span>
                  <span className="text-[#F1F5F9]">{data?.customer?.address}, {data?.customer?.city}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#94A3B8]/70 block">GSTIN:</span>
                  <span className="font-mono text-[#F1F5F9]">{data?.customer?.gst_number || 'Unregistered'}</span>
                </div>
              </div>
            </div>

            {/* Sub-Nav Tabs */}
            <div className="flex items-center gap-1 border-b border-[#263449] pb-2 text-xs">
              <button
                onClick={() => setActiveSubTab('subscriptions')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${activeSubTab === 'subscriptions'
                    ? 'bg-[#172238] text-[#38BDF8] border border-[#263449]'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                  }`}
              >
                Subscriptions ({data?.subscriptions?.length || 0})
              </button>
              <button
                onClick={() => setActiveSubTab('quotations')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${activeSubTab === 'quotations'
                    ? 'bg-[#172238] text-[#38BDF8] border border-[#263449]'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                  }`}
              >
                Quotations ({data?.quotations?.length || 0})
              </button>
              <button
                onClick={() => setActiveSubTab('invoices')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${activeSubTab === 'invoices'
                    ? 'bg-[#172238] text-[#38BDF8] border border-[#263449]'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                  }`}
              >
                Invoices ({data?.invoices?.length || 0})
              </button>
              <button
                onClick={() => setActiveSubTab('payments')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${activeSubTab === 'payments'
                    ? 'bg-[#172238] text-[#38BDF8] border border-[#263449]'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                  }`}
              >
                Payments ({data?.payments?.length || 0})
              </button>
            </div>

            {/* Subscriptions */}
            {activeSubTab === 'subscriptions' && (
              <div className="space-y-2.5">
                {data?.subscriptions?.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#94A3B8] bg-[#0E1526] rounded-lg">
                    No active or previous subscriptions found for this account.
                  </div>
                ) : (
                  data?.subscriptions?.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3.5 rounded-lg bg-[#0E1526] border border-[#263449] flex flex-col gap-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium text-[#F1F5F9]">
                              {sub.subscription_number}
                            </span>
                            <StatusBadge status={sub.status} />
                          </div>
                          <span className="text-[11px] text-[#38BDF8] block font-medium mt-0.5">
                            {sub.product_name || 'Brightloop License'} {sub.plan_name ? `• ${sub.plan_name}` : ''}
                          </span>
                          <span className="text-[10px] text-[#94A3B8] block mt-0.5">
                            Billing Period: {sub.billing_period} • Next Billing:{' '}
                            {sub.next_billing_date ? new Date(sub.next_billing_date).toLocaleDateString('en-IN') : 'N/A'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium text-[#F1F5F9] block">
                            ₹{parseFloat(sub.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] text-[#94A3B8] block">
                            Contract End: {sub.expiry_date ? new Date(sub.expiry_date).toLocaleDateString('en-IN') : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Subscription Operational Controls */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#263449]/60">
                        <span className="text-[10px] text-[#94A3B8]">
                          Cycle: {sub.billing_period?.toLowerCase()}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {sub.status === 'ACTIVE' && (
                            <>
                              <button
                                onClick={() => handleUpdateSubscriptionStatus(sub.id, 'PAUSED')}
                                className="px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-medium transition-colors"
                              >
                                Pause
                              </button>
                              <button
                                onClick={() => handleUpdateSubscriptionStatus(sub.id, 'CLOSED')}
                                className="px-2 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-medium transition-colors"
                              >
                                Close
                              </button>
                            </>
                          )}
                          {sub.status === 'PAUSED' && (
                            <>
                              <button
                                onClick={() => handleUpdateSubscriptionStatus(sub.id, 'ACTIVE')}
                                className="px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium transition-colors"
                              >
                                Resume
                              </button>
                              <button
                                onClick={() => handleUpdateSubscriptionStatus(sub.id, 'CLOSED')}
                                className="px-2 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-medium transition-colors"
                              >
                                Close
                              </button>
                            </>
                          )}
                          {(sub.status === 'DRAFT' || sub.status === 'CONFIRMED' || sub.status === 'QUOTATION') && (
                            <button
                              onClick={() => handleUpdateSubscriptionStatus(sub.id, 'ACTIVE')}
                              className="px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium transition-colors"
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Quotations */}
            {activeSubTab === 'quotations' && (
              <div className="space-y-2.5">
                {data?.quotations?.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#94A3B8] bg-[#0E1526] rounded-lg">
                    No quotations on record for this customer.
                  </div>
                ) : (
                  data?.quotations?.map((q) => (
                    <div
                      key={q.id}
                      className="p-3 rounded-lg bg-[#0E1526] border border-[#263449] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-[#F1F5F9]">
                            {q.quotation_number}
                          </span>
                          <StatusBadge status={q.status} />
                        </div>
                        <span className="text-[11px] text-[#94A3B8] block mt-0.5">
                          Valid Until: {new Date(q.validity_date).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-[#38BDF8]">
                          ₹{parseFloat(q.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-[#94A3B8] block">
                          {q.is_converted ? 'Converted' : 'Draft/Pending'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Invoices */}
            {activeSubTab === 'invoices' && (
              <div className="space-y-2.5">
                {data?.invoices?.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#94A3B8] bg-[#0E1526] rounded-lg">
                    No billing invoices generated yet.
                  </div>
                ) : (
                  data?.invoices?.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3 rounded-lg bg-[#0E1526] border border-[#263449] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-[#F1F5F9]">
                            {inv.invoice_number}
                          </span>
                          <StatusBadge status={inv.status} />
                        </div>
                        <span className="text-[11px] text-[#94A3B8] block mt-0.5">
                          Due Date: {new Date(inv.due_date).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-[#F1F5F9]">
                          ₹{parseFloat(inv.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-[#FBBF24] block">
                          Due: ₹{parseFloat(inv.outstanding_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Payments */}
            {activeSubTab === 'payments' && (
              <div className="space-y-2.5">
                {data?.payments?.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#94A3B8] bg-[#0E1526] rounded-lg">
                    No payment transactions recorded for this account.
                  </div>
                ) : (
                  data?.payments?.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-lg bg-[#0E1526] border border-[#263449] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-[#F1F5F9]">
                            {p.payment_number}
                          </span>
                          <span className="text-[11px] text-[#94A3B8]">({p.payment_method})</span>
                        </div>
                        <span className="text-[11px] text-[#94A3B8] block mt-0.5">
                          Receipt: {p.receipt_number} • Date:{' '}
                          {new Date(p.payment_date).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-[#34D399]">
                          ₹{parseFloat(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Drawer Footer */}
        <div className="px-6 py-3 border-t border-[#263449] bg-[#0E1526] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#172238] hover:bg-[#263449] border border-[#263449] text-[#F1F5F9] font-medium text-xs transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailDrawer;
