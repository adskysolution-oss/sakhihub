'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import {
  IndianRupee, TrendingUp, Users, ShieldCheck, ArrowDownRight, ArrowUpRight,
  Search, Filter, CheckCircle2, Clock, XCircle, Landmark, Receipt, FileText,
  Printer, ArrowRight, ShieldAlert, Award, Settings, Save, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function AdminFinancePage() {
  const [stats, setStats] = useState<any>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'revenue' | 'wallets' | 'payouts' | 'ledger' | 'config'>('revenue');
  const [ledgerCategoryFilter, setLedgerCategoryFilter] = useState<string>('all');

  const getProductionLabel = (txn: any) => {
    if (!txn) return 'System Entry';
    const category = txn.category || txn.ledgerCategory;
    const desc = txn.description || '';
    
    if (txn.ledgerCategory === 'payment') {
      return desc || 'Platform Payer Collection';
    }
    if (category === 'withdrawal' || category === 'payout') {
      return 'Manual Settlement Entry';
    }
    if (category === 'refund' || category === 'reversal') {
      return 'Reversal / Refund Entry';
    }
    if (category === 'adjustment') {
      return 'System Adjustment / Override';
    }
    if (category === 'override') {
      return 'Manual Override Entry';
    }
    
    // Membership commission splits
    if (category === 'commission_member' || category === 'commission_split' || txn.ledgerCategory === 'commission_split') {
      if (desc.toLowerCase().includes('tier 2') || desc.toLowerCase().includes('indirect member commission (tier 2)')) {
        return 'Tier 2 Coordinator Reward';
      }
      if (desc.toLowerCase().includes('tier 3') || desc.toLowerCase().includes('indirect member commission (tier 3)')) {
        return 'Tier 3 Network Reward';
      }
      if (desc.toLowerCase().includes('indirect')) {
        return 'Tier 2 Coordinator Reward';
      }
      if (desc.toLowerCase().includes('grandparent') || desc.toLowerCase().includes('tier 3')) {
        return 'Tier 3 Network Reward';
      }
      return 'Direct Referral Reward';
    }

    // Subscription/Deposit commission splits
    if (category === 'commission_subscription' || category === 'commission_deposit') {
      if (desc.toLowerCase().includes('indirect') || desc.toLowerCase().includes('grandparent') || desc.toLowerCase().includes('tier 2') || desc.toLowerCase().includes('tier 3')) {
        if (desc.toLowerCase().includes('grandparent') || desc.toLowerCase().includes('tier 3')) {
          return 'Tier 3 Network Reward';
        }
        return 'Tier 2 Coordinator Reward';
      }
      return 'Direct Referral Reward';
    }

    return 'System Commission Entry';
  };

  const getEntryClassLabel = (category: string) => {
    switch (category) {
      case 'payment':
      case 'subscription':
      case 'deposit':
      case 'membership':
        return 'Platform Inbound Collection';
      case 'commission_subscription':
      case 'commission_deposit':
      case 'commission_member':
      case 'commission_split':
        return 'Commission Split Allocation';
      case 'withdrawal':
      case 'payout':
        return 'Payout Settlement Debit';
      case 'refund':
      case 'reversal':
        return 'Reversal Credit / Rebound';
      case 'adjustment':
        return 'System Adjustment';
      case 'override':
        return 'Admin Manual Override';
      default:
        return 'General Ledger Event';
    }
  };

  // Dynamic Commission Configurations State
  const [commConfig, setCommConfig] = useState<any>({
    subscriptionCommission: { vendorPct: 10, subVendorPct: 5, employeePct: 0 },
    depositCommission: { vendorPct: 10, subVendorPct: 5, employeePct: 0 },
    memberCommission: {
      employeeRecruiter: 20,
      subVendorRecruiter: 20,
      vendorRecruiter: 25,
      subVendorParent: 10,
      vendorParentDirect: 10,
      vendorGrandparent: 5
    },
    payoutRules: { minWithdrawalAmount: 500, allowAutoSettle: false }
  });

  // Query Filters
  const [role, setRole] = useState('');
  const [user, setUser] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [status, setStatus] = useState('');
  const [district, setDistrict] = useState('');
  const [block, setBlock] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  // Settle Modal state
  const [selectedTxn, setSelectedTxn] = useState<any>(null);
  const [settleAction, setSettleAction] = useState<'approve' | 'reject'>('approve');
  const [settleRemarks, setSettleRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (role) queryParams.append('role', role);
      if (user) queryParams.append('user', user);
      if (paymentType) queryParams.append('paymentType', paymentType);
      if (status) queryParams.append('status', status);
      if (district) queryParams.append('district', district);
      if (block) queryParams.append('block', block);
      if (dateStart) queryParams.append('dateStart', dateStart);
      if (dateEnd) queryParams.append('dateEnd', dateEnd);

      const res = await axios.get(`/api/admin/finance?${queryParams.toString()}`);
      if (res.data.success) {
        setStats(res.data.data.stats);
        setWallets(res.data.data.wallets);
        setPaymentsList(res.data.data.paymentsList);
        setLedger(res.data.data.ledger);
      }
    } catch (error) {
      console.error('Failed to fetch admin finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommissionConfig = async () => {
    try {
      const res = await axios.get('/api/admin/commission-config');
      if (res.data.success) {
        setCommConfig(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch commission configs:', err);
    }
  };

  useEffect(() => {
    fetchFinanceData();
    fetchCommissionConfig();
  }, [role, paymentType, status, district, block, dateStart, dateEnd]);

  // Handle manual submit search filter
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFinanceData();
  };

  const handleResetFilters = () => {
    setRole('');
    setUser('');
    setPaymentType('');
    setStatus('');
    setDistrict('');
    setBlock('');
    setDateStart('');
    setDateEnd('');
  };

  // Commission Config Submit Handler
  const handleSaveCommissionConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await axios.post('/api/admin/commission-config', commConfig);
      if (res.data.success) {
        setToastMessage('Commission configuration updated successfully!');
        setCommConfig(res.data.data);
        setTimeout(() => setToastMessage(''), 3000);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update commission settings.');
    } finally {
      setActionLoading(false);
    }
  };

  // Payout settlement handler
  const handleSettlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxn) return;

    setActionLoading(true);
    try {
      const res = await axios.patch('/api/admin/finance', {
        transactionId: selectedTxn._id,
        action: settleAction,
        remarks: settleRemarks
      });

      if (res.data.success) {
        setToastMessage(`Withdrawal payout request successfully ${settleAction}d!`);
        setSelectedTxn(null);
        setSettleRemarks('');
        await fetchFinanceData();
        setTimeout(() => setToastMessage(''), 3000);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to settle payout request.');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadge = (badgeRole: string) => {
    const roles: any = {
      vendor: 'bg-purple-50 text-purple-600 border-purple-100',
      sub_vendor: 'bg-blue-50 text-blue-600 border-blue-100',
      employee: 'bg-amber-50 text-amber-600 border-amber-100',
      member: 'bg-rose-50 text-rose-600 border-rose-100',
      super_admin: 'bg-red-50 text-red-600 border-red-100'
    };
    const label: any = {
      vendor: 'Vendor',
      sub_vendor: 'Sub-Vendor',
      employee: 'Employee',
      member: 'Member',
      super_admin: 'Admin'
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${roles[badgeRole] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
        {label[badgeRole] || badgeRole}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 print:p-0">

        {/* Title Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-secondary tracking-tight">Finance Control Center</h1>
            <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Administrative double-entry ledger audits, network cash flows, and payout settlements</p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-3.5 bg-white border-2 border-gray-100 rounded-2xl text-secondary font-black text-[10px] uppercase tracking-widest hover:border-primary shadow-sm active:scale-95 transition-all"
          >
            <Printer size={16} /> Print General Ledger
          </button>
        </header>

        {/* Action Toasts */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl font-bold text-xs flex items-center gap-2 relative z-50 shadow-md"
            >
              <CheckCircle2 size={16} />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Summary Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* TOTAL REVENUE */}
          <div className="bg-gradient-to-br from-secondary via-secondary-dark to-slate-900 p-8 rounded-[35px] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-primary/20 rounded-full blur-3xl group-hover:scale-125 transition-all duration-500"></div>
            <div className="flex justify-between items-center mb-6 relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                <TrendingUp size={24} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/25">Gross Revenue</span>
            </div>
            <h3 className="text-4xl font-black tracking-tight mb-1 relative z-10">₹{stats?.totalRevenue?.toLocaleString('en-IN') || '0'}</h3>
            <p className="text-white/60 text-[9px] font-black uppercase tracking-wider relative z-10">
              Subs: ₹{stats?.subscriptionRevenue?.toLocaleString('en-IN')} | Deps: ₹{stats?.depositRevenue?.toLocaleString('en-IN')} | Mbrs: ₹{stats?.membershipRevenue?.toLocaleString('en-IN')}
            </p>
          </div>

          {/* TOTAL COMMISSIONS LEDGER */}
          <div className="bg-white p-6 rounded-[35px] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center">
                <Award size={20} />
              </div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">Commissions Distributed</span>
            </div>
            <div>
              <h4 className="text-3xl font-black text-secondary tracking-tight mb-1">₹{stats?.commissionDistributed?.toLocaleString('en-IN') || '0'}</h4>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                Pending Transit: ₹{stats?.commissionPending?.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* PENDING WITHDRAWALS MANAGER */}
          <div className="bg-white p-6 rounded-[35px] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
                <Clock size={20} />
              </div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">Pending Payouts</span>
            </div>
            <div>
              <h4 className="text-3xl font-black text-secondary tracking-tight mb-1">₹{stats?.withdrawalsPending?.toLocaleString('en-IN') || '0'}</h4>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                Settled Out: ₹{stats?.withdrawalsCompleted?.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* NET SYSTEM INCOME */}
          <div className="bg-white p-6 rounded-[35px] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                <IndianRupee size={20} />
              </div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">Platform Net Surplus</span>
            </div>
            <div>
              <h4 className="text-3xl font-black text-emerald-600 tracking-tight mb-1">₹{stats?.netIncome?.toLocaleString('en-IN') || '0'}</h4>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Retained Earnings</p>
            </div>
          </div>

        </section>

        {/* Administrative Filters - Hidden on Print */}
        <section className="bg-white rounded-[35px] border border-gray-100 shadow-sm p-6 print:hidden">
          <h4 className="text-[10px] font-black text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
            <Filter size={14} className="text-primary" /> Filter Financial Reports
          </h4>
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">

            <div>
              <input
                type="text"
                placeholder="Search user, mobile, or code..."
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8f9fa] border-none text-secondary rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8f9fa] border-none text-secondary rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All Hierarchy Roles</option>
                <option value="vendor">Vendors</option>
                <option value="sub_vendor">Sub-Vendors</option>
                <option value="employee">Employees</option>
              </select>
            </div>

            <div>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8f9fa] border-none text-secondary rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All Payment Types</option>
                <option value="subscription">Platform Subscription</option>
                <option value="deposit">Security Deposit</option>
                <option value="membership">Member Registrations</option>
              </select>
            </div>

            <div>
              <input
                type="text"
                placeholder="District..."
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8f9fa] border-none text-secondary rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Block..."
                value={block}
                onChange={(e) => setBlock(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8f9fa] border-none text-secondary rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8f9fa] border-none text-secondary rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8f9fa] border-none text-secondary rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-secondary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary-dark transition-all"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-3 bg-gray-50 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
              >
                Reset
              </button>
            </div>

          </form>
        </section>

        {/* Tab Selection */}
        <section className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-6 md:p-8">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-gray-100 pb-6 print:hidden">
            <div className="flex flex-wrap gap-2 p-1 bg-gray-50 rounded-2xl">
              {(['revenue', 'wallets', 'payouts', 'ledger', 'config'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === tab ? 'bg-white text-secondary shadow-sm' : 'text-gray-400 hover:text-secondary'}`}
                >
                  {tab === 'revenue' ? 'Revenue Streams' : tab === 'wallets' ? 'Hierarchy Wallets' : tab === 'payouts' ? 'Payout Settlements' : tab === 'ledger' ? 'Audit Ledger' : 'Commission Settings'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Filtering System Ledgers...</p>
            </div>
          ) : (
            <div className="space-y-6">

              {/* 1. REVENUE STREAMS */}
              {activeSubTab === 'revenue' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Payer User / Network</th>
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Stream Description</th>
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Method & Reference</th>
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                        <th className="pb-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Amount Paid</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {paymentsList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-gray-400 text-xs font-medium">No successful revenues match the active filter criteria.</td>
                        </tr>
                      ) : (
                        paymentsList.map((pay) => (
                          <tr key={pay.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-5 pr-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center font-black text-secondary text-sm">
                                  {pay.user?.fullName?.charAt(0) || 'P'}
                                </div>
                                <div>
                                  <p className="font-bold text-secondary text-xs">{pay.user?.fullName || 'Direct Walk-in'}</p>
                                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{pay.user?.mobile}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-5 pr-4">
                              <div className="flex flex-col gap-1">
                                <span className="font-bold text-secondary text-xs">{pay.type}</span>
                                {pay.details && (
                                  <span className="text-[9px] text-primary font-black uppercase tracking-wider">{pay.details}</span>
                                )}
                              </div>
                            </td>
                            <td className="py-5 pr-4">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{pay.method}</span>
                                <span className="font-bold text-secondary text-[11px] truncate max-w-[150px]">{pay.referenceId}</span>
                              </div>
                            </td>
                            <td className="py-5 pr-4">
                              <span className="text-gray-400 text-xs font-semibold">
                                {new Date(pay.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            </td>
                            <td className="py-5 text-right">
                              <span className="text-sm font-black text-emerald-500">₹{pay.amount}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 2. HIERARCHY WALLETS */}
              {activeSubTab === 'wallets' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Partner User</th>
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Location Network</th>
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Lifetime Earnings</th>
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Withdrawn Reserves</th>
                        <th className="pb-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Available Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {wallets.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-gray-400 text-xs font-medium">No partner wallets initialized yet.</td>
                        </tr>
                      ) : (
                        wallets.map((w: any) => (
                          <tr key={w._id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-5 pr-4">
                              <div className="flex items-center gap-3">
                                <div>
                                  <p className="font-bold text-secondary text-xs">{w.userId?.fullName || 'N/A'}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {getRoleBadge(w.userId?.role)}
                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                                      {w.userId?.vendorCode || w.userId?.subVendorCode || 'HIERARCHY'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-5 pr-4">
                              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                                {w.userId?.district || 'N/A'} - {w.userId?.block || 'N/A'}
                              </span>
                            </td>
                            <td className="py-5 pr-4">
                              <span className="text-secondary text-xs font-black">₹{w.lifetimeEarnings || 0}</span>
                            </td>
                            <td className="py-5 pr-4">
                              <span className="text-gray-400 text-xs font-bold">₹{w.totalWithdrawn || 0}</span>
                            </td>
                            <td className="py-5 text-right">
                              <span className="text-sm font-black text-secondary">₹{w.balance || 0}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 3. PAYOUT SETTLEMENTS */}
              {activeSubTab === 'payouts' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Requesting User</th>
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Bank Account Target</th>
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">IFSC & Branch</th>
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                        <th className="pb-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Action Panel</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {ledger.filter(t => t.category === 'withdrawal').length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-gray-400 text-xs font-medium">No payout withdrawal requests found.</td>
                        </tr>
                      ) : (
                        ledger.filter(t => t.category === 'withdrawal').map((txn: any) => (
                          <tr key={txn._id} className="hover:bg-gray-50/50 transition-colors">

                            <td className="py-5 pr-4">
                              <div className="flex flex-col gap-1">
                                <span className="font-bold text-secondary text-xs">{txn.userId?.fullName}</span>
                                <div className="flex items-center gap-2">
                                  {getRoleBadge(txn.userId?.role)}
                                  <span className="text-[9px] text-gray-400 font-bold">₹{txn.amount} requested</span>
                                </div>
                              </div>
                            </td>

                            <td className="py-5 pr-4">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-black text-secondary text-xs">{txn.bankDetails?.accountHolderName}</span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                  A/C: {txn.bankDetails?.accountNumber} ({txn.bankDetails?.bankName})
                                </span>
                              </div>
                            </td>

                            <td className="py-5 pr-4">
                              <span className="text-secondary text-xs font-bold">{txn.bankDetails?.ifscCode}</span>
                            </td>

                            <td className="py-5 pr-4">
                              <div className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider">
                                {txn.status === 'completed' && (
                                  <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <CheckCircle2 size={10} /> Disbursed
                                  </span>
                                )}
                                {txn.status === 'pending' && (
                                  <span className="bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                                    <Clock size={10} /> Pending
                                  </span>
                                )}
                                {['failed', 'cancelled'].includes(txn.status) && (
                                  <span className="bg-rose-50 text-rose-600 border-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <XCircle size={10} /> Cancelled
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-5 text-right">
                              {txn.status === 'pending' ? (
                                <button
                                  onClick={() => setSelectedTxn(txn)}
                                  className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-sm active:scale-95"
                                >
                                  Process Settlement
                                </button>
                              ) : (
                                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Setted: {txn.bankDetails?.remarks || 'Audit Checked'}</span>
                              )}
                            </td>

                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 4. AUDIT LEDGER */}
              {activeSubTab === 'ledger' && (
                <div className="space-y-6">
                  {/* Category Filter for Audit Ledger */}
                  <div className="flex justify-between items-center gap-4 bg-gray-50 p-4 rounded-2xl print:hidden">
                    <span className="text-[10px] font-black text-secondary uppercase tracking-widest">
                      Ledger Filter:
                    </span>
                    <div className="flex gap-2">
                      {[
                        { key: 'all', label: 'All Entries' },
                        { key: 'commissions', label: 'Commission Splits' },
                        { key: 'payouts', label: 'Payout Settlements' },
                        { key: 'adjustments', label: 'Adjustments & Overrides' }
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setLedgerCategoryFilter(item.key)}
                          className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                            ledgerCategoryFilter === item.key
                              ? 'bg-white text-secondary shadow-sm border border-gray-200'
                              : 'text-gray-400 hover:text-secondary'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Ledger Event & Ref</th>
                          <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Impacted Account</th>
                          <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Source of Funds</th>
                          <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Accounting Class</th>
                          <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                          <th className="pb-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Ledger Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {(() => {
                          const filteredLedger = ledger.filter((txn) => {
                            if (ledgerCategoryFilter === 'all') return true;
                            if (ledgerCategoryFilter === 'commissions') {
                              return txn.ledgerCategory === 'commission_split';
                            }
                            if (ledgerCategoryFilter === 'payouts') {
                              return txn.ledgerCategory === 'payout';
                            }
                            if (ledgerCategoryFilter === 'adjustments') {
                              return ['adjustment', 'override', 'reversal'].includes(txn.ledgerCategory);
                            }
                            return true;
                          });

                          if (filteredLedger.length === 0) {
                            return (
                              <tr>
                                <td colSpan={6} className="py-12 text-center text-gray-400 text-xs font-medium">No double-entry transactions recorded for this filter.</td>
                              </tr>
                            );
                          }

                          return filteredLedger.map((txn) => {
                            const isCredit = txn.type === 'credit';
                            return (
                              <tr key={txn._id} className="hover:bg-gray-50/50 transition-colors">
                                
                                <td className="py-5 pr-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isCredit ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                                      {isCredit ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                                    </div>
                                    <div>
                                      <p className="font-bold text-secondary text-xs">{getProductionLabel(txn)}</p>
                                      {txn.referenceId && (
                                        <p className="text-[9px] mt-0.5 text-gray-400 font-bold uppercase tracking-wider">
                                          Ref: {txn.referenceId}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                <td className="py-5 pr-4">
                                  {txn.impactedAccount === 'platform' ? (
                                    <div className="flex flex-col">
                                      <span className="font-black text-secondary text-xs uppercase tracking-wider">System Treasury</span>
                                      <span className="text-[9px] text-primary font-black uppercase tracking-wider mt-0.5">Platform Revenue</span>
                                    </div>
                                  ) : (
                                    <div>
                                      <p className="font-bold text-secondary text-xs">{txn.userId?.fullName || 'System'}</p>
                                      <div className="mt-0.5">
                                        {getRoleBadge(txn.userId?.role)}
                                      </div>
                                    </div>
                                  )}
                                </td>

                                <td className="py-5 pr-4">
                                  {txn.sourceUserId ? (
                                    <div className="flex flex-col">
                                      <span className="font-bold text-secondary text-xs">{txn.sourceUserFullName}</span>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        {getRoleBadge(txn.sourceUserRole)}
                                        {txn.sourceAmount && <span className="text-[9px] text-gray-400 font-bold">Amt: ₹{txn.sourceAmount}</span>}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">System Split</span>
                                  )}
                                </td>

                                <td className="py-5 pr-4">
                                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                                    {getEntryClassLabel(txn.ledgerCategory || txn.category)}
                                  </span>
                                </td>

                                <td className="py-5 pr-4">
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${txn.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : txn.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                    {txn.status === 'completed' ? 'Settled' : txn.status === 'pending' ? 'Transit' : 'Cancelled'}
                                  </span>
                                </td>

                                <td className="py-5 text-right">
                                  <span className={`text-base font-black ${isCredit ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {isCredit ? '+' : '-'}₹{txn.amount}
                                  </span>
                                </td>

                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 5. DYNAMIC COMMISSION RATE CONFIGURATION Dashboard */}
              {activeSubTab === 'config' && (
                <form onSubmit={handleSaveCommissionConfig} className="space-y-8 max-w-5xl">

                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-3xl flex gap-3 text-xs text-blue-600 leading-relaxed font-semibold">
                    <AlertCircle size={18} className="shrink-0 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-bold text-secondary text-sm mb-1">Central Commission Config Registry</p>
                      <p>Changes below adjust system-wide commission calculations for subscriptions, deposits, and rural memberships instantly. Calculations utilize double-entry ledger security.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* LEFT PANEL: SUBSCRIPTIONS & DEPOSITS */}
                    <div className="space-y-6 bg-gray-50/50 p-6 rounded-[35px] border border-gray-100">

                      <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                        <Settings size={18} className="text-primary" />
                        <h4 className="font-black text-secondary text-sm uppercase tracking-wide">Platform Percentages</h4>
                      </div>

                      {/* Subscription Commissions */}
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform Subscriptions (%)</h5>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Vendor</label>
                            <input
                              type="number"
                              required
                              value={commConfig.subscriptionCommission?.vendorPct}
                              onChange={(e) => setCommConfig({
                                ...commConfig,
                                subscriptionCommission: { ...commConfig.subscriptionCommission, vendorPct: Number(e.target.value) }
                              })}
                              className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-secondary text-xs font-bold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Sub-Vendor</label>
                            <input
                              type="number"
                              required
                              value={commConfig.subscriptionCommission?.subVendorPct}
                              onChange={(e) => setCommConfig({
                                ...commConfig,
                                subscriptionCommission: { ...commConfig.subscriptionCommission, subVendorPct: Number(e.target.value) }
                              })}
                              className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-secondary text-xs font-bold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Employee</label>
                            <input
                              type="number"
                              required
                              value={commConfig.subscriptionCommission?.employeePct}
                              onChange={(e) => setCommConfig({
                                ...commConfig,
                                subscriptionCommission: { ...commConfig.subscriptionCommission, employeePct: Number(e.target.value) }
                              })}
                              className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-secondary text-xs font-bold focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Security Deposit Commissions */}
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Security Deposits (%)</h5>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Vendor</label>
                            <input
                              type="number"
                              required
                              value={commConfig.depositCommission?.vendorPct}
                              onChange={(e) => setCommConfig({
                                ...commConfig,
                                depositCommission: { ...commConfig.depositCommission, vendorPct: Number(e.target.value) }
                              })}
                              className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-secondary text-xs font-bold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Sub-Vendor</label>
                            <input
                              type="number"
                              required
                              value={commConfig.depositCommission?.subVendorPct}
                              onChange={(e) => setCommConfig({
                                ...commConfig,
                                depositCommission: { ...commConfig.depositCommission, subVendorPct: Number(e.target.value) }
                              })}
                              className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-secondary text-xs font-bold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Employee</label>
                            <input
                              type="number"
                              required
                              value={commConfig.depositCommission?.employeePct}
                              onChange={(e) => setCommConfig({
                                ...commConfig,
                                depositCommission: { ...commConfig.depositCommission, employeePct: Number(e.target.value) }
                              })}
                              className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-secondary text-xs font-bold focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Withdrawal Rules */}
                      <div className="space-y-4 pt-3 border-t border-gray-100">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payout Settlement Rules</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Min Withdrawal (₹)</label>
                            <input
                              type="number"
                              required
                              value={commConfig.payoutRules?.minWithdrawalAmount}
                              onChange={(e) => setCommConfig({
                                ...commConfig,
                                payoutRules: { ...commConfig.payoutRules, minWithdrawalAmount: Number(e.target.value) }
                              })}
                              className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-secondary text-xs font-bold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Auto Settle</label>
                            <select
                              value={commConfig.payoutRules?.allowAutoSettle ? 'true' : 'false'}
                              onChange={(e) => setCommConfig({
                                ...commConfig,
                                payoutRules: { ...commConfig.payoutRules, allowAutoSettle: e.target.value === 'true' }
                              })}
                              className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-secondary text-xs font-bold focus:outline-none"
                            >
                              <option value="false">Manual Review</option>
                              <option value="true">Auto Approve</option>
                            </select>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* RIGHT PANEL: MEMBERSHIPS */}
                    <div className="space-y-6 bg-gray-50/50 p-6 rounded-[35px] border border-gray-100">

                      <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                        <Award size={18} className="text-primary" />
                        <h4 className="font-black text-secondary text-sm uppercase tracking-wide">Membership Commissions (%)</h4>
                      </div>

                      {/* Recruiter Commission */}
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Direct Recruiter Earnings (%)</h5>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Employee (%)</label>
                            <input
                              type="number"
                              required
                              value={commConfig.memberCommission?.employeeRecruiter}
                              onChange={(e) => setCommConfig({
                                ...commConfig,
                                memberCommission: { ...commConfig.memberCommission, employeeRecruiter: Number(e.target.value) }
                              })}
                              className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-secondary text-xs font-bold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Sub-Vendor (%)</label>
                            <input
                              type="number"
                              required
                              value={commConfig.memberCommission?.subVendorRecruiter}
                              onChange={(e) => setCommConfig({
                                ...commConfig,
                                memberCommission: { ...commConfig.memberCommission, subVendorRecruiter: Number(e.target.value) }
                              })}
                              className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-secondary text-xs font-bold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Vendor (%)</label>
                            <input
                              type="number"
                              required
                              value={commConfig.memberCommission?.vendorRecruiter}
                              onChange={(e) => setCommConfig({
                                ...commConfig,
                                memberCommission: { ...commConfig.memberCommission, vendorRecruiter: Number(e.target.value) }
                              })}
                              className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-secondary text-xs font-bold focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Upline fixed rules */}
                      <div className="space-y-4 pt-3 border-t border-gray-100">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Coordinator Incentive Distribution Rules (%)</h5>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Sub-Vendor Parent (%)</label>
                            <input
                              type="number"
                              required
                              value={commConfig.memberCommission?.subVendorParent}
                              onChange={(e) => setCommConfig({
                                ...commConfig,
                                memberCommission: { ...commConfig.memberCommission, subVendorParent: Number(e.target.value) }
                              })}
                              className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-secondary text-xs font-bold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Direct Vendor Parent (%)</label>
                            <input
                              type="number"
                              required
                              value={commConfig.memberCommission?.vendorParentDirect}
                              onChange={(e) => setCommConfig({
                                ...commConfig,
                                memberCommission: { ...commConfig.memberCommission, vendorParentDirect: Number(e.target.value) }
                              })}
                              className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-secondary text-xs font-bold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Grandparent Vendor (%)</label>
                            <input
                              type="number"
                              required
                              value={commConfig.memberCommission?.vendorGrandparent}
                              onChange={(e) => setCommConfig({
                                ...commConfig,
                                memberCommission: { ...commConfig.memberCommission, vendorGrandparent: Number(e.target.value) }
                              })}
                              className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-secondary text-xs font-bold focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* SUBMIT ROW */}
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Save size={16} /> {actionLoading ? 'Saving rates...' : 'Save Configuration'}
                    </button>
                  </div>

                </form>
              )}

            </div>
          )}

        </section>

      </div>

      {/* Payout Approval Settlement Drawer / Modal */}
      <AnimatePresence>
        {selectedTxn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTxn(null)}
              className="absolute inset-0 bg-secondary/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden border border-gray-100 shadow-2xl relative z-10 flex flex-col"
            >

              <div className="bg-secondary p-8 text-white relative">
                <h4 className="text-2xl font-black flex items-center gap-3">
                  <Landmark size={26} className="text-primary" /> Process Payout Settlement
                </h4>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1.5">Settle bank wire payouts or cancel debit holds</p>
              </div>

              <form onSubmit={handleSettlePayoutSubmit} className="p-8 space-y-6">

                <div className="p-5 bg-gray-50 border border-gray-100 rounded-3xl space-y-3">
                  <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bank Account Wire Details</h5>
                  <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                    <div>
                      <p className="text-[9px] text-gray-400 uppercase">Account Holder</p>
                      <p className="text-secondary mt-0.5">{selectedTxn.bankDetails?.accountHolderName}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400 uppercase">Withdrawal Amount</p>
                      <p className="text-primary mt-0.5 text-sm font-black">₹{selectedTxn.amount}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400 uppercase">Account Number</p>
                      <p className="text-secondary mt-0.5">{selectedTxn.bankDetails?.accountNumber}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400 uppercase">IFSC Code / Bank</p>
                      <p className="text-secondary mt-0.5">{selectedTxn.bankDetails?.ifscCode} ({selectedTxn.bankDetails?.bankName})</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-secondary uppercase tracking-widest mb-2">Settlement Action</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setSettleAction('approve')}
                      className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${settleAction === 'approve' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-105' : 'bg-gray-50 text-gray-400 border border-gray-100 hover:text-secondary'}`}
                    >
                      Approve & Settle Payout
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettleAction('reject')}
                      className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${settleAction === 'reject' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25 scale-105' : 'bg-gray-50 text-gray-400 border border-gray-100 hover:text-secondary'}`}
                    >
                      Reject & Refund Balance
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-secondary uppercase tracking-widest mb-2">Internal Settlement Remarks</label>
                  <textarea
                    required
                    placeholder={settleAction === 'approve' ? 'e.g. Settle via IMPS Ref: 998239023' : 'e.g. Reject: Mismatched bank beneficiary details'}
                    value={settleRemarks}
                    onChange={(e) => setSettleRemarks(e.target.value)}
                    rows={3}
                    className="w-full px-5 py-4 border border-gray-100 bg-[#fcfcfd] focus:bg-white rounded-2xl text-secondary text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTxn(null)}
                    className="flex-1 py-4 border-2 border-gray-100 text-secondary rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-[2] py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing Wire...' : 'Confirm Action'}
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
          }
          .min-h-screen, .flex-1, main {
            background: white !important;
            padding: 0 !important;
          }
          header, button, select, input, form, .print\\:hidden, aside {
            display: none !important;
          }
          table {
            border: 1px solid #eee;
          }
          th, td {
            padding: 12px !important;
            font-size: 11px !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
