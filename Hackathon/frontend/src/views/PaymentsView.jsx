import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Plus,
  Eye,
  FileCheck
} from 'lucide-react';
import apiClient from '../api/apiClient';
import { useToast } from '../components/Toast';

export const PaymentsView = ({ onOpenRecordPayment, onOpenReceiptModal }) => {
  const { showToast } = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/staff/payments');
      if (res.data.success) {
        setPayments(res.data.payments || []);
      }
    } catch (err) {
      showToast('Error loading payment records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filtered = payments.filter((p) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      (p.payment_number && p.payment_number.toLowerCase().includes(s)) ||
      (p.company_name && p.company_name.toLowerCase().includes(s)) ||
      (p.invoice_number && p.invoice_number.toLowerCase().includes(s)) ||
      (p.transaction_reference && p.transaction_reference.toLowerCase().includes(s))
    );
  });

  return (
    <div className="flex flex-col gap-5 w-full pt-2">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#263449]">
        <div>
          <h1 className="text-xl font-semibold text-[#F1F5F9] tracking-tight">Payment Processing</h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Record manual settlements, verify transaction references, and generate receipts
          </p>
        </div>

        <button
          onClick={onOpenRecordPayment}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#38BDF8] text-[#0B1020] text-xs font-semibold hover:bg-[#38BDF8]/90 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Payment</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between bg-[#111B2E] border border-[#263449] p-3 rounded-xl">
        <div className="flex-1 max-w-sm relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by receipt #, invoice, UTR, customer..."
            className="w-full h-8 px-3 pl-8 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] placeholder:text-[#94A3B8]/60 text-xs outline-none focus:border-[#38BDF8]/60"
          />
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-[#111B2E] border border-[#263449] rounded-xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#263449] text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider bg-[#0E1526]/40">
                <th className="py-2.5 px-4 font-medium">Receipt & Payment #</th>
                <th className="py-2.5 px-3 font-medium">Customer Account</th>
                <th className="py-2.5 px-3 font-medium">Invoice Settled</th>
                <th className="py-2.5 px-3 font-medium">Payment Method</th>
                <th className="py-2.5 px-3 font-medium">Transaction Reference</th>
                <th className="py-2.5 px-3 font-medium text-right">Amount Paid (₹)</th>
                <th className="py-2.5 px-4 font-medium text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263449] text-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#94A3B8]">
                    Loading payment records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#94A3B8]">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-[#172238]/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-[#F1F5F9]">
                      {p.receipt_number || p.payment_number}
                      <span className="block text-[10px] text-[#94A3B8] font-sans font-normal">
                        {new Date(p.payment_date).toLocaleDateString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-[#F1F5F9]">{p.company_name}</span>
                        <span className="text-[11px] text-[#94A3B8]">{p.customer_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[#38BDF8]">
                      {p.invoice_number}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#172238] border border-[#263449] text-[#F1F5F9]">
                        {p.payment_method}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[#94A3B8]">
                      {p.transaction_reference || 'Bank Settlement'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="font-semibold text-[#34D399]">
                        ₹{parseFloat(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onOpenReceiptModal(p)}
                        className="px-2 py-1 rounded bg-[#172238] hover:bg-[#263449] border border-[#263449] text-[#F1F5F9] text-xs font-medium transition-colors inline-flex items-center gap-1"
                        title="Print / View Receipt"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-[#38BDF8]" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-[#0E1526]/30 border-t border-[#263449] flex items-center justify-between text-xs text-[#94A3B8]">
          <span>Total Transactions: {payments.length}</span>
          <span className="font-mono text-[11px]">Reconciled in Database</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentsView;
