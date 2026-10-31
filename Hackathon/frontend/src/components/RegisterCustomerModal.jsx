import React, { useState } from 'react';
import { X, UserPlus, Building, Mail, Phone, FileText } from 'lucide-react';
import apiClient from '../api/apiClient';
import { useToast } from './Toast';

export const RegisterCustomerModal = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gst_number: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.company_name || !formData.email || !formData.phone || !formData.address) {
      showToast('Please fill in all required customer fields.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/staff/customers', formData);
      if (res.data.success) {
        showToast(`Customer ${formData.company_name} added successfully! (${res.data.customer_code})`);
        onSuccess && onSuccess(res.data);
        onClose();
        setFormData({
          name: '',
          company_name: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          gst_number: ''
        });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to register customer.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-[#111B2E] border border-[#263449] rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#263449] bg-[#0E1526]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#172238] border border-[#263449] flex items-center justify-center text-[#38BDF8]">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#F1F5F9]">Add Customer</h3>
              <p className="text-xs text-[#94A3B8]">Create a corporate customer record in Brightloop</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[#94A3B8] font-medium mb-1">
                Company Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Acme Technologies Pvt Ltd"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full h-9 px-3 pl-8 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] outline-none focus:border-[#38BDF8]/60"
                />
                <Building className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-[#94A3B8] font-medium mb-1">
                Primary Contact Person *
              </label>
              <input
                type="text"
                required
                placeholder="Rajesh Kumar"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-9 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] outline-none focus:border-[#38BDF8]/60"
              />
            </div>

            <div>
              <label className="block text-[#94A3B8] font-medium mb-1">
                Billing Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="billing@acme.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-9 px-3 pl-8 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] outline-none focus:border-[#38BDF8]/60"
                />
                <Mail className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-[#94A3B8] font-medium mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-9 px-3 pl-8 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] outline-none focus:border-[#38BDF8]/60"
                />
                <Phone className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-3" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[#94A3B8] font-medium mb-1">
              Registered Office Address *
            </label>
            <textarea
              required
              rows={2}
              placeholder="Building, street, suite number"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2.5 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] outline-none focus:border-[#38BDF8]/60 resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[#94A3B8] font-medium mb-1">City</label>
              <input
                type="text"
                placeholder="Bengaluru"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full h-9 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] outline-none focus:border-[#38BDF8]/60"
              />
            </div>
            <div>
              <label className="block text-[#94A3B8] font-medium mb-1">State</label>
              <input
                type="text"
                placeholder="Karnataka"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full h-9 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] outline-none focus:border-[#38BDF8]/60"
              />
            </div>
            <div>
              <label className="block text-[#94A3B8] font-medium mb-1">Pincode</label>
              <input
                type="text"
                placeholder="560100"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full h-9 px-3 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] outline-none focus:border-[#38BDF8]/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#94A3B8] font-medium mb-1">
              GSTIN / Tax Identification Number
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="29AAAAA0000A1Z5"
                value={formData.gst_number}
                onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                className="w-full h-9 px-3 pl-8 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] outline-none focus:border-[#38BDF8]/60 uppercase"
              />
              <FileText className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-3" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#263449]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg bg-[#172238] border border-[#263449] text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-[#0B1020] font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterCustomerModal;
