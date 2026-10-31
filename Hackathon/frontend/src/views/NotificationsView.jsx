import React from 'react';
import { Bell, AlertTriangle, Send, Repeat, ArrowRight } from 'lucide-react';

export const NotificationsView = ({ onNavigateTab }) => {
  const alerts = [
    {
      id: 1,
      type: 'overdue',
      title: 'Invoice Past Due SLA Alert',
      message: 'CloudVibe Inc (INV-2024-002) is overdue by 5 days. ₹24,500.00 outstanding balance.',
      time: '15m ago',
      action: 'overdue',
      actionLabel: 'Review Overdue'
    },
    {
      id: 2,
      type: 'quote',
      title: 'Quotation Accepted by Client',
      message: 'Helios Cloud Labs signed Quotation #QT-2024-003. Ready for subscription conversion.',
      time: '1h ago',
      action: 'quotations',
      actionLabel: 'Convert to Sub'
    },
    {
      id: 3,
      type: 'quote',
      title: 'Draft Quotation Ready for Review',
      message: 'Apex Digital #QT-2024-002 draft pricing calculation verified. Ready for dispatch.',
      time: '3h ago',
      action: 'quotations',
      actionLabel: 'Review Quote'
    },
    {
      id: 4,
      type: 'renewal',
      title: 'Contract Renewal Approaching',
      message: 'Vertex Systems (SUB-2024-003) renewal due in next 14 days. Value ₹18,450.00/yr.',
      time: '5h ago',
      action: 'subscriptions',
      actionLabel: 'Inspect Sub'
    }
  ];

  return (
    <div className="flex flex-col gap-5 w-full pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#263449]">
        <div>
          <h1 className="text-xl font-semibold text-[#F1F5F9] tracking-tight">Notifications</h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">Real-time alerts and operational reminders</p>
        </div>
        <span className="text-xs text-[#38BDF8] bg-[#38BDF8]/10 border border-[#38BDF8]/20 px-2.5 py-1 rounded-md font-medium self-start sm:self-auto">
          4 Unread Alerts
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((al) => (
          <div
            key={al.id}
            className="p-4 rounded-xl bg-[#111B2E] border border-[#263449] hover:border-[#38BDF8]/40 flex items-start justify-between gap-4 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  al.type === 'overdue'
                    ? 'bg-[#F87171]/10 text-[#F87171]'
                    : 'bg-[#38BDF8]/10 text-[#38BDF8]'
                }`}
              >
                {al.type === 'overdue' ? <AlertTriangle className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-[#F1F5F9] text-xs">{al.title}</h4>
                  <span className="text-[11px] text-[#94A3B8]">{al.time}</span>
                </div>
                <p className="text-[#94A3B8] text-xs mt-1">{al.message}</p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab(al.action)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#172238] hover:bg-[#263449] border border-[#263449] text-[#F1F5F9] text-xs font-medium shrink-0 transition-colors"
            >
              <span>{al.actionLabel}</span>
              <ArrowRight className="w-3 h-3 text-[#38BDF8]" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsView;
