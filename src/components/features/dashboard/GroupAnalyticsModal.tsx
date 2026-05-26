'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, MapPin, X, Activity, 
  CreditCard, PieChart, ShieldCheck, 
  Wallet, FileText, UserCheck, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import StatCard from '@/components/shared/StatCard';

interface GroupAnalyticsModalProps {
  groupId: string;
  onClose: () => void;
}

export default function GroupAnalyticsModal({ groupId, onClose }: GroupAnalyticsModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(`/api/groups/${groupId}/analytics`);
        if (res.data.success) {
          setData(res.data.data);
        } else {
          setError(res.data.message);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    if (groupId) fetchAnalytics();
  }, [groupId]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-[32px] w-full max-w-5xl shadow-2xl overflow-hidden my-auto border border-gray-100"
        >
          {loading ? (
             <div className="p-20 flex flex-col items-center justify-center">
               <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
               <p className="mt-4 text-gray-500 font-bold">Aggregating Group Analytics...</p>
             </div>
          ) : error ? (
             <div className="p-20 text-center text-red-500 font-bold">
               {error}
               <br />
               <button onClick={onClose} className="mt-4 px-6 py-2 bg-gray-100 text-gray-700 rounded-xl">Close</button>
             </div>
          ) : data ? (
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-secondary-dark to-secondary p-8 text-white relative">
                <button onClick={onClose} className="absolute right-6 top-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                  <X size={20} />
                </button>
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-white text-secondary rounded-2xl flex items-center justify-center shadow-lg">
                    <PieChart size={36} className="text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-3xl font-black">{data.group.groupName}</h2>
                      <span className="px-3 py-1 bg-green-400 text-secondary text-[10px] font-black uppercase tracking-widest rounded-full">
                        Active Unit
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm font-bold text-white/80">
                      <span className="flex items-center gap-1.5"><MapPin size={16} className="text-primary-light" /> {data.group.village}, {data.group.block}</span>
                      <span className="flex items-center gap-1.5"><UserCheck size={16} className="text-primary-light" /> Ldr: {data.group.leaderName}</span>
                      <span className="flex items-center gap-1.5"><Calendar size={16} className="text-primary-light" /> {new Date(data.group.meetingDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-8 bg-gray-50/30 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-8">
                
                {/* Core KPIs */}
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Activity size={14} /> Membership Metrics
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Members" value={data.stats.totalMembers} icon={Users} color="bg-blue-50 text-blue-600" />
                    <StatCard label="Paid Members" value={data.stats.paidMembers} icon={ShieldCheck} color="bg-green-50 text-green-600" />
                    <StatCard label="Free Members" value={data.stats.freeMembers} icon={FileText} color="bg-gray-100 text-gray-500" />
                    <StatCard label="Connected Profiles" value={data.stats.connectedMembers} icon={Activity} color="bg-purple-50 text-purple-600" />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Financial & Admin details */}
                  <div className="lg:col-span-1 space-y-8">
                    <div>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Wallet size={14} /> Financials
                      </h4>
                      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Membership Collection</p>
                        <p className="text-4xl font-black text-green-600 mt-2 flex items-center justify-center gap-1">
                          <span className="text-xl">₹</span>{data.stats.totalCollection.toLocaleString('en-IN')}
                        </p>
                        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between">
                           <div>
                             <p className="text-[9px] font-bold text-gray-400 uppercase">Verified Txns</p>
                             <p className="font-black text-secondary">{data.stats.verifiedPayments}</p>
                           </div>
                           <div>
                             <p className="text-[9px] font-bold text-gray-400 uppercase">Avg per Txn</p>
                             <p className="font-black text-secondary">₹{data.stats.verifiedPayments > 0 ? Math.round(data.stats.totalCollection / data.stats.verifiedPayments) : 0}</p>
                           </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <UserCheck size={14} /> Managed By
                      </h4>
                      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                         <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg">
                           {data.group.createdBy?.fullName?.[0] || 'E'}
                         </div>
                         <div>
                           <p className="font-black text-secondary">{data.group.createdBy?.fullName || 'Unknown'}</p>
                           <p className="text-[9px] font-black text-primary uppercase tracking-widest">{data.group.createdBy?.employeeId || 'Employee'}</p>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Members Table */}
                  <div className="lg:col-span-2">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <Users size={14} /> Recent Enrollments
                    </h4>
                    <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                          <tr>
                            <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                            <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                            <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined On</th>
                            <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {data.recentMembers.length > 0 ? data.recentMembers.map((m: any) => (
                            <tr key={m._id} className="hover:bg-gray-50/30 transition-colors">
                              <td className="p-5 font-black text-secondary text-sm">{m.name}</td>
                              <td className="p-5">
                                <span className="font-bold text-gray-600 text-xs">{m.mobile}</span>
                                <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">{m.village}</p>
                              </td>
                              <td className="p-5 text-xs text-gray-500 font-bold">{new Date(m.createdAt).toLocaleDateString()}</td>
                              <td className="p-5">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${m.membershipStatus === 'paid' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                  {m.membershipStatus}
                                </span>
                              </td>
                            </tr>
                          )) : (
                            <tr><td colSpan={4} className="p-10 text-center text-xs font-bold text-gray-400">No members assigned to this unit yet.</td></tr>
                          )}
                        </tbody>
                      </table>
                      {data.recentMembers.length > 0 && (
                        <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
                          <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View All {data.stats.totalMembers} Members</button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </>
          ) : null}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
