import React from 'react';
import { User, Shield, Briefcase, Mail, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfileView = () => {
  const { user } = useAuth();

  const permittedActions = [
    'View and manage assigned customers',
    'Register new corporate client accounts',
    'Create and calculate commercial quotations',
    'Dispatch quotations to prospective clients',
    'Track quotation status lifecycle',
    'Convert accepted quotations to active subscriptions',
    'View and monitor active recurring subscriptions',
    'Generate and manage tax billing invoices',
    'Record manual customer payments (UPI, NEFT, Card, Cash)',
    'Issue authenticated payment receipts',
    'Follow up on overdue invoices with dunning SLA',
    'Review operational audit logs'
  ];

  const restrictedAdminActions = [
    'Create new staff or administrative accounts (Admin only)',
    'Manage or delete global product catalog entries',
    'Create or modify subscription plan base rates',
    'Modify statutory tax percentages or GST brackets',
    'Alter global discount coupon codes',
    'Access administrative server settings and database DDL'
  ];

  return (
    <div className="flex flex-col gap-6 w-full pt-2">
      {/* Profile Header */}
      <div className="bg-[#111B2E] border border-[#263449] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#172238] border border-[#263449] flex items-center justify-center text-[#38BDF8] font-bold text-xl">
            {user?.name?.substring(0, 2).toUpperCase() || 'SJ'}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-semibold text-[#F1F5F9]">{user?.name || 'Sarah Jenkins'}</h2>
              <span className="bg-[#172238] border border-[#263449] text-[#38BDF8] text-xs px-2.5 py-0.5 rounded font-medium">
                {user?.role || 'STAFF'}
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span>{user?.email || 'sarah@brightloop.io'}</span>
              <span>•</span>
              <Briefcase className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span>{user?.department || 'Commercial Operations'}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-1 text-xs">
          <span className="text-[10px] text-[#94A3B8] uppercase font-medium tracking-wider">Staff Role Level</span>
          <span className="font-medium text-[#F1F5F9]">{user?.tier || 'Enterprise Ops Tier 2'}</span>
          <span className="text-[#94A3B8] text-[11px]">Role-Based Access Control Active</span>
        </div>
      </div>

      {/* Role & Permissions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Permitted Operations */}
        <div className="p-5 rounded-xl bg-[#111B2E] border border-[#263449]">
          <div className="flex items-center gap-2 pb-3 border-b border-[#263449] mb-4">
            <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
            <h3 className="font-semibold text-[#F1F5F9] text-xs">Staff Permitted Responsibilities</h3>
          </div>
          <ul className="space-y-2 text-xs text-[#F1F5F9]">
            {permittedActions.map((act, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] mt-1.5 shrink-0"></span>
                <span className="text-[#94A3B8]">{act}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Restricted Operations */}
        <div className="p-5 rounded-xl bg-[#111B2E] border border-[#263449]">
          <div className="flex items-center gap-2 pb-3 border-b border-[#263449] mb-4">
            <XCircle className="w-4 h-4 text-[#F87171]" />
            <h3 className="font-semibold text-[#F1F5F9] text-xs">Restricted Administrative Modules</h3>
          </div>
          <ul className="space-y-2 text-xs text-[#F1F5F9]">
            {restrictedAdminActions.map((act, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F87171] mt-1.5 shrink-0"></span>
                <span className="text-[#94A3B8]">{act}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 p-3 rounded-lg bg-[#0E1526] border border-[#263449] text-[11px] text-[#94A3B8]">
            Restricted modules are enforced at both API route middleware level and database authorization layers.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
