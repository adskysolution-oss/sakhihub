'use client';

import React from 'react';
import { CreditCard, FileText, CheckCircle, Clock, ShieldCheck, XCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'sonner';

interface MembershipTableProps {
  data: any[];
  isAdmin?: boolean;
  onUpdate?: () => void;
}

export default function MembershipTable({ data, isAdmin = false, onUpdate }: MembershipTableProps) {
  const handleVerify = async (id: string, status: 'Paid' | 'Failed') => {
    if (!confirm(`Are you sure you want to mark this as ${status}?`)) return;
    try {
      const res = await axios.patch(`/api/memberships/${id}`, { status });
      if (res.data.success) {
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl overflow-hidden shadow-soft border border-gray-100">
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Member / Group</th>
              <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Receipt Info</th>
              <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Amount</th>
              <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mode</th>
              {isAdmin && <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee</th>}
              <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.length > 0 ? data.map((m) => (
              <tr key={m._id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-5">
                  <p className="font-bold text-secondary leading-tight">{m.memberId?.name || 'Unknown Member'}</p>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">{m.groupId?.groupName || 'No Group Assigned'}</p>
                </td>
                <td className="px-6 py-5">
                  <p className="font-bold text-secondary text-sm">{m.receiptNumber}</p>
                  <p className="text-[10px] font-semibold text-gray-400 mt-1 uppercase tracking-widest">{new Date(m.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className="font-black text-green-600 text-base">₹{m.amount}</span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <CreditCard size={14} className="text-primary opacity-60" /> {m.paymentMode}
                  </div>
                </td>
                {isAdmin && (
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">{m.employeeId?.fullName?.charAt(0) || 'S'}</div>
                       <p className="text-xs font-bold text-secondary">{m.employeeId?.fullName || 'System'}</p>
                    </div>
                  </td>
                )}
                <td className="px-6 py-5 text-center">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    m.paymentStatus === 'Paid' ? 'bg-green-50 text-green-600' : 
                    m.paymentStatus === 'Failed' ? 'bg-red-50 text-red-600' : 
                    'bg-amber-50 text-amber-600'
                  }`}>
                    {m.paymentStatus === 'Paid' ? <CheckCircle size={12} /> : m.paymentStatus === 'Failed' ? <XCircle size={12} /> : <Clock size={12} />}
                    {m.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link 
                      href={`/member/receipt/${m._id}`} 
                      target="_blank" 
                      className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-all"
                      title="View Receipt"
                    >
                      <FileText size={18} />
                    </Link>
                    {isAdmin && m.paymentStatus !== 'Paid' && (
                      <div className="flex items-center gap-2 border-l border-gray-100 pl-3">
                        <button 
                          onClick={() => handleVerify(m._id, 'Paid')} 
                          className="px-3 py-1.5 rounded-xl bg-green-600 text-white font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-green-200 hover:scale-105 transition-all"
                        >Verify</button>
                        <button 
                          onClick={() => handleVerify(m._id, 'Failed')} 
                          className="px-3 py-1.5 rounded-xl border border-red-100 bg-white text-red-500 font-bold text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all"
                        >Reject</button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="px-6 py-20 text-center text-gray-400 italic font-semibold">
                  No membership records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
