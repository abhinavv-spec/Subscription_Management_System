import React from 'react';
import { Search, Bell, Shield, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ activeTab, collapsed, onNotificationClick, searchQuery, setSearchQuery }) => {
  const { user } = useAuth();

  const titleMap = {
    overview: 'Overview',
    customers: 'Customers',
    quotations: 'Quotations',
    invoices: 'Invoices',
    payments: 'Payments',
    reports: 'Reports'
  };

  return (
    <header
      className={`fixed top-0 right-0 h-14 bg-[#0B1020]/90 backdrop-blur-md border-b border-[#263449] z-40 flex items-center justify-between px-6 transition-all duration-200 ${
        collapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
        <span className="hover:text-[#F1F5F9] transition-colors cursor-pointer">Brightloop</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#263449]" />
        <span className="hover:text-[#F1F5F9] transition-colors cursor-pointer">Staff</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#263449]" />
        <span className="text-[#F1F5F9] font-medium">{titleMap[activeTab] || 'Workspace'}</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Global Search Field */}
        <div className="hidden md:flex items-center gap-2 bg-[#111B2E] border border-[#263449] px-3 py-1.5 rounded-lg focus-within:border-[#38BDF8]/60 transition-colors">
          <Search className="w-3.5 h-3.5 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search accounts, quotes, invoices..."
            className="bg-transparent border-0 outline-none text-[#F1F5F9] placeholder:text-[#94A3B8]/60 text-xs w-56 focus:ring-0"
          />
        </div>

        {/* Staff Role Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#172238] border border-[#263449] px-2.5 py-1 rounded-md text-[11px] text-[#94A3B8]">
          <Shield className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span className="font-medium text-[#F1F5F9]">Staff Ops</span>
        </div>

        {/* Notifications Icon */}
        <button
          onClick={onNotificationClick}
          className="relative p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#172238] transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#38BDF8]"></span>
        </button>

        {/* Profile Avatar / Menu */}
        <div className="flex items-center gap-2 pl-1 border-l border-[#263449]">
          <div className="w-7 h-7 rounded-full bg-[#172238] border border-[#263449] flex items-center justify-center text-[#F1F5F9] text-xs font-semibold">
            {user?.name
              ? user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
              : 'S'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
