import React, { useState, useEffect } from 'react';
import {
  Users,
  Repeat,
  FileSpreadsheet,
  Receipt,
  AlertTriangle,
  Calendar,
  RefreshCw,
  Clock,
  ArrowRight,
  UserPlus,
  CreditCard,
  CheckCircle2,
  Activity,
  FileCheck,
  ChevronRight
} from 'lucide-react';
import apiClient from '../api/apiClient';
import KpiCard from '../components/KpiCard';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

export const OverviewView = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/staff/dashboard');
      if (res.data.success) {
        setStats(res.data.stats || {});
        setRecentActivities(res.data.recentActivity || []);
      }
    } catch (err) {
      showToast('Error loading operational dashboard.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const staffFirstName = user?.name ? user.name.split(' ')[0] : 'Sarah';

  // Format activity timestamp
  const formatActivityTime = (dateStr) => {
    if (!dateStr) return 'Recently';
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Activity Icon selector
  const getActivityIcon = (act) => {
    const type = (act.action_type || act.entity_type || '').toUpperCase();
    if (type.includes('CUSTOMER')) return <UserPlus className="w-3.5 h-3.5 text-[#38BDF8]" />;
    if (type.includes('QUOTE') || type.includes('QUOTATION')) return <FileSpreadsheet className="w-3.5 h-3.5 text-[#FBBF24]" />;
    if (type.includes('SUB') || type.includes('SUBSCRIPTION')) return <Repeat className="w-3.5 h-3.5 text-[#818CF8]" />;
    if (type.includes('INV') || type.includes('INVOICE')) return <Receipt className="w-3.5 h-3.5 text-[#38BDF8]" />;
    if (type.includes('PAY') || type.includes('PAYMENT')) return <CreditCard className="w-3.5 h-3.5 text-[#34D399]" />;
    return <Activity className="w-3.5 h-3.5 text-[#94A3B8]" />;
  };

  const pendingQuotesCount = stats?.quotationsAwaitingResponseCount ?? (stats?.pendingQuotationsCount || 0);
  const overdueCount = stats?.overdueInvoicesCount || 0;
  const renewalsCount = stats?.upcomingRenewalsCount || 0;

  return (
    <div className="flex flex-col gap-6 w-full pt-2">
      {/* 1. Compact Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#263449]">
        <div>
          <h1 className="text-xl font-semibold text-[#F1F5F9] tracking-tight">
            {getGreeting()}, {staffFirstName}
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Here's your business overview for today.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-xs text-[#94A3B8] flex items-center gap-1.5 bg-[#111B2E] border border-[#263449] px-2.5 py-1 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>

          <button
            onClick={loadOverviewData}
            disabled={loading}
            className="p-1.5 rounded-lg bg-[#111B2E] border border-[#263449] text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#172238] transition-colors"
            title="Refresh Dashboard Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#38BDF8]' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Exactly Five Primary KPI Cards (Display-Only and Non-Clickable) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Total Customers"
          value={stats?.totalCustomers || 0}
          subtext={`${stats?.assignedCustomers || 0} managed accounts`}
          icon={Users}
          color="blue"
        />

        <KpiCard
          title="Active Subscriptions"
          value={stats?.activeSubscriptionsCount || 0}
          subtext="Live recurring contracts"
          icon={Repeat}
          color="indigo"
        />

        <KpiCard
          title="Pending Quotations"
          value={stats?.pendingQuotationsCount || 0}
          subtext="Awaiting client response"
          icon={FileSpreadsheet}
          color="amber"
        />

        <KpiCard
          title="Unpaid Invoices"
          value={stats?.unpaidInvoicesCount || 0}
          subtext={`₹${((stats?.totalDueAmount || 0) / 1000).toFixed(1)}k balance`}
          icon={Receipt}
          color="rose"
        />

        <KpiCard
          title="Overdue Invoices"
          value={stats?.overdueInvoicesCount || 0}
          subtext="Past settlement due date"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* 3 & 4. Balanced Grid: Pending Tasks (Left) and Recent Activities (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Section 5: Pending Tasks (Only Three Categories) */}
        <div className="bg-[#111B2E] border border-[#263449] rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#263449] flex items-center justify-between bg-[#0E1526]/50">
            <div>
              <h2 className="text-sm font-semibold text-[#F1F5F9]">Pending Tasks</h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Categories requiring operational review and action
              </p>
            </div>
            <span className="text-[11px] font-medium text-[#38BDF8] bg-[#38BDF8]/10 border border-[#38BDF8]/20 px-2 py-0.5 rounded-full">
              3 Categories
            </span>
          </div>

          <div className="divide-y divide-[#263449]">
            {/* Category A: Quotations Awaiting Response */}
            <div
              onClick={() => onNavigateTab && onNavigateTab('quotations')}
              className="p-4 flex items-center justify-between hover:bg-[#172238]/40 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-[#172238] border border-[#263449] flex items-center justify-center text-[#FBBF24] shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#F1F5F9] group-hover:text-[#38BDF8] transition-colors">
                      Quotations Awaiting Response
                    </span>
                    {pendingQuotesCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-[#FBBF24]"></span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#94A3B8] block mt-0.5">
                    Proposals dispatched, awaiting client decision
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-sm font-bold text-[#FBBF24] bg-[#FBBF24]/10 border border-[#FBBF24]/20 px-2.5 py-0.5 rounded-lg font-mono">
                  {pendingQuotesCount}
                </span>
                <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#F1F5F9] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            {/* Category B: Overdue Invoices */}
            <div
              onClick={() => onNavigateTab && onNavigateTab('invoices')}
              className="p-4 flex items-center justify-between hover:bg-[#172238]/40 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-[#172238] border border-[#263449] flex items-center justify-center text-rose-400 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#F1F5F9] group-hover:text-[#38BDF8] transition-colors">
                      Overdue Invoices
                    </span>
                    {overdueCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#94A3B8] block mt-0.5">
                    Invoices past due date with an outstanding balance
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-sm font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-lg font-mono">
                  {overdueCount}
                </span>
                <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#F1F5F9] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            {/* Category C: Upcoming Renewals */}
            <div
              onClick={() => onNavigateTab && onNavigateTab('customers')}
              className="p-4 flex items-center justify-between hover:bg-[#172238]/40 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-[#172238] border border-[#263449] flex items-center justify-center text-[#818CF8] shrink-0">
                  <Repeat className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#F1F5F9] group-hover:text-[#38BDF8] transition-colors">
                      Upcoming Renewals
                    </span>
                    {renewalsCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-[#818CF8]"></span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#94A3B8] block mt-0.5">
                    Active subscriptions approaching their next billing cycle
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-sm font-bold text-[#818CF8] bg-[#818CF8]/10 border border-[#818CF8]/20 px-2.5 py-0.5 rounded-lg font-mono">
                  {renewalsCount}
                </span>
                <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#F1F5F9] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#0E1526]/40 border-t border-[#263449] flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Click any category to view and filter records</span>
            <span className="font-mono text-[11px]">3 of 3 active filters</span>
          </div>
        </div>

        {/* Section 6: Recent Activities (Only Latest Five Events) */}
        <div className="bg-[#111B2E] border border-[#263449] rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#263449] flex items-center justify-between bg-[#0E1526]/50">
            <div>
              <h2 className="text-sm font-semibold text-[#F1F5F9]">Recent Activities</h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Latest five important operational events
              </p>
            </div>
            <span className="text-[11px] font-medium text-[#94A3B8] bg-[#172238] border border-[#263449] px-2 py-0.5 rounded-full">
              Audit Trail
            </span>
          </div>

          <div className="divide-y divide-[#263449]">
            {loading ? (
              <div className="py-12 text-center text-xs text-[#94A3B8]">
                Loading recent activities...
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#94A3B8] flex flex-col items-center justify-center gap-1.5">
                <Activity className="w-6 h-6 text-[#94A3B8]" />
                <span className="font-medium text-[#F1F5F9]">No recent activities recorded</span>
                <span className="text-[11px]">System events will appear here as operations occur.</span>
              </div>
            ) : (
              recentActivities.slice(0, 5).map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 flex items-start gap-3 hover:bg-[#172238]/30 transition-colors text-xs"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#172238] border border-[#263449] flex items-center justify-center shrink-0 mt-0.5">
                    {getActivityIcon(act)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-[#F1F5F9] truncate">
                        {act.entity_reference || act.action_type}
                      </span>
                      <span className="text-[10px] text-[#94A3B8] shrink-0 font-mono">
                        {formatActivityTime(act.created_at)}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#94A3B8] mt-0.5 line-clamp-1">
                      {act.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-[#0E1526]/40 border-t border-[#263449] flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Chronological audit trail of business events</span>
            <span className="font-mono text-[11px]">5 of {recentActivities.length} shown</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewView;
