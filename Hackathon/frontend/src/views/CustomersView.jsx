import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit,
  Mail,
  Phone,
  Building,
  X
} from 'lucide-react';
import apiClient from '../api/apiClient';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/Toast';

export const CustomersView = ({
  onOpenRegister,
  onOpenCustomerDrawer
}) => {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Edit Customer Modal State
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, [statusFilter]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await apiClient.get('/staff/customers', { params });
      if (res.data.success) {
        setCustomers(res.data.customers || []);
      }
    } catch (err) {
      showToast('Error loading customer list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCustomers();
  };

  const openEditModal = (c) => {
    setEditingCustomer(c);
    setEditFormData({
      name: c.name,
      company_name: c.company_name,
      phone: c.phone,
      address: c.address,
      city: c.city || '',
      state: c.state || '',
      pincode: c.pincode || '',
      gst_number: c.gst_number || '',
      status: c.status || 'ACTIVE'
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const res = await apiClient.put(`/staff/customers/${editingCustomer.id}`, editFormData);
      if (res.data.success) {
        showToast(`Customer ${editFormData.company_name} updated successfully.`);
        setEditingCustomer(null);
        loadCustomers();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed.', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full pt-2">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#263449]">
        <div>
          <h1 className="text-xl font-semibold text-[#F1F5F9] tracking-tight">Customer Accounts</h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Manage client profiles, contact points, subscriptions, and account balances
          </p>
        </div>

        <button
          onClick={onOpenRegister}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#38BDF8] text-[#0B1020] text-xs font-semibold hover:bg-[#38BDF8]/90 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111B2E] border border-[#263449] p-3 rounded-xl">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-sm relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, company, code..."
            className="w-full h-8 px-3 pl-8 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] placeholder:text-[#94A3B8]/60 text-xs outline-none focus:border-[#38BDF8]/60"
          />
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-2.5" />
        </form>

        <div className="flex items-center gap-1">
          {['ALL', 'ACTIVE', 'INACTIVE', 'PROSPECT'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-[#172238] text-[#38BDF8] border border-[#263449]'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#172238]/60'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Data Table */}
      <div className="bg-[#111B2E] border border-[#263449] rounded-xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#263449] text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider bg-[#0E1526]/40">
                <th className="py-2.5 px-4 font-medium">Customer / Company</th>
                <th className="py-2.5 px-3 font-medium">Contact Person</th>
                <th className="py-2.5 px-3 font-medium">Location</th>
                <th className="py-2.5 px-3 font-medium text-center">Subscriptions</th>
                <th className="py-2.5 px-3 font-medium text-right">Outstanding (₹)</th>
                <th className="py-2.5 px-3 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263449] text-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#94A3B8]">
                    Loading customer accounts...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#94A3B8]">
                    No customers match the current criteria.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#172238]/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#172238] border border-[#263449] flex items-center justify-center font-semibold text-[#38BDF8] text-xs shrink-0">
                          {c.company_name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-[#F1F5F9] truncate text-xs">
                            {c.company_name}
                          </span>
                          <span className="text-[11px] text-[#94A3B8] font-mono">{c.customer_code}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-[#F1F5F9]">{c.name}</span>
                        <span className="text-[11px] text-[#94A3B8]">{c.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[#94A3B8]">
                      {c.city ? `${c.city}, ${c.state || ''}` : c.address}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-[#172238] text-[#F1F5F9] font-medium text-xs border border-[#263449]">
                        {c.active_subscriptions || 0}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`font-medium text-xs ${parseFloat(c.outstanding_balance) > 0 ? 'text-[#F87171]' : 'text-[#34D399]'}`}>
                        ₹{parseFloat(c.outstanding_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenCustomerDrawer(c.id)}
                          className="px-2 py-1 rounded bg-[#172238] hover:bg-[#263449] border border-[#263449] text-[#F1F5F9] text-xs font-medium transition-colors inline-flex items-center gap-1"
                          title="Customer 360 View"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#38BDF8]" />
                          <span>View 360</span>
                        </button>
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1 rounded text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#172238] transition-colors"
                          title="Edit Customer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-[#0E1526]/30 border-t border-[#263449] flex items-center justify-between text-xs text-[#94A3B8]">
          <span>Total Customers: {customers.length}</span>
          <span className="font-mono text-[11px]">Database Active</span>
        </div>
      </div>

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#111B2E] border border-[#263449] rounded-xl shadow-2xl p-6">
            <div className="flex justify-between items-center pb-3 border-b border-[#263449] mb-4">
              <h3 className="text-sm font-semibold text-[#F1F5F9]">Edit Customer Information</h3>
              <button
                onClick={() => setEditingCustomer(null)}
                className="text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] mb-1 font-medium">Company Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.company_name}
                    onChange={(e) => setEditFormData({ ...editFormData, company_name: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] outline-none focus:border-[#38BDF8]/60"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] mb-1 font-medium">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] outline-none focus:border-[#38BDF8]/60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] mb-1 font-medium">Phone</label>
                  <input
                    type="text"
                    required
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] outline-none focus:border-[#38BDF8]/60"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] mb-1 font-medium">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] outline-none focus:border-[#38BDF8]/60"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="PROSPECT">PROSPECT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1 font-medium">Address</label>
                <textarea
                  rows={2}
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] resize-none outline-none focus:border-[#38BDF8]/60"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#263449]">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-3.5 py-2 rounded-lg bg-[#172238] border border-[#263449] text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 rounded-lg bg-[#38BDF8] text-[#0B1020] font-semibold hover:bg-[#38BDF8]/90 transition-colors"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersView;
