'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { 
  CreditCard, Save, AlertCircle, IndianRupee, ShieldCheck,
  Search, CheckCircle2, Link2, ClipboardList, ThumbsUp,
  ThumbsDown, Clock, ExternalLink, Settings, Shield
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function PaymentConfigPage() {
  const [config, setConfig] = useState<any>({
    paymentMethod: 'payment_link',
    activeProvider: 'cashfree',
    environment: 'production',
    providers: {
      cashfree: { appId: '', secretKey: '', linkUrls: {} },
      phonepe: { merchantId: '', clientId: '', clientSecret: '', clientVersion: '1', webhookSecret: '', linkUrls: {} }
    },
    subscriptionAmount: { vendor: 0, sub_vendor: 0, employee: 0 },
    depositAmount: { vendor: 0, sub_vendor: 0, employee: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // Override state
  const [searchPhone, setSearchPhone] = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [overrideLoading, setOverrideLoading] = useState(false);

  // Manual payment requests state
  const [manualRequests, setManualRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState<string | null>(null);
  const [activeRequestsTab, setActiveRequestsTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    fetchConfig();
    fetchManualRequests('pending');
  }, []);

  const fetchConfig = async () => {
    try {
      const [res, pendingRes] = await Promise.all([
        axios.get('/api/admin/payment-config'),
        axios.get('/api/admin/users?status=pending_payment')
      ]);
      
      if (res.data.success) {
        // Merge fetched config with default structure to avoid undefined errors
        setConfig({
          ...res.data.data,
          paymentMethod: res.data.data.paymentMethod || 'payment_link',
          activeProvider: res.data.data.activeProvider || 'cashfree',
          environment: res.data.data.environment || 'production',
          providers: {
            cashfree: {
              appId: res.data.data.providers?.cashfree?.appId || '',
              secretKey: res.data.data.providers?.cashfree?.secretKey || '',
              linkUrls: res.data.data.providers?.cashfree?.linkUrls || res.data.data.paymentRequestUrls || {},
            },
            phonepe: {
              merchantId: res.data.data.providers?.phonepe?.merchantId || '',
              clientId: res.data.data.providers?.phonepe?.clientId || '',
              clientSecret: res.data.data.providers?.phonepe?.clientSecret || '',
              clientVersion: res.data.data.providers?.phonepe?.clientVersion || '1',
              webhookSecret: res.data.data.providers?.phonepe?.webhookSecret || '',
              linkUrls: res.data.data.providers?.phonepe?.linkUrls || {},
            }
          }
        });
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

  const fetchManualRequests = async (statusFilter: 'pending' | 'approved' | 'rejected') => {
    setRequestsLoading(true);
    try {
      const res = await axios.get(`/api/admin/manual-payment-requests?status=${statusFilter}`);
      if (res.data.success) setManualRequests(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleRequestsTabChange = (tab: 'pending' | 'approved' | 'rejected') => {
    setActiveRequestsTab(tab);
    fetchManualRequests(tab);
  };

  const refreshPending = async () => {
    try {
      const pendingRes = await axios.get('/api/admin/users?status=pending_payment');
      if (pendingRes.data.success) setPendingUsers(pendingRes.data.data);
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
        toast.success('Configuration saved successfully');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to save configuration');
      toast.error('Failed to save configuration');
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
        toast.error('User not found');
      }
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleOverride = async (type: string) => {
    if (!foundUser || !confirm(`Are you sure you want to mark ${type} as paid?`)) return;
    setOverrideLoading(true);
    try {
      const res = await axios.post('/api/admin/payment-override', {
        userId: foundUser._id,
        type: type !== 'all' ? type : undefined,
        action: type === 'all' ? 'complete_all' : undefined
      });
      if (res.data.success) {
        toast.success('Payment override successful');
        setFoundUser(null);
        setSearchPhone('');
        refreshPending();
      }
    } catch (error: any) {
      toast.error('Override failed');
    } finally {
      setOverrideLoading(false);
    }
  };

  const handleReviewRequest = async (requestId: string, action: 'approve' | 'reject') => {
    if (!confirm(`Are you sure you want to ${action} this payment request?`)) return;
    setReviewLoading(requestId);
    try {
      const res = await axios.patch('/api/admin/manual-payment-requests', { requestId, action });
      if (res.data.success) {
        toast.success(action === 'approve' ? 'Payment approved!' : 'Request rejected.');
        fetchManualRequests(activeRequestsTab);
        refreshPending();
      }
    } catch (error: any) {
      toast.error(`Failed to ${action} request`);
    } finally {
      setReviewLoading(null);
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

  const activeProviderStr = config.activeProvider as 'cashfree' | 'phonepe';

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-black text-secondary flex items-center gap-3">
          <Settings className="text-primary" />
          Payment Control Center
        </h2>
        <p className="text-gray-500 mt-2 font-medium">Configure global payment architecture, gateway routing, and pricing.</p>
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

            {/* PAYMENT ENGINE SETTINGS */}
            <div className="mb-8 p-6 rounded-2xl bg-primary/5 border border-primary/20">
              <h3 className="text-lg font-black text-secondary mb-4 flex items-center gap-2">
                <Shield className="text-primary" size={20} /> Architecture Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Payment Method</label>
                  <select 
                    value={config.paymentMethod}
                    onChange={(e) => setConfig({...config, paymentMethod: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 font-bold text-gray-700 bg-white"
                  >
                    <option value="payment_link">Payment Link (Redirect)</option>
                    <option value="gateway_api">Gateway API (Inline)</option>
                    <option value="manual">Manual Approval Only</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Payment Provider</label>
                  <select 
                    value={config.activeProvider}
                    onChange={(e) => setConfig({...config, activeProvider: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 font-bold text-gray-700 bg-white"
                  >
                    <option value="cashfree">Cashfree</option>
                    <option value="phonepe">PhonePe</option>
                    <option value="razorpay" disabled>Razorpay (Coming Soon)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Environment</label>
                  <select 
                    value={config.environment}
                    onChange={(e) => setConfig({...config, environment: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 font-bold text-gray-700 bg-white"
                  >
                    <option value="production">Production</option>
                    <option value="sandbox">Sandbox (Testing)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* GATEWAY PROVIDER CONFIGURATION */}
            <div className="mb-8">
              <h3 className="text-lg font-black text-secondary mb-4 pb-2 border-b">Gateway Credentials ({config.activeProvider.toUpperCase()})</h3>
              
              {config.activeProvider === 'cashfree' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">App ID</label>
                    <input 
                      type="text" 
                      value={config.providers.cashfree.appId}
                      onChange={(e) => setConfig({...config, providers: {...config.providers, cashfree: {...config.providers.cashfree, appId: e.target.value}}})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Secret Key</label>
                    <input 
                      type="password" 
                      value={config.providers.cashfree.secretKey}
                      onChange={(e) => setConfig({...config, providers: {...config.providers, cashfree: {...config.providers.cashfree, secretKey: e.target.value}}})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200"
                    />
                  </div>
                </div>
              )}

              {config.activeProvider === 'phonepe' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Merchant ID</label>
                    <input 
                      type="text" 
                      value={config.providers.phonepe.merchantId}
                      onChange={(e) => setConfig({...config, providers: {...config.providers, phonepe: {...config.providers.phonepe, merchantId: e.target.value}}})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Client ID</label>
                    <input 
                      type="text" 
                      value={config.providers.phonepe.clientId}
                      onChange={(e) => setConfig({...config, providers: {...config.providers, phonepe: {...config.providers.phonepe, clientId: e.target.value}}})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Client Secret (Salt Key)</label>
                    <input 
                      type="password" 
                      value={config.providers.phonepe.clientSecret}
                      onChange={(e) => setConfig({...config, providers: {...config.providers, phonepe: {...config.providers.phonepe, clientSecret: e.target.value}}})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Client Version (Salt Index)</label>
                    <input 
                      type="text" 
                      value={config.providers.phonepe.clientVersion}
                      onChange={(e) => setConfig({...config, providers: {...config.providers, phonepe: {...config.providers.phonepe, clientVersion: e.target.value}}})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Webhook Secret</label>
                    <input 
                      type="password" 
                      value={config.providers.phonepe.webhookSecret}
                      onChange={(e) => setConfig({...config, providers: {...config.providers, phonepe: {...config.providers.phonepe, webhookSecret: e.target.value}}})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ROLE SETTINGS */}
            <h3 className="text-lg font-black text-secondary mb-4 pb-2 border-b">Pricing & Links</h3>
            <div className="space-y-6">
              {['vendor', 'sub_vendor', 'employee'].map((role) => (
                <div key={role} className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                  <h4 className="text-md font-black text-secondary capitalize mb-4">{role.replace('_', ' ')}</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 flex items-center gap-2 mb-2">
                        <IndianRupee size={14} className="text-primary" /> Subscription Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={config.subscriptionAmount?.[role] || 0}
                        onChange={(e) => setConfig({...config, subscriptionAmount: { ...config.subscriptionAmount, [role]: Number(e.target.value) }})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 flex items-center gap-2 mb-2">
                        <ShieldCheck size={14} className="text-secondary" /> Deposit Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={config.depositAmount?.[role] || 0}
                        onChange={(e) => setConfig({...config, depositAmount: { ...config.depositAmount, [role]: Number(e.target.value) }})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-gray-200">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                        Subscription Payment Link URL ({config.activeProvider})
                      </label>
                      <input
                        type="url"
                        value={config.providers[activeProviderStr]?.linkUrls?.[role]?.subscription || ''}
                        onChange={(e) => {
                          const newProviders = {...config.providers};
                          if (!newProviders[activeProviderStr].linkUrls) newProviders[activeProviderStr].linkUrls = {};
                          if (!newProviders[activeProviderStr].linkUrls[role]) newProviders[activeProviderStr].linkUrls[role] = {};
                          newProviders[activeProviderStr].linkUrls[role].subscription = e.target.value;
                          setConfig({...config, providers: newProviders});
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                        Deposit Payment Link URL ({config.activeProvider})
                      </label>
                      <input
                        type="url"
                        value={config.providers[activeProviderStr]?.linkUrls?.[role]?.deposit || ''}
                        onChange={(e) => {
                          const newProviders = {...config.providers};
                          if (!newProviders[activeProviderStr].linkUrls) newProviders[activeProviderStr].linkUrls = {};
                          if (!newProviders[activeProviderStr].linkUrls[role]) newProviders[activeProviderStr].linkUrls[role] = {};
                          newProviders[activeProviderStr].linkUrls[role].deposit = e.target.value;
                          setConfig({...config, providers: newProviders});
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs"
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
                className="px-8 py-4 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-70"
              >
                {saving ? 'Saving...' : <><Save size={16} /> Save Architecture Details</>}
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Manual Processing & Requests */}
        <div className="space-y-6">
          {/* Manual Admin Override */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-black text-secondary mb-2">Manual Approval</h3>
            <p className="text-sm text-gray-500 mb-6 font-medium">Bypass gateway and mark offline payments.</p>

            <form onSubmit={handleSearchUser} className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="Search by Mobile..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 outline-none text-sm"
              />
              <button type="submit" disabled={searchLoading} className="px-4 py-2 bg-secondary text-white rounded-xl">
                <Search size={18} />
              </button>
            </form>

            {foundUser && (
              <div className="p-4 rounded-2xl border-2 border-primary/20 bg-primary/5 space-y-4">
                <p className="font-bold text-secondary">{foundUser.fullName}</p>
                <div className="pt-4 border-t border-primary/10 grid gap-2">
                  {!foundUser.subscriptionPaid && (
                    <button onClick={() => handleOverride('subscription')} className="w-full py-2 bg-white border text-xs rounded-lg">Mark Sub Paid</button>
                  )}
                  {!foundUser.depositPaid && (
                    <button onClick={() => handleOverride('deposit')} className="w-full py-2 bg-white border text-xs rounded-lg">Mark Dep Paid</button>
                  )}
                  {(!foundUser.subscriptionPaid || !foundUser.depositPaid) && (
                    <button onClick={() => handleOverride('all')} className="w-full py-3 bg-primary text-white text-xs rounded-xl shadow-lg">Confirm Payment</button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Verification Requests */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-black text-secondary mb-4 flex items-center gap-2"><ClipboardList size={20}/> Verification Requests</h3>
            
            <div className="flex gap-1 p-1 bg-gray-50 rounded-xl mb-4">
              {(['pending', 'approved', 'rejected'] as const).map(tab => (
                <button key={tab} onClick={() => handleRequestsTabChange(tab)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase ${activeRequestsTab === tab ? 'bg-white shadow' : 'text-gray-400'}`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {manualRequests.map(req => (
                <div key={req._id} className="p-4 border rounded-xl">
                  <p className="font-bold text-sm">{req.userId?.fullName || req.name}</p>
                  <p className="text-xs text-gray-500 mb-2">₹{req.amount} - {req.type}</p>
                  <p className="text-[10px] bg-gray-100 p-1.5 rounded font-mono break-all">{req.transactionId}</p>
                  
                  {req.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => handleReviewRequest(req._id, 'approve')} className="flex-1 py-2 bg-green-500 text-white rounded text-[10px] uppercase font-bold">Approve</button>
                      <button onClick={() => handleReviewRequest(req._id, 'reject')} className="flex-1 py-2 border text-red-500 rounded text-[10px] uppercase font-bold">Reject</button>
                    </div>
                  )}
                </div>
              ))}
              {manualRequests.length === 0 && <p className="text-xs text-center text-gray-400 py-4">No {activeRequestsTab} requests</p>}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
