import React, { useState } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export const LoginView = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('sarah@brightloop.io');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        showToast('Signed in successfully! Welcome to Brightloop.');
      } else {
        showToast(res.message || 'Authentication failed', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Login error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1020] flex items-center justify-center p-4 relative">
      <div className="w-full max-w-sm bg-[#111B2E] border border-[#263449] rounded-xl p-8 shadow-2xl">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#172238] border border-[#263449] text-[#38BDF8] font-bold text-base mb-3">
            ⚡
          </div>
          <h1 className="text-xl font-semibold text-[#F1F5F9] tracking-tight">Brightloop</h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Staff Operations Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1">
              Staff Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@brightloop.io"
                className="w-full h-10 px-3 pl-9 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] text-xs outline-none focus:border-[#38BDF8]/60 transition-colors"
              />
              <Mail className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 px-3 pl-9 rounded-lg bg-[#0E1526] border border-[#263449] text-[#F1F5F9] text-xs outline-none focus:border-[#38BDF8]/60 transition-colors"
              />
              <Lock className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-[#38BDF8] text-[#0B1020] rounded-lg text-xs font-semibold hover:bg-[#38BDF8]/90 transition-colors flex items-center justify-center gap-2 mt-2 shadow-sm disabled:opacity-50"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#263449] text-center text-[11px] text-[#94A3B8]">
          Demo Access: <span className="text-[#F1F5F9] font-mono">sarah@brightloop.io</span> / <span className="text-[#F1F5F9] font-mono">password123</span>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
