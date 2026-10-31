import React from 'react';
import { X, Printer } from 'lucide-react';

export const QuotationPdfModal = ({ quotation, isOpen, onClose }) => {
  if (!isOpen || !quotation) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#111B2E] border border-[#263449] rounded-xl shadow-2xl overflow-hidden my-6">
        {/* Top Control Bar (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#263449] bg-[#0E1526] print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-[#F1F5F9] font-medium text-xs">Quotation Document</span>
            <span className="text-xs text-[#94A3B8] font-mono">({quotation.quotation_number})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#38BDF8] text-[#0B1020] text-xs font-semibold hover:bg-[#38BDF8]/90 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Quotation Sheet */}
        <div className="p-8 bg-[#0B1020] text-[#F1F5F9] text-xs font-sans print:p-0 print:bg-white print:text-black">
          {/* Header & Logo */}
          <div className="flex items-start justify-between border-b border-[#263449] pb-6 print:border-slate-300">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#172238] border border-[#263449] flex items-center justify-center text-[#38BDF8] font-bold text-xs">
                  ⚡
                </div>
                <div>
                  <h1 className="text-lg font-bold text-[#F1F5F9] tracking-tight print:text-black">
                    Brightloop
                  </h1>
                  <p className="text-[10px] text-[#94A3B8] font-medium tracking-wider uppercase print:text-slate-600">
                    SaaS Subscription Management
                  </p>
                </div>
              </div>
              <div className="mt-3 text-[11px] text-[#94A3B8] print:text-slate-600 leading-relaxed">
                Brightloop Technologies Private Limited<br />
                Prestige Tech Park, Outer Ring Road, Bengaluru, 560103<br />
                GSTIN: 29AAACB1234F1Z8 • billing@brightloop.io
              </div>
            </div>

            <div className="text-right">
              <span className="text-xl font-bold text-[#38BDF8] uppercase tracking-wider block print:text-blue-800">
                Commercial Quotation
              </span>
              <span className="font-mono font-medium text-[#F1F5F9] text-xs block mt-1 print:text-black">
                {quotation.quotation_number}
              </span>
              <div className="mt-2 text-[11px] text-[#94A3B8] print:text-slate-600">
                <div>Date: {new Date(quotation.created_at).toLocaleDateString('en-IN')}</div>
                <div>
                  Valid Until:{' '}
                  <strong className="text-[#F1F5F9] print:text-black font-semibold">
                    {new Date(quotation.validity_date).toLocaleDateString('en-IN')}
                  </strong>
                </div>
                <div>Status: <span className="font-semibold text-[#F1F5F9] print:text-black">{quotation.status}</span></div>
              </div>
            </div>
          </div>

          {/* Client & Staff Info */}
          <div className="grid grid-cols-2 gap-6 my-6">
            <div className="p-3.5 rounded-lg bg-[#0E1526] border border-[#263449] print:bg-slate-50 print:border-slate-200">
              <span className="text-[10px] text-[#94A3B8] uppercase font-medium tracking-wider block mb-1">
                Client / Bill To
              </span>
              <div className="font-semibold text-[#F1F5F9] text-xs print:text-black">
                {quotation.company_name}
              </div>
              <div className="text-[#94A3B8] print:text-slate-700 mt-1 leading-relaxed text-[11px]">
                Attn: {quotation.customer_name}<br />
                {quotation.customer_address}<br />
                Email: {quotation.customer_email}<br />
                Phone: {quotation.customer_phone || 'N/A'}<br />
                GSTIN: {quotation.gst_number || 'N/A'}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0E1526] border border-[#263449] print:bg-slate-50 print:border-slate-200">
              <span className="text-[10px] text-[#94A3B8] uppercase font-medium tracking-wider block mb-1">
                Commercial Operations Desk
              </span>
              <div className="font-semibold text-[#F1F5F9] text-xs print:text-black">
                {quotation.staff_name || 'Sarah Jenkins'}
              </div>
              <div className="text-[#94A3B8] print:text-slate-700 mt-1 text-[11px] leading-relaxed">
                Role: Enterprise Staff Operations<br />
                Email: {quotation.staff_email || 'sarah@brightloop.io'}<br />
                Terms: Net-30 Priority Billing
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-[#263449] rounded-lg overflow-hidden mb-6 print:border-slate-300">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0E1526] text-[#94A3B8] uppercase text-[10px] font-medium border-b border-[#263449] print:bg-slate-100 print:text-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Item & Description</th>
                  <th className="py-2.5 px-3 text-center">Period</th>
                  <th className="py-2.5 px-3 text-center">Units</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#263449] text-[#F1F5F9] print:divide-slate-200 print:text-black">
                <tr>
                  <td className="py-3 px-3">
                    <div className="font-medium text-[#F1F5F9] print:text-black">
                      {quotation.product_name}
                    </div>
                    <div className="text-[11px] text-[#94A3B8] print:text-slate-600">
                      Tier: {quotation.plan_name || 'Standard'} • Variant: {quotation.variant_name || 'Base Standard'}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center capitalize">
                    {quotation.billing_period?.toLowerCase() || 'annual'}
                  </td>
                  <td className="py-3 px-3 text-center font-medium">
                    {quotation.quantity}
                  </td>
                  <td className="py-3 px-3 text-right">
                    ₹{parseFloat(quotation.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-[#F1F5F9] print:text-black">
                    ₹{parseFloat(quotation.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pricing Totals Box */}
          <div className="flex justify-end mb-6">
            <div className="w-72 space-y-2 text-xs">
              <div className="flex justify-between text-[#94A3B8] print:text-slate-600">
                <span>Subtotal:</span>
                <span className="font-medium text-[#F1F5F9] print:text-black">
                  ₹{parseFloat(quotation.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-[#34D399] print:text-emerald-700">
                <span>Discount Applied:</span>
                <span className="font-medium">
                  -₹{parseFloat(quotation.discount_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-[#94A3B8] print:text-slate-600">
                <span>GST Tax:</span>
                <span className="font-medium text-[#F1F5F9] print:text-black">
                  +₹{parseFloat(quotation.tax_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-[#263449] print:border-slate-300 text-[#F1F5F9] print:text-black">
                <span>Grand Total:</span>
                <span className="text-[#38BDF8] print:text-blue-900 text-base">
                  ₹{parseFloat(quotation.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="p-3.5 rounded-lg bg-[#0E1526] border border-[#263449] print:bg-slate-50 print:border-slate-200 text-[11px] text-[#94A3B8] print:text-slate-600 space-y-1">
            <span className="font-medium uppercase text-[#F1F5F9] print:text-black block text-[10px]">
              Notes & Contract Terms
            </span>
            <p>{quotation.notes || 'Includes multi-region HA configuration and Tier-2 support SLA.'}</p>
            <p>{quotation.terms || 'Standard Net-30 payment terms. Validity: 14 days.'}</p>
          </div>

          {/* Signoff Footer */}
          <div className="mt-8 pt-4 border-t border-[#263449] flex items-center justify-between text-[10px] text-[#94A3B8] print:border-slate-300 print:text-slate-600">
            <span>Generated electronically by Brightloop Operations Hub</span>
            <span>Authorized Sign-off: Sarah Jenkins</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationPdfModal;
