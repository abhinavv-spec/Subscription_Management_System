import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';

export const ReceiptModal = ({ payment, isOpen, onClose }) => {
  if (!isOpen || !payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#111B2E] border border-[#263449] rounded-xl shadow-2xl overflow-hidden my-6">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#263449] bg-[#0E1526] print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
            <span className="text-[#F1F5F9] font-medium text-xs">Payment Receipt</span>
            <span className="text-xs text-[#94A3B8] font-mono">({payment.receipt_number || payment.payment_number})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#38BDF8] text-[#0B1020] text-xs font-semibold hover:bg-[#38BDF8]/90 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Sheet */}
        <div className="p-8 bg-[#0B1020] text-[#F1F5F9] text-xs font-sans print:p-0 print:bg-white print:text-black">
          {/* Header */}
          <div className="text-center border-b border-[#263449] pb-5 print:border-slate-300">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#172238] border border-[#263449] text-[#38BDF8] font-bold text-sm mb-2">
              ⚡
            </div>
            <h2 className="text-base font-semibold text-[#F1F5F9] tracking-tight print:text-black">
              Brightloop Technologies
            </h2>
            <p className="text-[10px] text-[#94A3B8] font-medium uppercase tracking-wider print:text-slate-600">
              Official Payment Voucher & Receipt
            </p>
            <div className="mt-2 text-[11px] text-[#94A3B8] print:text-slate-600">
              Receipt No: <strong className="text-[#F1F5F9] print:text-black font-mono">{payment.receipt_number || 'REC-2024-001'}</strong> • 
              Date: {new Date(payment.payment_date || payment.created_at).toLocaleDateString('en-IN')}
            </div>
          </div>

          {/* Amount Paid Center Box */}
          <div className="my-6 p-4 rounded-xl bg-[#0E1526] border border-[#263449] text-center print:bg-slate-50 print:border-slate-300">
            <span className="text-[10px] text-[#94A3B8] uppercase font-medium tracking-wider block">
              Amount Received
            </span>
            <div className="text-2xl font-bold text-[#34D399] print:text-emerald-800 mt-1">
              ₹{parseFloat(payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-[#94A3B8] print:text-slate-600 mt-1 inline-flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" /> Payment Recorded & Reconciled
            </span>
          </div>

          {/* Transaction Metadata Grid */}
          <div className="space-y-2 bg-[#0E1526] p-3.5 rounded-lg border border-[#263449] print:bg-slate-50 print:border-slate-200 text-xs">
            <div className="flex justify-between py-1 border-b border-[#263449] print:border-slate-200">
              <span className="text-[#94A3B8]">Received From:</span>
              <span className="font-medium text-[#F1F5F9] print:text-black">{payment.company_name || 'Customer Account'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#263449] print:border-slate-200">
              <span className="text-[#94A3B8]">Invoice Reference:</span>
              <span className="font-mono text-[#38BDF8] print:text-black">{payment.invoice_number || 'INV-2024-001'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#263449] print:border-slate-200">
              <span className="text-[#94A3B8]">Payment Method:</span>
              <span className="font-medium text-[#F1F5F9] print:text-black">{payment.payment_method}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#263449] print:border-slate-200">
              <span className="text-[#94A3B8]">Transaction Reference:</span>
              <span className="font-mono text-[#F1F5F9] print:text-black">{payment.transaction_reference || 'Bank Settlement'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#94A3B8]">Staff Operator:</span>
              <span className="font-medium text-[#F1F5F9] print:text-black">{payment.staff_name || 'Sarah Jenkins'}</span>
            </div>
          </div>

          {/* Footer Validation */}
          <div className="mt-8 pt-4 border-t border-[#263449] flex items-center justify-between text-[10px] text-[#94A3B8] print:border-slate-300 print:text-slate-600">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Logged in Brightloop Operations Audit Ledger</span>
            </div>
            <span>Authorized: Sarah Jenkins</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
