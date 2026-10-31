import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Copy,
  Check,
  CreditCard,
  Clock,
  AlertCircle
} from 'lucide-react';
import apiClient from '../api/apiClient';
import { useToast } from '../components/Toast';

export const OverdueView = ({ onRecordPayment }) => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState({
    under7Days: [],
    under30Days: [],
    over30Days: []
  });
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadOverdueInvoices();
  }, []);

  const loadOverdueInvoices = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/staff/invoices/overdue');
      if (res.data.success) {
        setCategories(res.data.categories);
        setTotalCount(res.data.totalOverdueCount || 0);
      }
    } catch (err) {
      showToast('Error loading overdue invoice data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyReminder = (item) => {
    navigator.clipboard.writeText(item.reminderText);
    setCopiedId(item.id);
    showToast(`Payment reminder copied for ${item.company_name}!`);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const renderInvoiceCard = (item, colorTheme) => (
    <div
      key={item.id}
      className="p-3.5 rounded-lg bg-[#0E1526] border border-[#263449] flex flex-col justify-between gap-3 text-xs hover:border-[#38BDF8]/40 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-medium text-[#F1F5F9] text-xs block">{item.company_name}</span>
          <span className="text-[11px] text-[#94A3B8]">Attn: {item.customer_name}</span>
          <span className="text-[10px] text-[#94A3B8]/70 block font-mono mt-0.5">
            {item.invoice_number} • {item.customer_phone || 'No phone'}
          </span>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${colorTheme.badge}`}>
          {item.daysOverdue}d overdue
        </span>
      </div>

      <div className="flex items-baseline justify-between pt-2 border-t border-[#263449]">
        <div>
          <span className="text-[10px] text-[#94A3B8] block">Due: {new Date(item.due_date).toLocaleDateString('en-IN')}</span>
          <span className="text-sm font-semibold text-[#F87171]">
            ₹{parseFloat(item.outstanding_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => copyReminder(item)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#172238] hover:bg-[#263449] border border-[#263449] text-xs font-medium text-[#F1F5F9] transition-colors"
            title="Copy reminder template"
          >
            {copiedId === item.id ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#34D399]" />
                <span className="text-[#34D399]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Reminder</span>
              </>
            )}
          </button>

          <button
            onClick={() => onRecordPayment(item.id)}
            className="p-1 rounded bg-[#34D399]/10 hover:bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/30 transition-colors"
            title="Record payment"
          >
            <CreditCard className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5 w-full pt-2">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#263449]">
        <div>
          <h1 className="text-xl font-semibold text-[#F1F5F9] tracking-tight">Overdue Follow-up</h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Dunning workflows prioritized by invoice aging policies
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#111B2E] border border-[#263449] px-3 py-1.5 rounded-lg text-xs self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-[#F87171]"></span>
          <span className="text-[#F1F5F9] font-medium">
            {totalCount} Invoices Require Attention
          </span>
        </div>
      </div>

      {/* 3-Column Aging Buckets Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Column 1: 0–7 Days Overdue */}
        <div className="flex flex-col gap-3.5 bg-[#111B2E] border border-[#263449] rounded-xl p-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#263449]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#38BDF8]" />
              <h3 className="font-semibold text-[#F1F5F9] text-xs">0 – 7 Days Overdue</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-[#38BDF8]">
              {categories.under7Days.length}
            </span>
          </div>
          <p className="text-[11px] text-[#94A3B8]">
            Grace period expiration. Soft payment reminder recommended.
          </p>

          <div className="flex flex-col gap-2.5">
            {categories.under7Days.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#94A3B8] bg-[#0E1526] rounded-lg">
                No invoices in 0-7 day window.
              </div>
            ) : (
              categories.under7Days.map((inv) =>
                renderInvoiceCard(inv, {
                  badge: 'bg-[#38BDF8]/10 border-[#38BDF8]/20 text-[#38BDF8]'
                })
              )
            )}
          </div>
        </div>

        {/* Column 2: 8–30 Days Overdue */}
        <div className="flex flex-col gap-3.5 bg-[#111B2E] border border-[#263449] rounded-xl p-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#263449]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#FBBF24]" />
              <h3 className="font-semibold text-[#F1F5F9] text-xs">8 – 30 Days Overdue</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#FBBF24]/10 border border-[#FBBF24]/20 text-[#FBBF24]">
              {categories.under30Days.length}
            </span>
          </div>
          <p className="text-[11px] text-[#94A3B8]">
            Second notice escalation. Direct follow-up with accounts recommended.
          </p>

          <div className="flex flex-col gap-2.5">
            {categories.under30Days.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#94A3B8] bg-[#0E1526] rounded-lg">
                No invoices in 8-30 day window.
              </div>
            ) : (
              categories.under30Days.map((inv) =>
                renderInvoiceCard(inv, {
                  badge: 'bg-[#FBBF24]/10 border-[#FBBF24]/20 text-[#FBBF24]'
                })
              )
            )}
          </div>
        </div>

        {/* Column 3: 30+ Days Overdue */}
        <div className="flex flex-col gap-3.5 bg-[#111B2E] border border-[#263449] rounded-xl p-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#263449]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#F87171]" />
              <h3 className="font-semibold text-[#F1F5F9] text-xs">30+ Days Critical</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#F87171]/10 border border-[#F87171]/20 text-[#F87171]">
              {categories.over30Days.length}
            </span>
          </div>
          <p className="text-[11px] text-[#94A3B8]">
            Critical escalation policy. Direct call to finance head required.
          </p>

          <div className="flex flex-col gap-2.5">
            {categories.over30Days.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#94A3B8] bg-[#0E1526] rounded-lg">
                No critical 30+ day overdue invoices.
              </div>
            ) : (
              categories.over30Days.map((inv) =>
                renderInvoiceCard(inv, {
                  badge: 'bg-[#F87171]/10 border-[#F87171]/20 text-[#F87171]'
                })
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverdueView;
