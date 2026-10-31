import React, { useState, useEffect } from 'react';
import { X, CreditCard } from 'lucide-react';
import apiClient from '../api/apiClient';
import { useToast } from './Toast';

export const RecordPaymentModal = ({ isOpen, onClose, defaultInvoiceId = null, onSuccess }) => {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    invoice_id: '',
    amount: '',
    payment_method: 'UPI',
    payment_date: new Date().toISOString().split('T')[0],
    transaction_reference: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadUnpaidInvoices();
    }
  }, [isOpen, defaultInvoiceId]);

  const loadUnpaidInvoices = async () => {
    try {
      setFetching(true);
      const res = await apiClient.get('/staff/invoices?status=CONFIRMED');
      if (res.data.success) {
        const eligible = (res.data.invoices || []).filter((i) => parseFloat(i.outstanding_amount) > 0);
        setInvoices(eligible);

        if (defaultInvoiceId) {
          const matched = eligible.find((i) => i.id === parseInt(defaultInvoiceId, 10));
          if (matched) {
            handleInvoiceSelect(matched);
          }
        } else if (eligible.length > 0) {
          handleInvoiceSelect(eligible[0]);
        }
      }
    } catch (err) {
      showToast('Failed to load unpaid invoices.', 'error');
    } finally {
      setFetching(false);
    }
  };

  const handleInvoiceSelect = (inv) => {
    setSelectedInvoice(inv);
    setFormData((prev) => ({
      ...prev,
      invoice_id: inv.id,
      amount: inv.outstanding_amount
    }));
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.invoice_id || !formData.amount || !formData.payment_method) {
      showToast('Please complete all required payment fields.', 'error');
      return;
    }

    const payVal = parseFloat(formData.amount);
    if (isNaN(payVal) || payVal <= 0) {
      showToast('Amount must be greater than zero.', 'error');
      return;
    }

    if (selectedInvoice && payVal > parseFloat(selectedInvoice.outstanding_amount)) {
      showToast(
        `Payment (₹${payVal}) cannot exceed invoice balance (₹${selectedInvoice.outstanding_amount}).`,
        'error'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/staff/payments', formData);
      if (res.data.success) {
        showToast(
          `Payment ${res.data.payment_number} recorded! Receipt ${res.data.receipt_number} issued.`
        );
        onSuccess && onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to record payment.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#111B2E] border border-[#263449] rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#263449] bg-[#0E1526]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#172238] border border-[#263449] flex items-center justify-center text-[#38BDF8]">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#F1F5F9]">Record Customer Payment</h3>
              <p className="text-xs text-[#94A3B8]">Record manual collection and issue verified receipt</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
          {/* Invoice Select */}
          <div>
            <label className="block text-[#94A3B8] font-medium mb-1">
              Select Invoice to Settle *
            </label>
            {fetching ? (
              <div className="text-xs text-[#94A3B8]">Loading invoices...</div>
            ) : invoices.length === 0 ? (
              <div className="p-3 rounded-lg bg-[#0E1526] border border-[#263449] text-xs text-[#FBBF24]">
                No outstanding invoices found. All current accounts are settled.
              </div>
            ) : (
              <select
                required
                value={formData.invoice_id}
                onChange={(e) => {
                  const inv = invoices.find((i) => i.id === parseInt(e.target.value, 10));
                  if (inv) handleInvoiceSelect(inv);
                }}
                className="w-full h-9 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] outline-none focus:border-[#38BDF8]/60"
              >
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoice_number} – {inv.company_name} (Outstanding: ₹
                    {parseFloat(inv.outstanding_amount).toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Selected Invoice Preview Banner */}
          {selectedInvoice && (
            <div className="p-3 rounded-lg bg-[#0E1526] border border-[#263449] flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-[#94A3B8] uppercase font-medium block">
                  Target Account
                </span>
                <span className="font-semibold text-[#F1F5F9]">{selectedInvoice.company_name}</span>
                <span className="text-[#94A3B8] block text-[11px]">
                  Contact: {selectedInvoice.customer_name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#94A3B8] uppercase font-medium block">
                  Outstanding Due
                </span>
                <span className="font-bold text-[#F87171] text-sm">
                  ₹{parseFloat(selectedInvoice.outstanding_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          {/* Amount & Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[#94A3B8] font-medium mb-1">
                Settlement Amount (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="1"
                max={selectedInvoice ? selectedInvoice.outstanding_amount : undefined}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full h-9 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] font-medium outline-none focus:border-[#38BDF8]/60"
              />
            </div>

            <div>
              <label className="block text-[#94A3B8] font-medium mb-1">
                Payment Method *
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full h-9 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] outline-none focus:border-[#38BDF8]/60"
              >
                <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                <option value="Bank Transfer">Bank Transfer (NEFT / RTGS / IMPS)</option>
                <option value="Card">Corporate Credit / Debit Card</option>
                <option value="Cash">Cash Deposit</option>
                <option value="Other">Other Gateway</option>
              </select>
            </div>
          </div>

          {/* Date & Transaction Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[#94A3B8] font-medium mb-1">
                Payment Date *
              </label>
              <input
                type="date"
                required
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                className="w-full h-9 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] outline-none focus:border-[#38BDF8]/60"
              />
            </div>

            <div>
              <label className="block text-[#94A3B8] font-medium mb-1">
                UTR / Reference Number
              </label>
              <input
                type="text"
                placeholder="e.g. UTR-HDFC-998273"
                value={formData.transaction_reference}
                onChange={(e) => setFormData({ ...formData, transaction_reference: e.target.value })}
                className="w-full h-9 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] outline-none focus:border-[#38BDF8]/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#94A3B8] font-medium mb-1">
              Internal Reconciliation Notes
            </label>
            <input
              type="text"
              placeholder="Verified against bank statement by operations staff"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full h-9 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] outline-none focus:border-[#38BDF8]/60"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#263449]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg bg-[#172238] border border-[#263449] text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedInvoice}
              className="px-4 py-2 rounded-lg bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-[#0B1020] font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Recording...' : 'Record Payment & Issue Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordPaymentModal;
