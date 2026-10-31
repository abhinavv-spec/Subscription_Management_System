import React from 'react';
import { X, Printer, Receipt, CheckCircle, Clock } from 'lucide-react';
import StatusBadge from './StatusBadge';

export const InvoicePdfModal = ({ invoice, isOpen, onClose, onRecordPayment }) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#111B2E] border border-[#263449] rounded-xl shadow-2xl overflow-hidden my-6">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#263449] bg-[#0E1526] print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#38BDF8]" />
            <span className="text-[#F1F5F9] font-medium text-xs">Tax Invoice</span>
            <span className="text-xs text-[#94A3B8] font-mono">({invoice.invoice_number})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#38BDF8] text-[#0B1020] text-xs font-semibold hover:bg-[#38BDF8]/90 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 bg-[#0B1020] text-[#F1F5F9] text-xs font-sans print:p-0 print:bg-white print:text-black">
          {/* Header */}
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
                GSTIN: 29AAACB1234F1Z8 • contact@brightloop.io
              </div>
            </div>

            <div className="text-right">
              <span className="text-xl font-bold text-[#38BDF8] uppercase tracking-wider block print:text-blue-800">
                Tax Invoice
              </span>
              <span className="font-mono font-medium text-[#F1F5F9] text-xs block mt-1 print:text-black">
                {invoice.invoice_number}
              </span>
              <div className="mt-2 text-[11px] text-[#94A3B8] print:text-slate-600">
                <div>Invoice Date: {new Date(invoice.invoice_date).toLocaleDateString('en-IN')}</div>
                <div>
                  Due Date:{' '}
                  <strong className="text-[#FBBF24] print:text-black font-semibold">
                    {new Date(invoice.due_date).toLocaleDateString('en-IN')}
                  </strong>
                </div>
                <div className="mt-1">
                  Status: <StatusBadge status={invoice.status} />
                </div>
              </div>
            </div>
          </div>

          {/* Client & Billing Info */}
          <div className="grid grid-cols-2 gap-6 my-6">
            <div className="p-3.5 rounded-lg bg-[#0E1526] border border-[#263449] print:bg-slate-50 print:border-slate-200">
              <span className="text-[10px] text-[#94A3B8] uppercase font-medium tracking-wider block mb-1">
                Billed To
              </span>
              <div className="font-semibold text-[#F1F5F9] text-xs print:text-black">
                {invoice.company_name}
              </div>
              <div className="text-[#94A3B8] print:text-slate-700 mt-1 leading-relaxed text-[11px]">
                Attn: {invoice.customer_name}<br />
                {invoice.customer_address}<br />
                Email: {invoice.customer_email}<br />
                Phone: {invoice.customer_phone || 'N/A'}<br />
                GSTIN: {invoice.gst_number || 'N/A'}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0E1526] border border-[#263449] print:bg-slate-50 print:border-slate-200">
              <span className="text-[10px] text-[#94A3B8] uppercase font-medium tracking-wider block mb-1">
                Subscription & Reference
              </span>
              <div className="font-semibold text-[#F1F5F9] text-xs print:text-black">
                {invoice.subscription_number || 'Direct Onboarding'}
              </div>
              <div className="text-[#94A3B8] print:text-slate-700 mt-1 text-[11px] leading-relaxed">
                Billing Officer: {invoice.staff_name || 'Sarah Jenkins'}<br />
                Payment Terms: Net-30 Days<br />
                Currency: Indian Rupees (INR ₹)
              </div>
            </div>
          </div>

          {/* Snapshot Line Items */}
          <div className="border border-[#263449] rounded-lg overflow-hidden mb-6 print:border-slate-300">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0E1526] text-[#94A3B8] uppercase text-[10px] font-medium border-b border-[#263449] print:bg-slate-100 print:text-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 text-center">Qty / Seats</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#263449] text-[#F1F5F9] print:divide-slate-200 print:text-black">
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-3 font-medium text-[#F1F5F9] print:text-black">
                        {item.item_description}
                      </td>
                      <td className="py-3 px-3 text-center font-medium">{item.quantity}</td>
                      <td className="py-3 px-3 text-right">
                        ₹{parseFloat(item.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right">
                        ₹{parseFloat(item.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-[#F1F5F9] print:text-black">
                        ₹{parseFloat(item.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-3 px-3 font-medium text-[#F1F5F9] print:text-black">
                      Software Subscription Licensing
                    </td>
                    <td className="py-3 px-3 text-center font-medium">1</td>
                    <td className="py-3 px-3 text-right">
                      ₹{parseFloat(invoice.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      ₹{parseFloat(invoice.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-[#F1F5F9] print:text-black">
                      ₹{parseFloat(invoice.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pricing Totals Box & Outstanding Balance */}
          <div className="flex justify-between items-start mb-6">
            <div className="p-3.5 rounded-lg bg-[#0E1526] border border-[#263449] print:border-slate-300 max-w-sm">
              <span className="text-[10px] uppercase font-medium text-[#94A3B8] block mb-1">
                Settlement Status
              </span>
              <div className="flex items-center gap-2">
                {parseFloat(invoice.outstanding_amount) <= 0.01 ? (
                  <span className="flex items-center gap-1.5 text-[#34D399] font-medium text-xs">
                    <CheckCircle className="w-3.5 h-3.5" /> Full Invoice Settled
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[#FBBF24] font-medium text-xs">
                    <Clock className="w-3.5 h-3.5" /> Payment Pending / Overdue
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                Amount Paid: ₹{parseFloat(invoice.paid_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="w-72 space-y-2 text-xs">
              <div className="flex justify-between text-[#94A3B8] print:text-slate-600">
                <span>Subtotal:</span>
                <span className="font-medium text-[#F1F5F9] print:text-black">
                  ₹{parseFloat(invoice.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-[#34D399] print:text-emerald-700">
                <span>Discount:</span>
                <span className="font-medium">
                  -₹{parseFloat(invoice.discount_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-[#94A3B8] print:text-slate-600">
                <span>GST Tax:</span>
                <span className="font-medium text-[#F1F5F9] print:text-black">
                  +₹{parseFloat(invoice.tax_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-xs font-semibold pt-2 border-t border-[#263449] print:border-slate-300 text-[#F1F5F9] print:text-black">
                <span>Total Invoice:</span>
                <span className="text-[#F1F5F9] print:text-black">
                  ₹{parseFloat(invoice.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-[#263449] text-[#38BDF8] print:text-blue-900">
                <span>Outstanding Due:</span>
                <span>
                  ₹{parseFloat(invoice.outstanding_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Notes */}
          <div className="p-3.5 rounded-lg bg-[#0E1526] border border-[#263449] print:bg-slate-50 print:border-slate-200 text-[11px] text-[#94A3B8] print:text-slate-600">
            <span className="font-medium uppercase text-[#F1F5F9] print:text-black block mb-0.5 text-[10px]">
              Payment Instructions
            </span>
            <p>
              Direct transfer to: HDFC Bank Ltd • A/C Name: Brightloop Technologies Pvt Ltd • A/C No: 50200012345678 • IFSC: HDFC0000123.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePdfModal;
