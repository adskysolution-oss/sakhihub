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
      phonepe: { merchantId: '', clientId: '', clientSecret: '', clientVersion: '1', webhookSecret: '', linkUrls: {} },
      razorpay: { keyId: '', keySecret: '', webhookSecret: '', linkUrls: {} }
    },
    subscriptionAmount: { vendor: 0, sub_vendor: 0, employee: 0 },
    depositAmount: { vendor: 0, sub_vendor: 0, employee: 0 },
    subscriptionRequired: { vendor: true, sub_vendor: true, employee: true },
    depositRequired: { vendor: true, sub_vendor: true, employee: true },
  });
  const [commConfig, setCommConfig] = useState<any>({
    membershipFee: 100,
    membershipPaymentEnabled: true,
    membershipOfflinePaymentEnabled: true,
    memberCommission: {
      employeeRecruiter: 20,
      subVendorRecruiter: 20,
      vendorRecruiter: 25,
      subVendorParent: 10,
      vendorParentDirect: 10,
      vendorGrandparent: 5
    }
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
  }, []);

  const fetchConfig = async () => {
    try {
      const [res, pendingRes, commRes] = await Promise.all([
        axios.get('/api/admin/payment-config'),
        axios.get('/api/admin/users?status=pending_payment'),
        axios.get('/api/admin/commission-config').catch(() => ({ data: { success: false } }))
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
            },
            razorpay: {
              keyId: res.data.data.providers?.razorpay?.keyId || '',
              keySecret: res.data.data.providers?.razorpay?.keySecret || '',
              webhookSecret: res.data.data.providers?.razorpay?.webhookSecret || '',
              linkUrls: res.data.data.providers?.razorpay?.linkUrls || {},
            }
          }
        });
      }
      if (pendingRes.data.success) {
        setPendingUsers(pendingRes.data.data);
      }
      if (commRes?.data?.success) {
        setCommConfig(commRes.data.data);
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
      if (pendingRes.data.success) setPendingUsers(pendingRes.data.data);
    } catch (err) {}
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const [res, commRes] = await Promise.all([
        axios.put('/api/admin/payment-config', config),
        axios.post('/api/admin/commission-config', {
          membershipFee: commConfig.membershipFee,
          membershipPaymentEnabled: commConfig.membershipPaymentEnabled,
          membershipOfflinePaymentEnabled: commConfig.membershipOfflinePaymentEnabled
        })
      ]);
      if (res.data.success && commRes.data.success) {
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



  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  const activeProviderStr = config.activeProvider as 'cashfree' | 'phonepe' | 'razorpay';

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-black text-secondary flex items-center gap-3">
          <Settings className="text-primary" />
          Payment Control Center
        </h2>
        <p className="text-gray-500 mt-2 font-medium">Configure global payment architecture, gateway routing, and pricing.</p>
      </div>

      <div className="max-w-5xl">
        <div className="space-y-6">
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
                    <option value="razorpay">Razorpay</option>
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
              
              {config.activeProvider === 'razorpay' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Key ID</label>
                    <input 
                      type="text" 
                      value={config.providers.razorpay.keyId}
                      onChange={(e) => setConfig({...config, providers: {...config.providers, razorpay: {...config.providers.razorpay, keyId: e.target.value}}})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Key Secret</label>
                    <input 
                      type="password" 
                      value={config.providers.razorpay.keySecret}
                      onChange={(e) => setConfig({...config, providers: {...config.providers, razorpay: {...config.providers.razorpay, keySecret: e.target.value}}})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Webhook Secret</label>
                    <input 
                      type="password" 
                      value={config.providers.razorpay.webhookSecret}
                      onChange={(e) => setConfig({...config, providers: {...config.providers, razorpay: {...config.providers.razorpay, webhookSecret: e.target.value}}})}
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
                    <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                        <label className="text-xs font-bold text-gray-700 flex items-center gap-2">
                          <IndianRupee size={16} className="text-primary" /> Require Subscription
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={config.subscriptionRequired?.[role] ?? true}
                            onChange={(e) => setConfig({...config, subscriptionRequired: { ...config.subscriptionRequired, [role]: e.target.checked }})}
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Amount (₹)</label>
                        <input
                          type="number"
                          value={config.subscriptionAmount?.[role] || 0}
                          onChange={(e) => setConfig({...config, subscriptionAmount: { ...config.subscriptionAmount, [role]: Number(e.target.value) }})}
                          disabled={!(config.subscriptionRequired?.[role] ?? true)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:bg-gray-50 font-bold"
                        />
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                        <label className="text-xs font-bold text-gray-700 flex items-center gap-2">
                          <ShieldCheck size={16} className="text-secondary" /> Require Deposit
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={config.depositRequired?.[role] ?? true}
                            onChange={(e) => setConfig({...config, depositRequired: { ...config.depositRequired, [role]: e.target.checked }})}
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Amount (₹)</label>
                        <input
                          type="number"
                          value={config.depositAmount?.[role] || 0}
                          onChange={(e) => setConfig({...config, depositAmount: { ...config.depositAmount, [role]: Number(e.target.value) }})}
                          disabled={!(config.depositRequired?.[role] ?? true)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:bg-gray-50 font-bold"
                        />
                      </div>
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

              {/* Membership Pricing & Configuration */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 mt-6">
                <h4 className="text-md font-black text-secondary capitalize mb-4">Membership (Member)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                      <label className="text-xs font-bold text-gray-700 flex items-center gap-2">
                        <IndianRupee size={16} className="text-primary" /> Require Paid Membership
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={commConfig.membershipPaymentEnabled}
                          onChange={(e) => setCommConfig({...commConfig, membershipPaymentEnabled: e.target.checked})}
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Amount (₹)</label>
                      <input
                        type="number"
                        value={commConfig.membershipFee}
                        onChange={(e) => setCommConfig({...commConfig, membershipFee: Number(e.target.value)})}
                        disabled={!commConfig.membershipPaymentEnabled}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:bg-gray-50 font-bold"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                      <label className="text-xs font-bold text-gray-700 flex items-center gap-2">
                        <CreditCard size={16} className="text-primary" /> Allow Offline Bank Transfer
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={commConfig.membershipOfflinePaymentEnabled !== false}
                          onChange={(e) => setCommConfig({...commConfig, membershipOfflinePaymentEnabled: e.target.checked})}
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    <p className="text-[11px] text-gray-400 font-bold leading-relaxed mt-2">
                      Allow members to view NGO bank transfer details and instructions on their dashboard/receipt screens to pay offline.
                    </p>
                  </div>
                </div>


              </div>
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
      </div>
    </DashboardLayout>
  );
}
