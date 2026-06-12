'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { TrendingUp, ArrowDownLeft, ArrowUpRight, Filter } from "lucide-react";
import axios from "axios";
import { useLanguage } from "@/context/LanguageContext";

export default function VendorPayments() {
  const { t } = useLanguage();
  const [payments, setPayments] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'All' | 'Collections' | 'Commissions' | 'Deposits'>('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paymentsRes, walletRes] = await Promise.all([
          axios.get('/api/vendor/payments'),
          axios.get('/api/wallet')
        ]);
        if (paymentsRes.data.success) setPayments(paymentsRes.data.data);
        if (walletRes.data.success) setWallet(walletRes.data.data.wallet);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPayments = payments.filter((p) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Collections') return p.type === 'collection';
    if (activeTab === 'Commissions') return p.type === 'commission';
    if (activeTab === 'Deposits') return p.type === 'deposit';
    return true;
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <header className="flex justify-between items-start flex-wrap gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-secondary">
              {t('payments.title', 'Payments & Ledger')}
            </h1>
            <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">
              {t('payments.subtitle', 'Track membership collections, commissions and security deposits')}
            </p>
          </div>
          <div className="flex gap-4">
             <div className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
                <div>
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                     {t('dashboardCommon.totalEarnings', 'Total Earnings')}
                   </p>
                   <p className="font-black text-secondary">
                     ₹ {loading ? "..." : (wallet?.lifetimeEarnings?.toLocaleString('en-IN') ?? '0')}
                   </p>
                </div>
             </div>
          </div>
        </header>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
             <div className="flex gap-2">
               {[
                 { id: 'All', label: t('payments.all', 'All') },
                 { id: 'Collections', label: t('payments.collections', 'Collections') },
                 { id: 'Commissions', label: t('payments.commissions', 'Commissions') },
                 { id: 'Deposits', label: t('payments.deposits', 'Deposits') }
               ].map(tab => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)}
                   className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                 >
                   {tab.label}
                 </button>
               ))}
             </div>
             <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-xs font-black uppercase tracking-widest border border-gray-100">
               <Filter size={14} /> {t('payments.filter', 'Filter')}
             </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr className="text-left border-b-2 border-gray-50">
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('payments.txnDetail', 'Transaction Detail')}</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('payments.type', 'Type')}</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('payments.date', 'Date')}</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('payments.amount', 'Amount')}</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('payments.status', 'Status')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center text-gray-400 font-bold italic">
                      {t('payments.loading', 'Loading financial data...')}
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center text-gray-400 font-bold italic">
                      {t('payments.noTransactions', 'No transactions found.')}
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer group">
                      <td className="p-5">
                        <div className="flex gap-4 items-center">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${p.type === 'commission' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                            {p.type === 'commission' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                          </div>
                          <div>
                            <p className="font-black text-secondary leading-tight">{p.description}</p>
                            <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">{t('payments.ref', 'Ref')}: {p.txnId || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest">
                        {p.type}
                      </td>
                      <td className="p-5 text-sm text-secondary font-medium">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-5">
                        <span className={`text-sm font-black ${p.type === 'commission' ? 'text-green-600' : 'text-secondary'}`}>
                          ₹ {p.amount}
                        </span>
                      </td>
                      <td className="p-5">
                        <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${p.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
