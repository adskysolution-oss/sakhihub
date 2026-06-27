'use client';

import React from 'react';
import { User, ShieldCheck } from 'lucide-react';

interface UserSummaryCardProps {
  user: any;
}

export default function UserSummaryCard({ user }: UserSummaryCardProps) {
  if (!user) return null;

  const getUserCode = () => {
    if (user.role === 'employee') return user.employeeId || 'N/A';
    if (user.role === 'vendor') return user.vendorCode || 'N/A';
    if (user.role === 'sub_vendor') return user.subVendorCode || 'N/A';
    return user.memberId || 'N/A';
  };

  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-soft flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4">
        <span className="px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/10">
          {user.role}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-6">
        {user.profileImage ? (
          <img 
            src={user.profileImage} 
            alt={user.fullName}
            className="w-16 h-16 rounded-2xl object-cover border border-gray-100"
          />
        ) : (
          <div className="w-16 h-16 bg-secondary/5 text-secondary rounded-2xl flex items-center justify-center font-black text-xl border border-secondary/10">
            {user.fullName ? user.fullName.substring(0, 2).toUpperCase() : '??'}
          </div>
        )}
        <div>
          <h2 className="text-xl font-black text-secondary leading-tight">{user.fullName}</h2>
          <p className="text-xs font-bold text-gray-400 mt-1">{user.mobile}</p>
          <p className="text-[10px] font-bold text-gray-300 mt-0.5">{user.email || 'No Email'}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-gray-100 pt-6">
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl">
          <span className="text-xs font-bold text-gray-400">User ID Code</span>
          <span className="text-xs font-black text-secondary uppercase">{getUserCode()}</span>
        </div>

        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl">
          <span className="text-xs font-bold text-gray-400">Account Status</span>
          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${user.status === 'active' || user.status === 'approved' ? 'bg-green-50 text-green-500' : 'bg-amber-50 text-amber-500'}`}>
            {user.status}
          </span>
        </div>

        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl">
          <span className="text-xs font-bold text-gray-400">Application Progress</span>
          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${user.onboardingCompleted ? 'bg-green-50 text-green-500' : 'bg-gray-100 text-gray-500'}`}>
            {user.onboardingCompleted ? 'Completed' : 'Incomplete'}
          </span>
        </div>

        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl">
          <span className="text-xs font-bold text-gray-400">Payment Status</span>
          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${user.paymentCompleted ? 'bg-green-50 text-green-500' : 'bg-amber-50 text-amber-500'}`}>
            {user.paymentCompleted ? 'Completed' : 'Pending'}
          </span>
        </div>

        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl">
          <span className="text-xs font-bold text-gray-400">Document Verification</span>
          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${user.documentsVerified ? 'bg-green-50 text-green-500' : 'bg-amber-50 text-amber-500'}`}>
            {user.documentsVerified ? 'Verified' : 'Pending'}
          </span>
        </div>

        {['employee', 'sub_vendor'].includes(user.role) && (
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl">
            <span className="text-xs font-bold text-gray-400">Assignment Status</span>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${user.assignmentStatus === 'completed' ? 'bg-green-50 text-green-500' : 'bg-amber-50 text-amber-500'}`}>
              {user.assignmentStatus || 'pending'}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold px-1 mt-2">
          <span>Registered On</span>
          <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}
