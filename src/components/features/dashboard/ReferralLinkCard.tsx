'use client';

import React, { useState, useMemo } from 'react';
import { Copy, Check, Share2, Link as LinkIcon, Users, UserPlus, Briefcase } from 'lucide-react';

interface ReferralProps {
  inviterRole: 'vendor' | 'sub_vendor' | 'employee';
  vendorCode?: string;
  subVendorCode?: string;
  employeeCode?: string;
  campaignId?: string;
}

export default function ReferralLinkCard({ inviterRole, vendorCode, subVendorCode, employeeCode, campaignId }: ReferralProps) {
  const [copied, setCopied] = useState(false);
  
  const availableTargetRoles = useMemo(() => {
    if (inviterRole === 'vendor') return ['sub_vendor', 'employee'];
    if (inviterRole === 'sub_vendor') return ['employee'];
    return ['member'];
  }, [inviterRole]);

  const [targetRole, setTargetRole] = useState(availableTargetRoles[0]);
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  const referralUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set('role', targetRole);
    
    if (vendorCode) params.set('vendor', vendorCode);
    if (subVendorCode) params.set('subvendor', subVendorCode);
    if (employeeCode) params.set('employee', employeeCode);
    if (campaignId) params.set('campaign', campaignId);

    return `${baseUrl}/register?${params.toString()}`;
  }, [baseUrl, targetRole, vendorCode, subVendorCode, employeeCode, campaignId]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <LinkIcon size={120} />
      </div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-black text-secondary mb-1 flex items-center gap-2">
              <Share2 size={20} className="text-primary" /> Recruitment Link
            </h3>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
              Automated Hierarchy Onboarding
            </p>
          </div>
          
          {availableTargetRoles.length > 1 && (
            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
              {availableTargetRoles.map(r => (
                <button
                  key={r}
                  onClick={() => setTargetRole(r)}
                  className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${targetRole === r ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {r.replace('_', ' ')}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
             <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Invite URL for {targetRole.replace('_', ' ')}</label>
             <div className="flex gap-2 p-2 bg-gray-50 rounded-2xl border border-gray-100 items-center">
              <div className="flex-1 px-4 text-xs font-bold text-secondary truncate">
                {referralUrl}
              </div>
              <button 
                onClick={copyToClipboard}
                className={`p-3 rounded-xl transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest shrink-0 ${copied ? 'bg-green-500 text-white shadow-lg' : 'bg-white text-primary border border-gray-100 hover:bg-primary hover:text-white'}`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-2xl border border-primary/10">
             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                {targetRole === 'sub_vendor' ? <Users size={20} /> : targetRole === 'employee' ? <Briefcase size={20} /> : <UserPlus size={20} />}
             </div>
             <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
               Users joining via this link will be <span className="text-secondary">auto-assigned</span> to your team as <span className="text-primary uppercase">{targetRole.replace('_', ' ')}s</span>.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
