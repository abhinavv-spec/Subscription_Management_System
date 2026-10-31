import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  CreditCard,
  Calendar
} from 'lucide-react';
import apiClient from '../api/apiClient';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/Toast';

export const InvoicesView = ({ onOpenPdfModal, onRecordPayment }) => {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadInvoices();
  }, [statusFilter]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await apiClient.get('/staff/invoices', { params });
      if (res.data.success) {
        setInvoices(res.data.invoices || []);
      }
    } catch (err) {
      showToast('Error loading invoices.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadInvoices();
  };

  const handleConfirm = async (inv) => {
    try {
      const res = await apiClient.put(`/staff/invoices/${inv.id}/confirm`);
      if (res.data.success) {
        showToast(`Invoice ${inv.invoice_number} confirmed for client billing.`);
        loadInvoices();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Confirmation failed.', 'error');
    }
  };

  const handleCancel = async (inv) => {
    if (!window.confirm(`Are you sure you want to cancel Invoice ${inv.invoice_number}? This will adjust the customer balance.`)) {
      return;
    }
    try {
      const res = await apiClient.put(`/staff/invoices/${inv.id}/cancel`);
      if (res.data.success) {
        showToast(`Invoice ${inv.invoice_number} cancelled.`);
        loadInvoices();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Cancellation failed.', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full pt-2">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#263449]">
        <div>
          <h1 className="text-xl font-semibold text-[#F1F5F9] tracking-tight">Invoices & Billing</h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Dispatch, track settlement, and generate GST-compliant tax invoices
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111B2E] border border-[#263449] p-3 rounded-xl">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-sm relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice #, customer..."
            className="w-full h-8 px-3 pl-8 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] placeholder:text-[#94A3B8]/60 text-xs outline-none focus:border-[#38BDF8]/60"
          />
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-2.5" />
        </form>

        <div className="flex items-center gap-1 overflow-x-auto">
          {['ALL', 'CONFIRMED', 'PAID', 'DRAFT', 'CANCELLED'].map((st) => (
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

      {/* Invoices Table */}
      <div className="bg-[#111B2E] border border-[#263449] rounded-xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#263449] text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider bg-[#0E1526]/40">
                <th className="py-2.5 px-4 font-medium">Invoice #</th>
                <th className="py-2.5 px-3 font-medium">Customer Account</th>
                <th className="py-2.5 px-3 font-medium">Subscription</th>
                <th className="py-2.5 px-3 font-medium">Due Date</th>
                <th className="py-2.5 px-3 font-medium text-right">Total (₹)</th>
                <th className="py-2.5 px-3 font-medium text-right">Outstanding (₹)</th>
                <th className="py-2.5 px-3 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263449] text-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[#94A3B8]">
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[#94A3B8]">
                    No invoices match this filter criteria.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#172238]/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-[#F1F5F9]">
                      {inv.invoice_number}
                      <span className="block text-[10px] text-[#94A3B8] font-sans font-normal">
                        {new Date(inv.invoice_date).toLocaleDateString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-[#F1F5F9]">{inv.company_name}</span>
                        <span className="text-[11px] text-[#94A3B8]">{inv.customer_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[#38BDF8]">
                      {inv.subscription_number || 'Direct Order'}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <span className={inv.isPastDue ? 'text-[#F87171] font-medium' : 'text-[#F1F5F9]'}>
                          {new Date(inv.due_date).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      {inv.isPastDue && (
                        <span className="text-[10px] text-[#F87171] font-medium block">
                          {inv.daysOverdue}d overdue
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-[#F1F5F9]">
                      ₹{parseFloat(inv.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`font-semibold ${
                          parseFloat(inv.outstanding_amount) <= 0.01
                            ? 'text-[#34D399]'
                            : 'text-[#FBBF24]'
                        }`}
                      >
                        ₹{parseFloat(inv.outstanding_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenPdfModal(inv)}
                          className="px-2 py-1 rounded bg-[#172238] hover:bg-[#263449] border border-[#263449] text-xs font-medium text-[#F1F5F9] transition-colors inline-flex items-center gap-1"
                          title="View PDF / Print Invoice"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#38BDF8]" />
                          <span>PDF</span>
                        </button>

                        {inv.status === 'DRAFT' && (
                          <button
                            onClick={() => handleConfirm(inv)}
                            className="p-1 rounded text-[#38BDF8] hover:bg-[#38BDF8]/10 transition-colors"
                            title="Confirm Invoice"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleCancel(inv)}
                            className="p-1 rounded text-[#94A3B8] hover:text-[#F87171] transition-colors"
                            title="Cancel Invoice"
                          >
                            <XCircle className="w-4 h-4" />
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
          <span>Total Invoices: {invoices.length}</span>
          <span className="font-mono text-[11px]">Audit Engine Active</span>
        </div>
      </div>
    </div>
  );
};

export default InvoicesView;
