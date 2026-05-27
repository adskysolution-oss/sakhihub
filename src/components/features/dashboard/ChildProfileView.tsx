'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, User, MapPin, Phone, Mail, Calendar, 
  ShieldCheck, FileText, CheckCircle2, Clock, 
  AlertCircle, Target, Briefcase, Activity
} from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { getRequiredDocsForUser } from '@/utils/documents';

interface ChildProfileViewProps {
  childId: string;
  onClose: () => void;
}

export default function ChildProfileView({ childId, onClose }: ChildProfileViewProps) {
  const [data, setData] = useState<any>(null);
  const [type, setType] = useState<'user' | 'member' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/network/child/${childId}`);
        if (res.data.success) {
          setType(res.data.data.type);
          setData(res.data.data.data);
        } else {
          setError('Failed to load profile.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error loading profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [childId]);

  if (loading) {
    return (
      <div className="flex flex-col bg-white rounded-[40px] shadow-2xl border border-gray-100 min-h-[400px] items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Fetching Profile...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col bg-white rounded-[40px] shadow-2xl border border-gray-100 min-h-[400px] items-center justify-center relative">
        <button onClick={onClose} className="absolute right-6 top-6 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
          <X size={20} />
        </button>
        <AlertCircle size={40} className="text-red-400 mb-4" />
        <h3 className="text-xl font-black text-secondary">Access Denied</h3>
        <p className="text-sm text-gray-500 font-bold mt-2">{error || 'Could not load profile.'}</p>
      </div>
    );
  }

  const renderStatusBadge = (status: string) => {
    if (!status) return null;
    const s = status.toLowerCase();
    const isGood = ['active', 'paid', 'approved'].includes(s);
    return (
      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
        isGood ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
      }`}>
        {status}
      </span>
    );
  };

  const getDocumentLabel = (docType: string) => {
    return docType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'compliance', label: 'Verification & Docs', icon: ShieldCheck }
  ];

  return (
    <div className="flex flex-col bg-white rounded-[40px] shadow-2xl border border-gray-100 h-full max-h-[90vh] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary-dark to-secondary p-8 md:p-10 text-white relative shrink-0">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all z-20"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start relative z-10">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-[32px] bg-white text-secondary flex items-center justify-center text-3xl font-black shadow-xl border-4 border-white/20 shrink-0">
            {(data.fullName || data.name)?.[0] || 'U'}
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">{data.fullName || data.name}</h2>
              {renderStatusBadge(data.status || data.accountStatus || data.membershipStatus)}
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-2xl text-[10px] uppercase tracking-widest font-black border border-white/10">
                <ShieldCheck size={14} className="text-primary-light" />
                <span>
                  {type === 'member' ? 'Member' : data.role?.replace('_', ' ')}
                  {data.vendorCode && ` • ${data.vendorCode}`}
                  {data.subVendorCode && ` • ${data.subVendorCode}`}
                  {data.employeeId && ` • ${data.employeeId}`}
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-2xl text-[10px] uppercase tracking-widest font-bold border border-white/10">
                <MapPin size={14} className="text-primary-light" />
                <span>{data.district}, {data.state}</span>
              </div>
            </div>
          </div>
        </div>
        
        {tabs.length > 1 && (
          <div className="flex gap-2 mt-8 bg-white/5 p-1.5 rounded-[24px] border border-white/10 w-fit overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  activeTab === tab.id ? 'bg-white text-secondary shadow-xl' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-8 md:p-10 flex-1 overflow-y-auto min-h-0 custom-scrollbar">
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            <div>
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                 <FileText size={14} /> Profile Information
               </h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-3xl border border-gray-100">
                   <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm"><Phone size={18} /></div>
                   <div><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Mobile</p><p className="font-bold text-secondary text-sm">{data.mobile || 'N/A'}</p></div>
                 </div>
                 {data.email && (
                   <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-3xl border border-gray-100">
                     <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm"><Mail size={18} /></div>
                     <div><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Email</p><p className="font-bold text-secondary text-sm">{data.email}</p></div>
                   </div>
                 )}
                 <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-3xl border border-gray-100">
                   <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm"><Calendar size={18} /></div>
                   <div><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Joined On</p><p className="font-bold text-secondary text-sm">{new Date(data.joiningDate || data.createdAt).toLocaleDateString()}</p></div>
                 </div>
                 <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-3xl border border-gray-100">
                   <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm"><MapPin size={18} /></div>
                   <div><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Region</p><p className="font-bold text-secondary text-sm">{data.block || data.village || 'N/A'}, {data.pincode}</p></div>
                 </div>
               </div>
            </div>

            {type === 'member' && (data.assignedEmployee || data.assignedGroup) && (
               <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Network Assignments</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.assignedEmployee && (
                      <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><Briefcase size={18} /></div>
                        <div>
                          <p className="font-black text-blue-900">{data.assignedEmployee.fullName}</p>
                          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">Assigned Employee</p>
                        </div>
                      </div>
                    )}
                    {data.assignedGroup && (
                      <div className="p-5 bg-purple-50/50 rounded-3xl border border-purple-100 flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center"><User size={18} /></div>
                        <div>
                          <p className="font-black text-purple-900">{data.assignedGroup.groupName}</p>
                          <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mt-0.5">Assigned Group</p>
                        </div>
                      </div>
                    )}
                  </div>
               </div>
            )}

            {type === 'member' && data.campaignId && (
              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Active Campaign</h4>
                <div className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center gap-3 w-fit">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs"><Target size={14} /></div>
                  <p className="font-bold text-secondary text-sm">{data.campaignId.title || data.campaignId}</p>
                </div>
              </div>
            )}

            {type === 'user' && data.assignedCampaigns && data.assignedCampaigns.length > 0 && (
              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Active Campaigns</h4>
                <div className="space-y-3">
                  {data.assignedCampaigns.map((camp: any) => (
                    <div key={camp._id} className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs"><Target size={14} /></div>
                      <p className="font-bold text-secondary text-sm">{camp.title || camp}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'compliance' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="bg-amber-50 p-6 rounded-[32px] border border-amber-100 flex gap-4">
               <ShieldCheck size={24} className="text-amber-500 shrink-0" />
               <div>
                 <h5 className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Document Status Tracking</h5>
                 <p className="text-[11px] text-amber-800 font-bold leading-relaxed">
                   Monitor the verification progress of this user's mandatory documents. Due to security policies, actual document files cannot be previewed or downloaded here. If a document is rejected, guide the user to re-upload it from their own dashboard.
                 </p>
               </div>
            </div>

            <div className="space-y-4">
              {(() => {
                let requiredDocs = getRequiredDocsForUser(data.role, data.documents, data.vendorType);
                if (requiredDocs.length === 0 && data.documents) {
                  requiredDocs = Object.keys(data.documents);
                }
                
                if (requiredDocs.length === 0) {
                  return (
                    <div className="p-10 text-center bg-gray-50 border border-gray-100 rounded-[32px]">
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No documents required or uploaded.</p>
                    </div>
                  );
                }

                return requiredDocs.map((docType) => {
                  const doc = data.documents?.[docType];
                  const status = doc?.status || 'Not Uploaded';
                  let statusColor = 'bg-gray-100 text-gray-500';
                  let icon = <Clock size={16} />;

                if (status === 'approved') {
                  statusColor = 'bg-green-100 text-green-700 border border-green-200';
                  icon = <CheckCircle2 size={16} className="text-green-600" />;
                } else if (status === 'rejected' || status === 'reupload_required') {
                  statusColor = 'bg-red-50 text-red-700 border border-red-200';
                  icon = <AlertCircle size={16} className="text-red-600" />;
                } else if (status === 'under_review') {
                  statusColor = 'bg-amber-100 text-amber-700 border border-amber-200';
                  icon = <Activity size={16} className="text-amber-600" />;
                }

                return (
                  <div key={docType} className={`p-5 rounded-3xl ${doc ? statusColor : 'bg-gray-50 border border-gray-100'} transition-all`}>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-sm flex items-center gap-2">
                          {icon} {getDocumentLabel(docType)}
                        </h4>
                        {doc?.uploadedAt && (
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mt-2">
                            Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        !doc ? 'bg-gray-200 text-gray-500' : 
                        status === 'approved' ? 'bg-green-200 text-green-800' : 
                        status.includes('reject') ? 'bg-red-200 text-red-800' : 
                        'bg-white/50 text-current'
                      }`}>
                        {status.replace('_', ' ')}
                      </div>
                    </div>

                    {(doc?.remarks || doc?.exceptionAdminRemarks || doc?.exceptionReason) && (
                      <div className="mt-4 pt-4 border-t border-current/10">
                        {doc.exceptionReason && (
                          <div className="mb-2">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">User Reason:</span>
                            <p className="text-xs font-bold mt-0.5">{doc.exceptionReason}</p>
                          </div>
                        )}
                        {(doc.remarks || doc.exceptionAdminRemarks) && (
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Admin Remarks:</span>
                            <p className="text-xs font-bold mt-0.5">{doc.exceptionAdminRemarks || doc.remarks}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
