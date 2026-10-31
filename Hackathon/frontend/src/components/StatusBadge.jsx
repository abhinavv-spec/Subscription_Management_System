import React from 'react';

const statusConfig = {
  // Quotations
  DRAFT: {
    bg: 'bg-[#172238]',
    border: 'border-[#263449]',
    text: 'text-[#94A3B8]',
    label: 'Draft'
  },
  SENT: {
    bg: 'bg-[#38BDF8]/10',
    border: 'border-[#38BDF8]/30',
    text: 'text-[#38BDF8]',
    label: 'Sent'
  },
  ACCEPTED: {
    bg: 'bg-[#34D399]/10',
    border: 'border-[#34D399]/30',
    text: 'text-[#34D399]',
    label: 'Accepted'
  },
  REJECTED: {
    bg: 'bg-[#F87171]/10',
    border: 'border-[#F87171]/30',
    text: 'text-[#F87171]',
    label: 'Rejected'
  },
  EXPIRED: {
    bg: 'bg-[#FBBF24]/10',
    border: 'border-[#FBBF24]/30',
    text: 'text-[#FBBF24]',
    label: 'Expired'
  },

  // Subscriptions
  QUOTATION: {
    bg: 'bg-[#818CF8]/10',
    border: 'border-[#818CF8]/30',
    text: 'text-[#818CF8]',
    label: 'Quotation'
  },
  ACTIVE: {
    bg: 'bg-[#38BDF8]/10',
    border: 'border-[#38BDF8]/30',
    text: 'text-[#38BDF8]',
    label: 'Active'
  },
  PAUSED: {
    bg: 'bg-[#FBBF24]/10',
    border: 'border-[#FBBF24]/30',
    text: 'text-[#FBBF24]',
    label: 'Paused'
  },
  CLOSED: {
    bg: 'bg-[#172238]',
    border: 'border-[#263449]',
    text: 'text-[#94A3B8]',
    label: 'Closed'
  },

  // Invoices
  CONFIRMED: {
    bg: 'bg-[#FBBF24]/10',
    border: 'border-[#FBBF24]/30',
    text: 'text-[#FBBF24]',
    label: 'Unpaid'
  },
  PAID: {
    bg: 'bg-[#34D399]/10',
    border: 'border-[#34D399]/30',
    text: 'text-[#34D399]',
    label: 'Paid'
  },
  CANCELLED: {
    bg: 'bg-[#F87171]/10',
    border: 'border-[#F87171]/30',
    text: 'text-[#F87171]',
    label: 'Cancelled'
  },

  // Customers
  PROSPECT: {
    bg: 'bg-[#818CF8]/10',
    border: 'border-[#818CF8]/30',
    text: 'text-[#818CF8]',
    label: 'Prospect'
  },
  INACTIVE: {
    bg: 'bg-[#172238]',
    border: 'border-[#263449]',
    text: 'text-[#94A3B8]',
    label: 'Inactive'
  }
};

export const StatusBadge = ({ status }) => {
  const norm = (status || '').toUpperCase();
  const config = statusConfig[norm] || {
    bg: 'bg-[#172238]',
    border: 'border-[#263449]',
    text: 'text-[#94A3B8]',
    label: norm
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${config.bg} ${config.border} ${config.text}`}
    >
      <span className="w-1 h-1 rounded-full bg-current opacity-80"></span>
      {config.label}
    </span>
  );
};

export default StatusBadge;
