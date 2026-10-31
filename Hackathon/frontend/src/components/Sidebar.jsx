import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  Receipt,
  CreditCard,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ activeTab, setActiveTab, collapsed, setCollapsed, onQuickSearch }) => {
  const { user, logout } = useAuth();

  const mainNav = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'quotations', label: 'Quotations', icon: FileSpreadsheet },
    { id: 'invoices', label: 'Invoices', icon: Receipt },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-[#0E1526] border-r border-[#263449] z-50 flex flex-col justify-between transition-all duration-200 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col flex-1 overflow-y-auto px-3.5 py-4">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2.5 mb-5 pb-3 border-b border-[#263449]/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#172238] border border-[#263449] flex items-center justify-center text-[#38BDF8] font-bold text-sm shrink-0">
              ⚡
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm text-[#F1F5F9] tracking-tight truncate">
                  Brightloop
                </span>
                <span className="text-[11px] text-[#94A3B8] truncate">
                  Subscription Ops
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-[#172238] border border-[#263449] text-[#38BDF8]">
              Staff
            </span>
          )}
        </div>

        {/* Quick Search */}
        {!collapsed ? (
          <div className="px-1 mb-4">
            <button
              onClick={onQuickSearch}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#111B2E] border border-[#263449] text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#38BDF8]/40 transition-colors text-xs"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span className="text-xs">Quick search...</span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded bg-[#172238] text-[10px] text-[#94A3B8] font-mono border border-[#263449]">
                ⌘K
              </kbd>
            </button>
          </div>
        ) : (
          <div className="flex justify-center mb-4">
            <button
              onClick={onQuickSearch}
              className="p-2 rounded-lg bg-[#111B2E] border border-[#263449] text-[#94A3B8] hover:text-[#38BDF8] transition-colors"
              title="Quick Search (⌘K)"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex flex-col gap-0.5 text-xs">
          {!collapsed && (
            <div className="px-2.5 pt-1 pb-1">
              <span className="text-[10px] font-semibold text-[#94A3B8]/70 uppercase tracking-wider">
                Main Workspace
              </span>
            </div>
          )}

          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left font-medium ${
                  isActive
                    ? 'bg-[#172238] text-white'
                    : 'text-[#94A3B8] hover:bg-[#172238]/60 hover:text-[#F1F5F9]'
                } ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#38BDF8] rounded-r"></span>
                )}
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#38BDF8]' : 'text-[#94A3B8]'
                  }`}
                />
                {!collapsed && (
                  <span className="truncate flex-1">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-medium">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4">
            <button
              onClick={logout}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors text-left font-medium w-full ${
                collapsed ? 'justify-center px-0' : ''
              }`}
              title="Logout"
            >
              <LogOut className="w-4 h-4 shrink-0 text-rose-400" />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </nav>
      </div>

      {/* Sidebar Footer: Staff Profile & Collapse Toggle */}
      <div className="p-3 border-t border-[#263449]/70 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#172238] border border-[#263449] flex items-center justify-center text-[#38BDF8] font-semibold text-xs shrink-0">
              {user?.name
                ? user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                : 'SJ'}
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-[#F1F5F9] truncate">
                  {user?.name || 'Sarah Jenkins'}
                </span>
                <span className="text-[11px] text-[#94A3B8] truncate">
                  {user?.email || 'sarah@brightloop.io'}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#172238] transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
