import React, { useState, useEffect } from 'react';
import { History, Search, ShieldCheck } from 'lucide-react';
import apiClient from '../api/apiClient';
import { useToast } from '../components/Toast';

export const ActivityView = () => {
  const { showToast } = useToast();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadActivities();
  }, [filterAction]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterAction !== 'ALL') params.action_type = filterAction;
      if (search.trim()) params.search = search.trim();

      const res = await apiClient.get('/staff/activity', { params });
      if (res.data.success) {
        setActivities(res.data.activities || []);
      }
    } catch (err) {
      showToast('Error loading operational audit logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const actionTypes = [
    'ALL',
    'CUSTOMER_REGISTER',
    'CUSTOMER_UPDATE',
    'QUOTATION_CREATE',
    'QUOTATION_SEND',
    'QUOTATION_ACCEPT',
    'SUBSCRIPTION_CONVERT',
    'PAYMENT_RECORD',
    'USER_LOGIN'
  ];

  return (
    <div className="flex flex-col gap-5 w-full pt-2">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#263449]">
        <div>
          <h1 className="text-xl font-semibold text-[#F1F5F9] tracking-tight">Activity Logs</h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Audit trail of customer interactions, quotations, subscriptions, and financial records
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111B2E] border border-[#263449] p-3 rounded-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadActivities();
          }}
          className="flex-1 max-w-sm relative"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by keyword, staff, or ID..."
            className="w-full h-8 px-3 pl-8 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] placeholder:text-[#94A3B8]/60 text-xs outline-none focus:border-[#38BDF8]/60"
          />
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-2.5" />
        </form>

        <div className="flex items-center gap-1 overflow-x-auto">
          {actionTypes.slice(0, 5).map((act) => (
            <button
              key={act}
              onClick={() => setFilterAction(act)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filterAction === act
                  ? 'bg-[#172238] text-[#38BDF8] border border-[#263449]'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#172238]/60'
              }`}
            >
              {act.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-[#111B2E] border border-[#263449] rounded-xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#263449] text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider bg-[#0E1526]/40">
                <th className="py-2.5 px-4 font-medium">Timestamp</th>
                <th className="py-2.5 px-3 font-medium">Action Type</th>
                <th className="py-2.5 px-3 font-medium">Entity Reference</th>
                <th className="py-2.5 px-3 font-medium">Operator</th>
                <th className="py-2.5 px-4 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263449] text-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-[#94A3B8]">
                    Loading activity logs...
                  </td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-[#94A3B8]">
                    No activity entries found matching current query.
                  </td>
                </tr>
              ) : (
                activities.map((act) => (
                  <tr key={act.id} className="hover:bg-[#172238]/40 transition-colors">
                    <td className="py-3 px-4 text-[#94A3B8] whitespace-nowrap font-mono text-[11px]">
                      {new Date(act.created_at).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#172238] border border-[#263449] text-[#38BDF8]">
                        {act.action_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-[#F1F5F9] text-xs">
                      {act.entity_reference}
                    </td>
                    <td className="py-3 px-3 text-[#F1F5F9]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-[#172238] border border-[#263449] flex items-center justify-center text-[10px] text-[#38BDF8]">
                          {act.staff_name?.substring(0, 1) || 'S'}
                        </div>
                        <span className="text-xs">{act.staff_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#94A3B8] text-xs">
                      {act.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-[#0E1526]/30 border-t border-[#263449] flex items-center justify-between text-xs text-[#94A3B8]">
          <span>Logged Events: {activities.length}</span>
          <span className="font-mono text-[11px]">Audit Trail Preserved</span>
        </div>
      </div>
    </div>
  );
};

export default ActivityView;
