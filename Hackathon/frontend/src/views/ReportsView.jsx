import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  CreditCard,
  Repeat,
  AlertTriangle,
  TrendingUp,
  FileSpreadsheet,
  Download,
  RefreshCw,
  Clock,
  CheckCircle2,
  Receipt,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import apiClient from '../api/apiClient';
import KpiCard from '../components/KpiCard';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/Toast';

const PIE_COLORS = ['#38BDF8', '#818CF8', '#34D399', '#FBBF24', '#F87171', '#94A3B8'];

export const ReportsView = ({ onNavigateToInvoices, onNavigateToCustomers }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');
  const [data, setData] = useState(null);

  useEffect(() => {
    loadReportsData();
  }, [range]);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/staff/reports', { params: { range } });
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      showToast('Failed to load operational reports.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!data) return;
    const summaryRows = [
      ['Metric', 'Value'],
      ['Active Subscriptions', data.summary?.activeSubscriptions || 0],
      ['Total ARR (₹)', data.summary?.totalArr || 0],
      ['Payments Collected (₹)', data.summary?.paymentsReceived || 0],
      ['Total Outstanding (₹)', data.summary?.outstandingInvoicesAmount || 0],
      ['Overdue Invoices Count', data.summary?.overdueInvoicesCount || 0],
      ['Upcoming Renewals Count', data.summary?.upcomingRenewalsCount || 0],
      ['Quotation Conversion Rate', `${data.summary?.conversionRate || 0}%`]
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      summaryRows.map((e) => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `brightloop_report_${range}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Report CSV downloaded successfully.');
  };

  const summary = data?.summary || {};
  const monthlyTrends = data?.monthlyTrends || [];
  const paymentMethods = data?.paymentMethods || [];
  const upcomingRenewals = data?.upcomingRenewals || [];
  const overdueInvoices = data?.overdueInvoices || [];

  return (
    <div className="flex flex-col gap-6 w-full pt-2">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#263449]">
        <div>
          <h1 className="text-xl font-semibold text-[#F1F5F9] tracking-tight">
            Operational Reports & Analytics
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Subscription performance, recurring revenue collection, and renewal forecasts
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Date Range Selector */}
          <div className="flex items-center gap-1 bg-[#111B2E] border border-[#263449] p-1 rounded-lg text-xs">
            {[
              { id: '7d', label: 'Last 7D' },
              { id: '30d', label: 'Last 30D' },
              { id: 'quarter', label: 'Quarter' },
              { id: 'ytd', label: 'YTD' },
              { id: 'all', label: 'All' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRange(tab.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  range === tab.id
                    ? 'bg-[#172238] text-[#38BDF8] border border-[#263449]'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            onClick={loadReportsData}
            disabled={loading}
            className="p-2 rounded-lg bg-[#111B2E] border border-[#263449] text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#172238] transition-colors"
            title="Refresh Report Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#38BDF8]' : ''}`} />
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111B2E] border border-[#263449] text-[#F1F5F9] text-xs font-medium hover:bg-[#172238] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 5 Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <KpiCard
          title="Active Subscriptions"
          value={summary.activeSubscriptions || 0}
          subtext={`₹${((summary.totalArr || 0) / 1000).toFixed(1)}k annualized value`}
          icon={Repeat}
          color="indigo"
        />
        <KpiCard
          title="Payments Collected"
          value={`₹${((summary.paymentsReceived || 0) / 1000).toFixed(1)}k`}
          subtext={`${summary.paymentsCount || 0} invoices settled`}
          icon={CreditCard}
          color="emerald"
        />
        <KpiCard
          title="Outstanding Receivables"
          value={`₹${((summary.outstandingInvoicesAmount || 0) / 1000).toFixed(1)}k`}
          subtext={`${summary.outstandingInvoicesCount || 0} invoices unpaid`}
          icon={Receipt}
          color="amber"
        />
        <KpiCard
          title="Overdue Invoices"
          value={summary.overdueInvoicesCount || 0}
          subtext={`₹${((summary.overdueInvoicesAmount || 0) / 1000).toFixed(1)}k requiring action`}
          icon={AlertTriangle}
          color="rose"
        />
        <KpiCard
          title="Upcoming Renewals (30D)"
          value={summary.upcomingRenewalsCount || 0}
          subtext={`${summary.conversionRate || 0}% quote conversion rate`}
          icon={Calendar}
          color="blue"
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Revenue Trends (Billed vs Collected) - 7 cols */}
        <div className="lg:col-span-7 bg-[#111B2E] border border-[#263449] rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-[#263449] mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[#F1F5F9]">Revenue Invoiced vs. Collected</h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Monthly billed amounts compared with actual cash receipts (₹)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-[#38BDF8]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]"></span>
                Invoiced
              </span>
              <span className="flex items-center gap-1.5 text-[#34D399]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#34D399]"></span>
                Collected
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            {monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#263449" vertical={false} />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0E1526',
                      borderColor: '#263449',
                      borderRadius: '8px',
                      color: '#F1F5F9',
                      fontSize: '12px'
                    }}
                    formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                  />
                  <Bar dataKey="billed" name="Invoiced" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="collected" name="Collected" fill="#34D399" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#94A3B8]">
                No monthly billing history recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods Breakdown & Conversion Funnel - 5 cols */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Payment Methods */}
          <div className="bg-[#111B2E] border border-[#263449] rounded-xl p-5 flex flex-col flex-1">
            <div className="pb-3 border-b border-[#263449] mb-3">
              <h2 className="text-sm font-semibold text-[#F1F5F9]">Payment Methods Distribution</h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Collection volume by settlement channel
              </p>
            </div>

            <div className="h-44 w-full flex items-center justify-center">
              {paymentMethods.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethods}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={68}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {paymentMethods.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0E1526',
                        borderColor: '#263449',
                        borderRadius: '8px',
                        color: '#F1F5F9',
                        fontSize: '12px'
                      }}
                      formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-[#94A3B8]">No payment methods logged.</div>
              )}
            </div>

            {/* Legend breakdown list */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#263449] text-xs">
              {paymentMethods.map((pm, i) => (
                <div key={pm.name} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                  ></span>
                  <div className="truncate flex-1">
                    <span className="text-[#F1F5F9] font-medium block truncate capitalize">
                      {pm.name.replace(/_/g, ' ').toLowerCase()}
                    </span>
                    <span className="text-[10px] text-[#94A3B8]">
                      ₹{parseFloat(pm.value).toLocaleString('en-IN')} ({pm.count})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quotation Conversion Snapshot */}
          <div className="bg-[#111B2E] border border-[#263449] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#172238] border border-[#263449] flex items-center justify-center text-[#38BDF8]">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-[#94A3B8] block">Commercial Conversion Rate</span>
                <span className="text-base font-bold text-[#F1F5F9]">
                  {summary.conversionRate || 0}%
                </span>
                <span className="text-[10px] text-[#94A3B8] block">
                  {summary.convertedQuotes || 0} converted / {summary.totalQuotes || 0} quotes created
                </span>
              </div>
            </div>

            <div className="w-28 bg-[#0E1526] rounded-full h-2.5 border border-[#263449] overflow-hidden">
              <div
                className="bg-[#38BDF8] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, summary.conversionRate || 0)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Follow-Up Tables (Two Column Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Overdue Invoices */}
        <div className="bg-[#111B2E] border border-[#263449] rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#263449] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-semibold text-[#F1F5F9]">Overdue Invoices Requiring Action</h3>
            </div>
            <button
              onClick={() => onNavigateToInvoices && onNavigateToInvoices()}
              className="text-xs text-[#38BDF8] hover:underline flex items-center gap-1 font-medium"
            >
              <span>View All Invoices</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#263449] text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider bg-[#0E1526]/40">
                  <th className="py-2.5 px-4 font-medium">Invoice #</th>
                  <th className="py-2.5 px-3 font-medium">Customer</th>
                  <th className="py-2.5 px-3 font-medium">Due Date</th>
                  <th className="py-2.5 px-3 font-medium text-right">Outstanding</th>
                  <th className="py-2.5 px-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#263449] text-[#F1F5F9]">
                {overdueInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-xs text-[#94A3B8]">
                      No overdue invoices currently. All accounts are up-to-date!
                    </td>
                  </tr>
                ) : (
                  overdueInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#172238]/40 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-medium text-[#F1F5F9]">
                        {inv.invoice_number}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-[#F1F5F9] block truncate max-w-[140px]">
                          {inv.company_name || `Customer #${inv.customer_id}`}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-rose-400">
                        {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-IN') : 'N/A'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-rose-400">
                        ₹{parseFloat(inv.outstanding_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-medium">
                          Past Due
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Subscription Renewals (30 Days) */}
        <div className="bg-[#111B2E] border border-[#263449] rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#263449] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#38BDF8]" />
              <h3 className="text-sm font-semibold text-[#F1F5F9]">Upcoming Contract Renewals (30 Days)</h3>
            </div>
            <button
              onClick={() => onNavigateToCustomers && onNavigateToCustomers()}
              className="text-xs text-[#38BDF8] hover:underline flex items-center gap-1 font-medium"
            >
              <span>View Customers</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#263449] text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider bg-[#0E1526]/40">
                  <th className="py-2.5 px-4 font-medium">Subscription #</th>
                  <th className="py-2.5 px-3 font-medium">Customer</th>
                  <th className="py-2.5 px-3 font-medium">Next Billing</th>
                  <th className="py-2.5 px-3 font-medium text-right">Amount (₹)</th>
                  <th className="py-2.5 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#263449] text-[#F1F5F9]">
                {upcomingRenewals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-xs text-[#94A3B8]">
                      No subscriptions scheduled for renewal in the next 30 days.
                    </td>
                  </tr>
                ) : (
                  upcomingRenewals.map((sub) => (
                    <tr key={sub.id} className="hover:bg-[#172238]/40 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-medium text-[#F1F5F9]">
                        {sub.subscription_number}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-[#F1F5F9] block truncate max-w-[140px]">
                          {sub.company_name || sub.customer_name}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#94A3B8]">
                        {sub.next_billing_date || sub.expiry_date
                          ? new Date(sub.next_billing_date || sub.expiry_date).toLocaleDateString('en-IN')
                          : 'N/A'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium">
                        ₹{parseFloat(sub.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4">
                        <StatusBadge status={sub.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;

