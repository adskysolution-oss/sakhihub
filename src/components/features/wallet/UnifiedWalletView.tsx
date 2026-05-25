'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wallet, ArrowDownRight, ArrowUpRight, Clock, CheckCircle2, 
  XCircle, Send, Landmark, Receipt, FileText, Printer, HelpCircle 
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';

interface UnifiedWalletViewProps {
  role: 'vendor' | 'sub_vendor' | 'employee';
  title?: string;
  subtitle?: string;
}

export default function UnifiedWalletView({ role, title, subtitle }: UnifiedWalletViewProps) {
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'earnings' | 'withdrawals'>('all');
  
  // Withdrawal Request Modal States
  const [isWithdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    remarks: ''
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const fetchWalletData = async () => {
    try {
      const res = await axios.get('/api/wallet');
      if (res.data.success) {
        setWallet(res.data.data.wallet);
        setTransactions(res.data.data.transactions);
      }
    } catch (error) {
      console.error('Failed to fetch wallet details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    const amount = Number(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setFormError('Please enter a valid positive withdrawal amount.');
      return;
    }

    if (amount > (wallet?.balance || 0)) {
      setFormError(`Insufficient balance. You can withdraw up to ₹${wallet?.balance || 0}`);
      return;
    }

    if (!bankDetails.accountHolderName.trim() || !bankDetails.accountNumber.trim() || !bankDetails.ifscCode.trim()) {
      setFormError('Please fill all mandatory bank account fields.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await axios.post('/api/wallet', {
        amount,
        bankDetails
      });
      if (res.data.success) {
        setFormSuccess(true);
        setWithdrawAmount('');
        setBankDetails({
          accountHolderName: '',
          accountNumber: '',
          ifscCode: '',
          bankName: '',
          remarks: ''
        });
        await fetchWalletData();
        setTimeout(() => {
          setWithdrawModalOpen(false);
          setFormSuccess(false);
        }, 2000);
      }
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to submit withdrawal request.');
    } finally {
      setActionLoading(false);
    }
  };

  const getFilteredTxns = () => {
    if (activeTab === 'earnings') {
      return transactions.filter(t => t.type === 'credit');
    }
    if (activeTab === 'withdrawals') {
      return transactions.filter(t => t.category === 'withdrawal');
    }
    return transactions;
  };

  const filteredTxns = getFilteredTxns();

  const handlePrintStatement = () => {
    window.print();
  };

  const getRoleBadge = (txnRole: string) => {
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
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${roles[txnRole] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
        {label[txnRole] || txnRole}
      </span>
    );
  };

  const defaultTitle = role === 'vendor' ? 'Vendor Wallet' : role === 'sub_vendor' ? 'Sub-Vendor Wallet' : 'My Earnings Wallet';
  const defaultSubtitle = role === 'vendor' 
    ? 'Real-time performance incentive tracking, ledger history, and direct withdrawals'
    : role === 'sub_vendor'
      ? 'Track sub-vendor regional performance incentives, deposits, and payouts'
      : 'Review your community support incentives and direct operational rewards';

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing Wallet Ledger...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 print:p-0">
        
        {/* Header Block */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-secondary tracking-tight">{title || defaultTitle}</h1>
            <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">{subtitle || defaultSubtitle}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handlePrintStatement}
              className="flex items-center gap-2 px-5 py-3.5 bg-white border-2 border-gray-100 rounded-2xl text-secondary font-black text-[10px] uppercase tracking-widest hover:border-primary shadow-sm active:scale-95 transition-all"
            >
              <Printer size={16} /> Print Statement
            </button>
            <button
              onClick={() => setWithdrawModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Send size={16} /> Payout Request
            </button>
          </div>
        </header>

        {/* Balance Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          
          {/* AVAILABLE BALANCE */}
          <div className="lg:col-span-2 bg-gradient-to-br from-secondary via-secondary-dark to-slate-900 p-8 rounded-[35px] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-primary/20 rounded-full blur-3xl group-hover:scale-125 transition-all duration-500"></div>
            <div className="flex justify-between items-center mb-6 relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                <Wallet size={24} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/25">Available Balance</span>
            </div>
            <h3 className="text-5xl font-black tracking-tight mb-2 relative z-10">₹{wallet?.balance?.toLocaleString('en-IN') || '0'}</h3>
            <p className="text-white/60 text-xs font-medium mb-6 relative z-10">Directly withdrawable to bank account</p>
            <button
              onClick={() => setWithdrawModalOpen(true)}
              className="w-full py-4 bg-primary hover:bg-primary-dark rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 active:scale-[0.98] transition-all relative z-10"
            >
              Send Withdrawal Request
            </button>
          </div>

          {/* PENDING BALANCE */}
          <div className="bg-white p-6 rounded-[35px] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
                <Clock size={20} />
              </div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">Pending Balance</span>
            </div>
            <div>
              <h4 className="text-3xl font-black text-secondary tracking-tight mb-1">₹{wallet?.pendingBalance?.toLocaleString('en-IN') || '0'}</h4>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Locked in Transit</p>
            </div>
          </div>

          {/* LIFETIME COMMISSION */}
          <div className="bg-white p-6 rounded-[35px] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                <ArrowDownRight size={22} />
              </div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">Total Credited</span>
            </div>
            <div>
              <h4 className="text-3xl font-black text-secondary tracking-tight mb-1">₹{wallet?.lifetimeEarnings?.toLocaleString('en-IN') || '0'}</h4>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Lifetime Earnings</p>
            </div>
          </div>

          {/* TOTAL WITHDRAWALS */}
          <div className="bg-white p-6 rounded-[35px] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                <ArrowUpRight size={22} />
              </div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">Total Debited</span>
            </div>
            <div>
              <h4 className="text-3xl font-black text-secondary tracking-tight mb-1">₹{wallet?.totalWithdrawn?.toLocaleString('en-IN') || '0'}</h4>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Settled</p>
            </div>
          </div>

        </section>

        {/* Ledger & Transactions Audit */}
        <section className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-6 md:p-8">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-gray-100 pb-6 print:hidden">
            <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl">
              {(['all', 'earnings', 'withdrawals'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-secondary shadow-sm' : 'text-gray-400 hover:text-secondary'}`}
                >
                  {tab === 'all' ? 'Ledger Entries' : tab === 'earnings' ? 'Incentives' : 'Withdrawals'}
                </button>
              ))}
            </div>
            
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
              Showing {filteredTxns.length} records
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Transaction Info</th>
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Source Network</th>
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Flow Details</th>
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="pb-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTxns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="max-w-md mx-auto flex flex-col items-center justify-center gap-4 text-gray-400">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                          <Receipt size={28} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-secondary">No Ledger Records Found</p>
                          <p className="text-xs mt-1 text-gray-400">Every earning and withdrawal transaction will be safely logged in this ledger.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTxns.map((txn) => {
                    const isCredit = txn.type === 'credit';
                    return (
                      <tr key={txn._id} className="hover:bg-gray-50/50 transition-colors group">
                        
                        <td className="py-6 pr-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isCredit ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                              {isCredit ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                            </div>
                            <div>
                              <p className="font-bold text-secondary text-sm line-clamp-1">{txn.description}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                                {new Date(txn.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-6 pr-4">
                          {txn.sourceUserId ? (
                            <div className="flex flex-col gap-1.5">
                              <span className="font-bold text-secondary text-xs">{txn.sourceUserFullName}</span>
                              <div className="flex items-center gap-2">
                                {getRoleBadge(txn.sourceUserRole)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">System / Self</span>
                          )}
                        </td>

                        <td className="py-6 pr-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              {txn.category?.replace('commission_', 'incentive: ')}
                            </span>
                            {txn.referenceId && (
                              <span className="font-bold text-secondary text-xs mt-0.5">Ref: {txn.referenceId}</span>
                            )}
                          </div>
                        </td>

                        <td className="py-6 pr-4">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border">
                            {txn.status === 'completed' && (
                              <span className="bg-emerald-50 text-emerald-600 border-emerald-100 flex items-center gap-1 px-2.5 py-0.5 rounded-full">
                                <CheckCircle2 size={12} /> Settled
                              </span>
                            )}
                            {txn.status === 'pending' && (
                              <span className="bg-amber-50 text-amber-600 border-amber-100 flex items-center gap-1 px-2.5 py-0.5 rounded-full">
                                <Clock size={12} className="animate-spin-slow" /> Transit
                              </span>
                            )}
                            {['failed', 'cancelled'].includes(txn.status) && (
                              <span className="bg-rose-50 text-rose-600 border-rose-100 flex items-center gap-1 px-2.5 py-0.5 rounded-full">
                                <XCircle size={12} /> Cancelled
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-6 text-right">
                          <span className={`text-lg font-black tracking-tight ${isCredit ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {isCredit ? '+' : '-'}₹{txn.amount}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </section>

      </div>

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {isWithdrawModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWithdrawModalOpen(false)}
              className="absolute inset-0 bg-secondary/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden border border-gray-100 shadow-2xl relative z-10 flex flex-col"
            >
              
              <div className="bg-secondary p-8 text-white relative">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10" />
                 <h4 className="text-2xl font-black flex items-center gap-3">
                   <Landmark size={26} className="text-primary" /> Payout Request
                 </h4>
                 <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1.5">Withdraw earnings to your verified bank account</p>
              </div>

              <form onSubmit={handleWithdrawSubmit} className="p-8 space-y-6">
                
                {formError && (
                  <div className="p-4 bg-rose-50 text-rose-500 border border-rose-100 rounded-2xl text-xs font-bold leading-relaxed flex items-center gap-2">
                    <XCircle size={16} className="shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {formSuccess && (
                  <div className="p-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl text-xs font-bold leading-relaxed flex items-center gap-2">
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>Payout request successfully submitted for admin approval!</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-secondary uppercase tracking-widest mb-2">Request Amount (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 5000"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full px-5 py-4 border border-gray-100 bg-[#fcfcfd] focus:bg-white rounded-2xl text-secondary text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">Max Available: ₹{(wallet?.balance || 0).toLocaleString('en-IN')}</p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-secondary uppercase tracking-widest mb-2">Account Holder Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Organization or Beneficiary Name"
                      value={bankDetails.accountHolderName}
                      onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                      className="w-full px-5 py-4 border border-gray-100 bg-[#fcfcfd] focus:bg-white rounded-2xl text-secondary text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-secondary uppercase tracking-widest mb-2">Account Number</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 9988776655"
                        value={bankDetails.accountNumber}
                        onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                        className="w-full px-5 py-4 border border-gray-100 bg-[#fcfcfd] focus:bg-white rounded-2xl text-secondary text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-secondary uppercase tracking-widest mb-2">IFSC Code</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. SBIN0001234"
                        value={bankDetails.ifscCode}
                        onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })}
                        className="w-full px-5 py-4 border border-gray-100 bg-[#fcfcfd] focus:bg-white rounded-2xl text-secondary text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-secondary uppercase tracking-widest mb-2">Bank Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. State Bank of India"
                      value={bankDetails.bankName}
                      onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                      className="w-full px-5 py-4 border border-gray-100 bg-[#fcfcfd] focus:bg-white rounded-2xl text-secondary text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setWithdrawModalOpen(false)}
                    className="flex-1 py-4 border-2 border-gray-100 text-secondary rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || formSuccess}
                    className="flex-[2] py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {actionLoading ? 'Submitting...' : formSuccess ? 'Submitted!' : 'Submit Request'}
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
          header, button, select, input, .print\\:hidden, aside {
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
