import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Search,
  Plus,
  Eye,
  Send,
  CheckCircle,
  XCircle,
  Repeat,
  Download
} from 'lucide-react';
import apiClient from '../api/apiClient';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/Toast';

export const QuotationsView = ({
  onOpenCreateModal,
  onOpenPdfModal,
  onNavigateToCustomer
}) => {
  const { showToast } = useToast();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [convertingId, setConvertingId] = useState(null);

  useEffect(() => {
    loadQuotations();
  }, [statusFilter]);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await apiClient.get('/staff/quotations', { params });
      if (res.data.success) {
        setQuotations(res.data.quotations || []);
      }
    } catch (err) {
      showToast('Error loading commercial quotations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadQuotations();
  };

  // Dispatch / Send
  const handleSend = async (quote) => {
    try {
      const res = await apiClient.post(`/staff/quotations/${quote.id}/send`);
      if (res.data.success) {
        showToast(`Quotation ${quote.quotation_number} dispatched to client.`);
        loadQuotations();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to dispatch quotation.', 'error');
    }
  };

  // Client Accept
  const handleAccept = async (quote) => {
    try {
      const res = await apiClient.post(`/staff/quotations/${quote.id}/accept`);
      if (res.data.success) {
        showToast(`Quotation ${quote.quotation_number} marked as ACCEPTED!`);
        loadQuotations();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to accept quotation.', 'error');
    }
  };

  // Client Reject
  const handleReject = async (quote) => {
    try {
      const res = await apiClient.post(`/staff/quotations/${quote.id}/reject`);
      if (res.data.success) {
        showToast(`Quotation ${quote.quotation_number} marked as REJECTED.`);
        loadQuotations();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reject quotation.', 'error');
    }
  };

  // Convert to Subscription
  const handleConvert = async (quote) => {
    if (quote.status !== 'ACCEPTED') {
      showToast('Only ACCEPTED quotations can be converted into subscriptions.', 'error');
      return;
    }

    if (quote.is_converted) {
      showToast('This quotation has already been converted.', 'error');
      return;
    }

    setConvertingId(quote.id);
    try {
      const res = await apiClient.post(`/staff/quotations/${quote.id}/convert`);
      if (res.data.success) {
        showToast(
          `Success! Converted to Subscription ${res.data.subscription_number} & generated Invoice ${res.data.invoice_number}!`
        );
        loadQuotations();
        if (onNavigateToCustomer) {
          onNavigateToCustomer(quote.customer_id);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Conversion failed.', 'error');
    } finally {
      setConvertingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full pt-2">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#263449]">
        <div>
          <h1 className="text-xl font-semibold text-[#F1F5F9] tracking-tight">Commercial Quotations</h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Create, price, dispatch, and convert proposals into recurring subscriptions
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#38BDF8] text-[#0B1020] text-xs font-semibold hover:bg-[#38BDF8]/90 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Quotation</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111B2E] border border-[#263449] p-3 rounded-xl">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-sm relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by quote # or customer..."
            className="w-full h-8 px-3 pl-8 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] placeholder:text-[#94A3B8]/60 text-xs outline-none focus:border-[#38BDF8]/60"
          />
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-2.5" />
        </form>

        {/* Status Pills */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {['ALL', 'DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'].map((st) => (
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

      {/* Quotations Table */}
      <div className="bg-[#111B2E] border border-[#263449] rounded-xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#263449] text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider bg-[#0E1526]/40">
                <th className="py-2.5 px-4 font-medium">Quote Number</th>
                <th className="py-2.5 px-3 font-medium">Customer</th>
                <th className="py-2.5 px-3 font-medium">Product / Plan</th>
                <th className="py-2.5 px-3 font-medium text-right">Total (₹)</th>
                <th className="py-2.5 px-3 font-medium">Validity</th>
                <th className="py-2.5 px-3 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263449] text-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#94A3B8]">
                    Loading commercial quotations...
                  </td>
                </tr>
              ) : quotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#94A3B8]">
                    No quotations found for this filter criteria.
                  </td>
                </tr>
              ) : (
                quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-[#172238]/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-[#F1F5F9]">
                      {q.quotation_number}
                      <span className="block text-[10px] text-[#94A3B8] font-sans font-normal">
                        {new Date(q.created_at).toLocaleDateString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-[#F1F5F9]">{q.company_name}</span>
                        <span className="text-[11px] text-[#94A3B8]">Attn: {q.customer_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-[#F1F5F9]">{q.product_name}</span>
                        <span className="text-[10px] text-[#94A3B8]">
                          {q.quantity} seats • {q.billing_period?.toLowerCase()}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-medium">
                      ₹{parseFloat(q.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-[#94A3B8]">
                      {new Date(q.validity_date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={q.status} />
                      {q.is_converted ? (
                        <span className="block text-[10px] text-[#34D399] font-medium mt-0.5">
                          Converted
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* PDF Preview */}
                        <button
                          onClick={() => onOpenPdfModal(q)}
                          className="px-2 py-1 rounded bg-[#172238] hover:bg-[#263449] border border-[#263449] text-xs font-medium text-[#F1F5F9] transition-colors inline-flex items-center gap-1"
                          title="Generate & View PDF"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#38BDF8]" />
                          <span>PDF</span>
                        </button>

                        {/* Dispatch if Draft */}
                        {q.status === 'DRAFT' && (
                          <button
                            onClick={() => handleSend(q)}
                            className="px-2.5 py-1 rounded bg-[#38BDF8]/10 hover:bg-[#38BDF8]/20 border border-[#38BDF8]/30 text-[#38BDF8] text-xs font-medium transition-colors inline-flex items-center gap-1"
                            title="Send Quotation to Client"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send</span>
                          </button>
                        )}

                        {/* Accept / Reject if Sent */}
                        {q.status === 'SENT' && (
                          <>
                            <button
                              onClick={() => handleAccept(q)}
                              className="p-1 rounded text-[#34D399] hover:bg-[#34D399]/10 transition-colors"
                              title="Mark Accepted"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(q)}
                              className="p-1 rounded text-[#F87171] hover:bg-[#F87171]/10 transition-colors"
                              title="Mark Rejected"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* Convert to Subscription if Accepted and NOT converted */}
                        {q.status === 'ACCEPTED' && !q.is_converted && (
                          <button
                            onClick={() => handleConvert(q)}
                            disabled={convertingId === q.id}
                            className="px-2.5 py-1 rounded bg-[#34D399] hover:bg-[#34D399]/90 text-[#0B1020] font-semibold text-xs transition-colors inline-flex items-center gap-1"
                            title="Convert accepted quote into active subscription"
                          >
                            <Repeat className="w-3.5 h-3.5" />
                            <span>{convertingId === q.id ? 'Converting...' : 'Convert'}</span>
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
          <span>Total Quotations: {quotations.length}</span>
          <span className="font-mono text-[11px]">Commercial Proposals Engine</span>
        </div>
      </div>
    </div>
  );
};

export default QuotationsView;
