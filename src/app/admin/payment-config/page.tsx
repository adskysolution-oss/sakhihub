'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { 
  CreditCard, 
  Save, 
  AlertCircle, 
  IndianRupee,
  ShieldCheck,
  Search,
  CheckCircle2
} from 'lucide-react';
import axios from 'axios';

export default function PaymentConfigPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // Override state
  const [searchPhone, setSearchPhone] = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [overrideLoading, setOverrideLoading] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const [res, pendingRes] = await Promise.all([
        axios.get('/api/admin/payment-config'),
        axios.get('/api/admin/users?status=pending_payment')
      ]);
      
      if (res.data.success) {
        setConfig(res.data.data);
      }
      if (pendingRes.data.success) {
        setPendingUsers(pendingRes.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch config', error);
      setMessage('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const refreshPending = async () => {
    try {
      const pendingRes = await axios.get('/api/admin/users?status=pending_payment');
      if (pendingRes.data.success) {
        setPendingUsers(pendingRes.data.data);
      }
    } catch (err) {}
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await axios.put('/api/admin/payment-config', config);
      if (res.data.success) {
        setMessage('Configuration saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleSearchUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPhone) return;
    
    setSearchLoading(true);
    setFoundUser(null);
    try {
      const res = await axios.get(`/api/admin/users?search=${searchPhone}`);
      if (res.data.success && res.data.data.length > 0) {
        setFoundUser(res.data.data[0]);
      } else {
        alert('User not found');
      }
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleOverride = async (type: string) => {
    if (!foundUser || !confirm(`Are you sure you want to mark ${type} as paid for ${foundUser.fullName}? This cannot be undone.`)) return;
    
    setOverrideLoading(true);
    try {
      const res = await axios.post('/api/admin/payment-override', {
        userId: foundUser._id,
        type: type !== 'all' ? type : undefined,
        action: type === 'all' ? 'complete_all' : undefined
      });
      if (res.data.success) {
        alert('Payment override successful');
        setFoundUser(null);
        setSearchPhone('');
        refreshPending();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Override failed');
    } finally {
      setOverrideLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-black text-secondary flex items-center gap-3">
          <CreditCard className="text-primary" />
          Payment Gateway Rules
        </h2>
        <p className="text-gray-500 mt-2 font-medium">Configure subscription and deposit amounts for each role.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Col: Config Form */}
        <div className="xl:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8">
            {message && (
              <div className={`p-4 rounded-xl mb-6 font-bold flex items-center gap-2 ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                {message.includes('success') ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {message}
              </div>
            )}

            <div className="space-y-8">
              {['vendor', 'sub_vendor', 'employee'].map((role) => (
                <div key={role} className="p-6 rounded-2xl bg-gray-50/50 border border-gray-100">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                    <div>
                      <h3 className="text-lg font-black text-secondary capitalize">{role.replace('_', ' ')} Settings</h3>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mt-1">Payment Configuration</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={config?.paymentRequired?.[role] || false}
                        onChange={(e) => setConfig({
                          ...config,
                          paymentRequired: { ...config.paymentRequired, [role]: e.target.checked }
                        })}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      <span className="ml-3 text-sm font-bold text-gray-700">Enable Gateway</span>
                    </label>
                  </div>

                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity ${!config?.paymentRequired?.[role] ? 'opacity-50 pointer-events-none' : ''}`}>
                    {/* Subscription */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                          <IndianRupee size={16} className="text-primary" /> Subscription (₹)
                        </label>
                        <input 
                          type="checkbox" 
                          checked={config?.subscriptionRequired?.[role] || false}
                          onChange={(e) => setConfig({
                            ...config,
                            subscriptionRequired: { ...config.subscriptionRequired, [role]: e.target.checked }
                          })}
                          className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                        />
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={config?.subscriptionAmount?.[role] || 0}
                        onChange={(e) => setConfig({
                          ...config,
                          subscriptionAmount: { ...config.subscriptionAmount, [role]: Number(e.target.value) }
                        })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                      />
                    </div>

                    {/* Deposit */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                          <ShieldCheck size={16} className="text-secondary" /> Security Deposit (₹)
                        </label>
                        <input 
                          type="checkbox" 
                          checked={config?.depositRequired?.[role] || false}
                          onChange={(e) => setConfig({
                            ...config,
                            depositRequired: { ...config.depositRequired, [role]: e.target.checked }
                          })}
                          className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                        />
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={config?.depositAmount?.[role] || 0}
                        onChange={(e) => setConfig({
                          ...config,
                          depositAmount: { ...config.depositAmount, [role]: Number(e.target.value) }
                        })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-4 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-70 disabled:hover:scale-100"
              >
                {saving ? 'Saving...' : <><Save size={16} /> Save Configuration</>}
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Manual Payment Confirmed by Admin */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-black text-secondary mb-2">Manual Payment Confirmed by Admin</h3>
            <p className="text-sm text-gray-500 mb-6 font-medium">Bypass payment gateway for a specific user after receiving payment through phone, UPI, cash, or offline method.</p>

            <form onSubmit={handleSearchUser} className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="Search by Mobile No..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium"
              />
              <button 
                type="submit"
                disabled={searchLoading}
                className="px-4 py-3 bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-colors disabled:opacity-50"
              >
                <Search size={18} />
              </button>
            </form>

            {foundUser && (
              <div className="p-4 rounded-2xl border-2 border-primary/20 bg-primary/5 space-y-4">
                <div>
                  <p className="font-bold text-secondary">{foundUser.fullName}</p>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">{foundUser.role.replace('_', ' ')} • {foundUser.mobile}</p>
                </div>
                
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                  <span className={`px-2 py-1 rounded-md ${foundUser.subscriptionPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>Sub: {foundUser.subscriptionPaid ? 'Paid' : 'Pending'}</span>
                  <span className={`px-2 py-1 rounded-md ${foundUser.depositPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>Dep: {foundUser.depositPaid ? 'Paid' : 'Pending'}</span>
                </div>

                <div className="pt-4 border-t border-primary/10 grid gap-2">
                  {!foundUser.subscriptionPaid && (
                    <button 
                      onClick={() => handleOverride('subscription')}
                      disabled={overrideLoading}
                      className="w-full py-2 bg-white border border-gray-200 text-gray-700 font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Mark Sub Paid
                    </button>
                  )}
                  {!foundUser.depositPaid && (
                    <button 
                      onClick={() => handleOverride('deposit')}
                      disabled={overrideLoading}
                      className="w-full py-2 bg-white border border-gray-200 text-gray-700 font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Mark Dep Paid
                    </button>
                  )}
                  {(!foundUser.subscriptionPaid || !foundUser.depositPaid) && (
                    <button 
                      onClick={() => handleOverride('all')}
                      disabled={overrideLoading}
                      className="w-full py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Confirm Payment & Unlock Next Step
                    </button>
                  )}
                </div>
              </div>
            )}

            {!foundUser && pendingUsers.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Pending Payments Queue</h4>
                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {pendingUsers.map(u => (
                    <div 
                      key={u._id} 
                      onClick={() => setFoundUser(u)}
                      className="p-4 border border-gray-100 rounded-2xl hover:border-primary/30 hover:bg-primary/5 cursor-pointer transition-colors"
                    >
                      <p className="font-bold text-secondary text-sm">{u.fullName}</p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{u.role.replace('_', ' ')} • {u.mobile}</p>
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!foundUser && pendingUsers.length === 0 && (
              <div className="mt-6 p-6 bg-gray-50 rounded-2xl text-center border border-dashed border-gray-200">
                <CheckCircle2 size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No pending payments</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
