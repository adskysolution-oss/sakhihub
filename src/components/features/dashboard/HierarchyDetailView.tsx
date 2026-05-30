'use client';

import React from 'react';
import { 
  User, ShieldCheck, MapPin, Phone, Mail, 
  Users, Briefcase, Sparkles, Target, 
  FileText, CreditCard, PieChart, Activity,
  ChevronRight, Link2, ExternalLink, Calendar,
  CheckCircle2, Clock, AlertCircle, X,
  FileCheck, Landmark, UserCheck, RefreshCw, PenTool
} from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  getDocumentViewUrl, 
  isDocumentUploaded, 
  REQUIRED_DOCS_BY_ROLE, 
  getDocComplianceSummary,
  getRequiredDocs,
  getRequiredDocsForUser
} from '@/utils/documents';
import DocumentReviewCard from '@/components/features/dashboard/DocumentReviewCard';
import { toast } from 'sonner';
import StatCard from '@/components/shared/StatCard';
import { getProxiedImageUrl } from '@/utils/imageUrl';

interface HierarchyDetailViewProps {
  data: {
    user: any;
    counts: {
      subVendors: number;
      employees: number;
      members: number;
      paidMembers: number;
      freeMembers: number;
      groups: number;
      campaigns: number;
      pendingApprovals: number;
    };
    hierarchy: {
      subVendors: any[];
      employees: any[];
      members: any[];
      groups: any[];
    };
  };
  onClose: () => void;
  onStatusUpdate?: (id: string, status: string, remarks?: string) => void;
}

export default function HierarchyDetailView({ data, onClose, onStatusUpdate }: HierarchyDetailViewProps) {
  const { user, counts, hierarchy } = data;
  const [activeTab, setActiveTab] = React.useState('overview');
  
  // Appointment / Agreement Letter State
  const [joiningDate, setJoiningDate] = React.useState('');
  const [salary, setSalary] = React.useState('');
  
  // Vendor Specific Agreement State
  const [partnerType, setPartnerType] = React.useState('');
  const [assignedTerritory, setAssignedTerritory] = React.useState('');
  const [incentiveStructure, setIncentiveStructure] = React.useState('');
  const [salaryStructure, setSalaryStructure] = React.useState('');
  const [monthlyTargets, setMonthlyTargets] = React.useState('');
  const [operationalRole, setOperationalRole] = React.useState('');
  const [membershipCommission, setMembershipCommission] = React.useState('');

  const [isGeneratingAppt, setIsGeneratingAppt] = React.useState(false);
  // Keep local user state to update appointment details immediately
  const [localUser, setLocalUser] = React.useState(user);
  const [digitalCertificates, setDigitalCertificates] = React.useState<any[]>((data as any).digitalCertificates || []);

  React.useEffect(() => {
    setLocalUser(user);
    setDigitalCertificates((data as any).digitalCertificates || []);
  }, [user, (data as any).digitalCertificates]);

  React.useEffect(() => {
    const agreement = localUser?.vendorAgreementDetails || localUser?.appointmentDetails;
    if (agreement) {
      if (agreement.joiningDate) {
        try {
          const dateObj = new Date(agreement.joiningDate);
          if (!isNaN(dateObj.getTime())) {
            setJoiningDate(dateObj.toISOString().split('T')[0]);
          }
        } catch (e) {}
      }
      setPartnerType(agreement.partnerType || '');
      setAssignedTerritory(agreement.assignedTerritory || '');
      setIncentiveStructure(agreement.incentiveStructure || '');
      setSalaryStructure(agreement.salaryStructure || '');
      setMonthlyTargets(agreement.monthlyTargets || '');
      setOperationalRole(agreement.operationalRole || '');
      setMembershipCommission(agreement.membershipCommission || '');
    }

    const offerLetter = localUser?.offerLetterDetails;
    if (offerLetter) {
      if (offerLetter.joiningDate) {
        try {
          const dateObj = new Date(offerLetter.joiningDate);
          if (!isNaN(dateObj.getTime())) {
            setJoiningDate(dateObj.toISOString().split('T')[0]);
          }
        } catch (e) {}
      }
      setSalary(offerLetter.salary ? offerLetter.salary.toString() : '');
    }
  }, [localUser]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: PieChart },
    { id: 'network', label: 'Network', icon: Users },
    { id: 'ops', label: 'Operations', icon: Target },
    { id: 'docs', label: 'Compliance', icon: ShieldCheck },
    { id: 'agreement', label: 'Agreement', icon: PenTool },
  ];

  const generateAppointmentLetter = async () => {
    if (!joiningDate || !salary) {
      toast.error("Please enter both Joining Date and Salary.");
      return;
    }
    setIsGeneratingAppt(true);
    try {
      const res = await axios.post(`/api/admin/users/${localUser._id}/appointment`, {
        joiningDate,
        salary
      });
      if (res.data.success) {
        setLocalUser(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to generate appointment letter");
    } finally {
      setIsGeneratingAppt(false);
    }
  };

  const [signedDocRemarks, setSignedDocRemarks] = React.useState('');
  const [signedDocActionLoading, setSignedDocActionLoading] = React.useState<string | null>(null);

  const updateDocumentLock = async (
    docId: string,
    isLocked: boolean,
    isApproved: boolean,
    adminRemarks?: string,
    newStatus?: string
  ) => {
    try {
      const res = await axios.post(`/api/admin/users/${localUser._id}/documents/${docId}/lock`, {
        isLocked,
        isApproved,
        adminRemarks,
        newStatus
      });
      if (res.data.success) {
        setDigitalCertificates(prev => prev.map(d => d._id === docId ? { ...d, ...res.data.data.document } : d));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update document status');
    }
  };

  return (
    <div className="flex flex-col bg-white rounded-[40px] shadow-2xl border border-gray-100 min-h-full">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-secondary-dark to-secondary p-8 md:p-10 text-white relative shrink-0">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 md:right-10 md:top-10 w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all z-20"
          title="Close Details"
        ><X size={20} /></button>

        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-[40px] bg-white text-secondary flex items-center justify-center text-4xl md:text-6xl font-black shadow-2xl border-4 border-white/20 overflow-hidden">
            {user.profileImage ? (
              <img src={getProxiedImageUrl(user.profileImage)} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              user.fullName?.[0] || 'U'
            )}
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">{user.fullName}</h2>
              <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest self-center md:self-auto ${user.status === 'active' ? 'bg-green-400 text-secondary' : 'bg-amber-400 text-secondary'}`}>
                {user.status}
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-2xl text-xs font-bold border border-white/10">
                <ShieldCheck size={14} className="text-primary-light" />
                <span>{user.role.replace('_', ' ').toUpperCase()}: {user.vendorCode || user.subVendorCode || user.employeeId}</span>
              </div>
              {user.role === 'vendor' && user.vendorType && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black border border-white/10 ${
                  user.vendorType === 'company' ? 'bg-blue-400/20' :
                  user.vendorType === 'ngo_trust' ? 'bg-purple-400/20' :
                  'bg-white/10'
                }`}>
                  <Briefcase size={14} className="text-primary-light" />
                <span>{localUser.vendorType === 'ngo_trust' ? 'NGO / Trust' : localUser.vendorType === 'company' ? 'Company' : 'Individual'} Vendor</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-2xl text-xs font-bold border border-white/10">
              <MapPin size={14} className="text-primary-light" />
              <span>{localUser.district}, {localUser.state}</span>
            </div>
            {localUser.parentVendorId && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-2xl text-xs font-bold border border-white/10">
                <Link2 size={14} className="text-primary-light" />
                <span>Parent: {localUser.parentVendorId.fullName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 mt-12 bg-white/5 p-1.5 rounded-[24px] border border-white/10 w-fit overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-secondary shadow-xl' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-8 md:p-10">
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {user.role === 'vendor' && <StatCard label="Sub-Vendors" value={counts.subVendors} icon={Sparkles} color="bg-primary/10 text-primary" />}
              <StatCard label="Total Employees" value={counts.employees} icon={Briefcase} color="bg-secondary/10 text-secondary" />
              <StatCard label="Total Members" value={counts.members} icon={Users} color="bg-green-50 text-green-600" />
              <StatCard label="Women Groups" value={counts.groups} icon={Activity} color="bg-amber-50 text-amber-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8">
                {/* Profile Detail List */}
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <FileText size={14} /> Profile Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: 'Mobile', value: user.mobile, icon: Phone },
                      { label: 'Email', value: user.email || 'N/A', icon: Mail },
                      { label: 'Joined', value: new Date(user.createdAt).toLocaleDateString(), icon: Calendar },
                      { label: 'Area', value: `${user.block || 'All Blocks'}, ${user.district}`, icon: MapPin },
                      { label: 'Pincode', value: user.pincode || 'N/A', icon: MapPin },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-5 bg-gray-50 rounded-3xl border border-gray-100">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm">
                          <item.icon size={18} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                          <p className="font-bold text-secondary text-sm">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Membership Summary */}
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <CreditCard size={14} /> Membership Status
                  </h4>
                  <div className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-[40px] border border-primary/10 flex flex-wrap gap-12 items-center justify-around">
                    <div className="text-center">
                      <p className="text-3xl font-black text-secondary">{counts.paidMembers}</p>
                      <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mt-1">Paid Members</p>
                    </div>
                    <div className="w-px h-12 bg-gray-200 hidden md:block" />
                    <div className="text-center">
                      <p className="text-3xl font-black text-secondary">{counts.freeMembers}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Free Members</p>
                    </div>
                    <div className="w-px h-12 bg-gray-200 hidden md:block" />
                    <div className="text-center">
                      <p className="text-3xl font-black text-secondary">{counts.pendingApprovals}</p>
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-1">Pending Approval</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-8">
                 <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Target size={14} /> Active Campaigns
                  </h4>
                  <div className="space-y-3">
                    {user.assignedCampaigns?.length > 0 ? user.assignedCampaigns.map((camp: any) => (
                      <div key={camp._id} className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-primary transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs">C</div>
                          <p className="font-bold text-secondary text-sm">{camp.title}</p>
                        </div>
                        <ChevronRight size={14} className="text-gray-300 group-hover:text-primary transition-colors" />
                      </div>
                    )) : (
                      <div className="p-6 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-center">
                        <p className="text-xs font-bold text-gray-400 italic">No assigned campaigns</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'network' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
             {/* Sub-Vendors (Only for Vendor) */}
             {user.role === 'vendor' && (
               <div>
                 <div className="flex justify-between items-end mb-6">
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                     <Sparkles size={14} /> Sub-Vendor Partners ({hierarchy.subVendors.length})
                   </h4>
                   <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View All Network</button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {hierarchy.subVendors.length > 0 ? hierarchy.subVendors.map(sv => (
                     <div key={sv._id} className="p-5 bg-white border border-gray-100 rounded-[32px] shadow-sm flex items-center justify-between group hover:border-primary transition-all">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center font-black text-lg overflow-hidden">
                           {sv.profileImage ? (
                             <img src={getProxiedImageUrl(sv.profileImage)} alt={sv.fullName} className="w-full h-full object-cover" />
                           ) : (
                             'S'
                           )}
                         </div>
                         <div>
                           <p className="font-black text-secondary leading-tight">{sv.fullName}</p>
                           <p className="text-[10px] text-primary font-black mt-0.5 uppercase tracking-widest">{sv.subVendorCode}</p>
                         </div>
                       </div>
                       <button className="p-2 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-primary group-hover:text-white transition-all"><ExternalLink size={14} /></button>
                     </div>
                   )) : (
                     <div className="col-span-2 p-10 bg-gray-50 rounded-[32px] border border-dashed border-gray-200 text-center">
                        <AlertCircle size={24} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-xs font-bold text-gray-400">No sub-vendors registered under this vendor yet.</p>
                     </div>
                   )}
                 </div>
               </div>
             )}

             {/* Employees */}
             <div>
                <div className="flex justify-between items-end mb-6">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Briefcase size={14} /> Field Operations Staff ({hierarchy.employees.length})
                  </h4>
                </div>
                <div className="overflow-hidden rounded-[32px] border border-gray-100 shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee</th>
                        <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID & Role</th>
                        <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Region</th>
                        <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {hierarchy.employees.length > 0 ? hierarchy.employees.map(emp => (
                        <tr key={emp._id} className="hover:bg-gray-50/30 transition-colors">
                          <td className="p-5 font-black text-secondary text-sm">{emp.fullName}</td>
                          <td className="p-5">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{emp.employeeId}</span>
                            <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">{emp.designation}</p>
                          </td>
                          <td className="p-5 text-xs text-gray-500 font-bold">{emp.block || 'All'}, {emp.district}</td>
                          <td className="p-5">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${emp.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                              {emp.status}
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} className="p-10 text-center text-xs font-bold text-gray-400">No field staff found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
             </div>

             {/* Groups/Members Summary */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Recent Groups ({hierarchy.groups.length})</h4>
                   <div className="space-y-3">
                     {hierarchy.groups.slice(0, 5).map(g => (
                       <div key={g._id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
                         <div>
                           <p className="font-bold text-secondary text-sm">{g.groupName}</p>
                           <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{g.village}, {g.totalMembers} Members</p>
                         </div>
                         <div className="text-[9px] font-black text-primary uppercase tracking-widest">Ldr: {g.leaderName}</div>
                       </div>
                     ))}
                   </div>
                </div>
                <div>
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Network Members ({hierarchy.members.length})</h4>
                   <div className="space-y-3">
                     {hierarchy.members.slice(0, 5).map(m => (
                       <div key={m._id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
                         <div>
                           <p className="font-bold text-secondary text-sm">{m.name}</p>
                           <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{m.village} • {m.mobile}</p>
                         </div>
                         <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${m.membershipStatus === 'paid' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                           {m.membershipStatus}
                         </span>
                       </div>
                     ))}
                   </div>
                </div>
             </div>
          </motion.div>
        )}

        {activeTab === 'ops' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            <div className="p-10 bg-gray-50 rounded-[40px] border border-gray-100 text-center">
               <AlertCircle size={40} className="mx-auto text-gray-300 mb-4" />
               <h3 className="text-xl font-black text-secondary">Operations Dashboard</h3>
               <p className="text-sm text-gray-400 font-bold mt-2 max-w-md mx-auto">This section will display advanced metrics, support ticket history, and real-time field reports from the network.</p>
               <button className="btn-primary px-8 py-3 mt-6 text-[10px]">Open Analytics Portal</button>
            </div>
          </motion.div>
        )}

        {activeTab === 'docs' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="flex-1 space-y-8">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <FileText size={14} /> Document Review Workspace
                  </h4>
                </div>

                {/* Credential Details Block */}
                <div className="bg-gray-50/50 border border-gray-100 rounded-[32px] p-6 space-y-6">
                  <h5 className="text-xs font-black text-secondary uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 pb-3">
                    <FileText size={16} className="text-primary" /> Submitted Credential Details
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Aadhaar & PAN Card Info */}
                    <div className="space-y-4">
                      <div className="bg-white p-5 rounded-2xl border border-gray-50 shadow-sm flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <UserCheck size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Aadhaar Number</p>
                          <p className="font-mono font-bold text-secondary text-sm mt-1 truncate">
                            {localUser.aadhaarNumber ? localUser.aadhaarNumber.replace(/(\d{4})/g, '$1 ').trim() : 'Not Provided'}
                          </p>
                        </div>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-gray-50 shadow-sm flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <FileCheck size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">PAN Number</p>
                          <p className="font-mono font-bold text-secondary text-sm mt-1 truncate">
                            {localUser.panNumber || 'Not Provided'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bank details info */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-50 shadow-sm flex flex-col gap-4">
                      <div className="flex items-center gap-3 border-b border-gray-50 pb-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Landmark size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Bank Details</p>
                          <p className="font-black text-secondary text-xs truncate">{localUser.bankDetails?.bankName || 'Not Provided'}</p>
                        </div>
                      </div>
                      {localUser.bankDetails?.accountNumber ? (
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="min-w-0">
                            <p className="text-[8px] font-black text-gray-400 uppercase">Account Holder</p>
                            <p className="font-bold text-secondary truncate mt-0.5">{localUser.bankDetails?.accountHolderName || 'N/A'}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[8px] font-black text-gray-400 uppercase">Account Number</p>
                            <p className="font-mono font-bold text-secondary truncate mt-0.5">{localUser.bankDetails?.accountNumber}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[8px] font-black text-gray-400 uppercase">IFSC Code</p>
                            <p className="font-mono font-bold text-secondary truncate mt-0.5">{localUser.bankDetails?.ifscCode || 'N/A'}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[8px] font-black text-gray-400 uppercase">Branch</p>
                            <p className="font-bold text-secondary truncate mt-0.5">{localUser.bankDetails?.branchName || 'N/A'}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-400 font-bold italic text-xs">
                          Bank details not submitted.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {getRequiredDocsForUser(user.role, user.documents, user.vendorType).map((type) => (
                    <DocumentReviewCard 
                      key={type}
                      type={type}
                      docInfo={user.documents?.[type]}
                      onStatusUpdate={async (type, status, remarks) => {
                        await onStatusUpdate?.(user._id, `doc:${type}:${status}`, remarks);
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Verification Summary Sidebar */}
              <div className="lg:w-80 space-y-8">
                <div className="bg-secondary-dark p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                   <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
                   <h4 className="text-xl font-black mb-6 relative z-10">Compliance Summary</h4>
                   <div className="space-y-6 relative z-10">
                      {(() => {
                        const summary = getDocComplianceSummary(user.documents, user.role, user.vendorType);
                        
                        return (
                          <>
                            {[
                              { label: 'Total Required', value: summary.total, icon: FileText, color: 'bg-white/10' },
                              { label: 'Uploaded', value: summary.uploaded, icon: CheckCircle2, color: 'bg-primary/40' },
                              { label: 'Approved', value: summary.approved, icon: ShieldCheck, color: 'bg-green-500' },
                              { label: 'Rejected', value: summary.rejected, icon: AlertCircle, color: 'bg-red-500' }
                            ].map((item, idx) => (
                              <div key={idx} className="flex items-center gap-4">
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                                   <item.icon size={20} />
                                 </div>
                                 <div>
                                   <p className="text-[9px] font-black uppercase tracking-widest opacity-60">{item.label}</p>
                                   <p className="text-lg font-black">{item.value}</p>
                                 </div>
                              </div>
                            ))}

                            <div className="mt-8 pt-6 border-t border-white/10">
                              <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center ${
                                summary.isFullyApproved ? 'bg-green-500 text-white' : 'bg-white/10 text-white/60'
                              }`}>
                                {summary.isFullyApproved ? 'All Documents Verified' : 'Verification Pending'}
                              </div>
                            </div>
                          </>
                        );
                      })()}
                   </div>
                </div>

                <div className="bg-amber-50 p-6 rounded-[32px] border border-amber-100">
                   <h5 className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Clock size={14} /> Review Policy
                   </h5>
                   <p className="text-[11px] text-amber-800 font-bold leading-relaxed">
                      Final approval should only be granted once all mandatory documents are marked as "approved". Rejected documents will prompt the partner to re-upload.
                   </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'agreement' && (() => {
          const hasAgreement = localUser.role === 'employee' ? localUser.offerLetterDetails : localUser.vendorAgreementDetails;
          return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl mx-auto flex items-center justify-center mb-4">
                    <FileText size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-secondary tracking-tight">
                    {localUser.role === 'employee' ? 'Employee Offer Letter' : 'Vendor Agreement'}
                  </h3>
                  <p className="text-sm text-gray-500 font-bold mt-2">
                    {hasAgreement 
                      ? `View and manage the official digital ${localUser.role === 'employee' ? 'offer letter' : 'agreement'} details.` 
                      : `Generate the official digital ${localUser.role === 'employee' ? 'offer letter' : 'agreement'} for this ${localUser.role === 'employee' ? 'employee' : 'partner'}.`
                    }
                  </p>
                </div>

                {hasAgreement && (
                  <div className="bg-green-50 border border-green-200 rounded-[32px] p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/50 rounded-full blur-2xl -mr-16 -mt-16" />
                    <div className="relative z-10">
                      <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
                      <h4 className="text-xl font-black text-green-800">
                        {localUser.role === 'employee' ? 'Employee Offer Letter' : 'Vendor Agreement'} Generated Successfully
                      </h4>
                      <p className="text-sm text-green-700 font-bold mt-2 mb-6">
                        ID: <span className="font-mono bg-white px-2 py-1 rounded">
                          {localUser.role === 'employee' ? localUser.offerLetterDetails.offerLetterId : localUser.vendorAgreementDetails.agreementId}
                        </span>
                      </p>
                      <a 
                        href={localUser.role === 'employee' ? `/employee-offer-letter/${localUser._id}` : (localUser.vendorAgreementDetails.fileUrl || `/api/vendor/agreement/${localUser.vendorAgreementDetails.agreementId}/preview`)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
                      >
                        <ExternalLink size={16} /> Preview & Print Document
                      </a>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Joining Date</label>
                      <input 
                        type="date" 
                        value={joiningDate}
                        onChange={(e) => setJoiningDate(e.target.value)}
                        className="w-full px-5 py-3 rounded-2xl bg-white border border-gray-200 font-bold text-secondary focus:outline-none focus:border-primary"
                      />
                    </div>

                    {localUser.role === 'employee' ? (
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Fixed Salary / Remuneration (₹)</label>
                        <div className="relative">
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-gray-400">₹</span>
                          <input 
                            type="number" 
                            placeholder="e.g. 15000"
                            value={salary}
                            onChange={(e) => setSalary(e.target.value)}
                            className="w-full pl-10 pr-5 py-3 rounded-2xl bg-white border border-gray-200 font-bold text-secondary focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Partner Type</label>
                          <input type="text" value={partnerType} onChange={(e) => setPartnerType(e.target.value)} placeholder="e.g. Authorized Distributor" className="w-full px-5 py-3 rounded-2xl bg-white border border-gray-200 font-bold text-secondary focus:outline-none focus:border-primary" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Assigned Territory</label>
                          <input type="text" value={assignedTerritory} onChange={(e) => setAssignedTerritory(e.target.value)} placeholder="e.g. North District" className="w-full px-5 py-3 rounded-2xl bg-white border border-gray-200 font-bold text-secondary focus:outline-none focus:border-primary" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Salary Structure</label>
                          <input type="text" value={salaryStructure} onChange={(e) => setSalaryStructure(e.target.value)} placeholder="e.g. ₹20,000/mo Fixed" className="w-full px-5 py-3 rounded-2xl bg-white border border-gray-200 font-bold text-secondary focus:outline-none focus:border-primary" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Incentive Structure</label>
                          <input type="text" value={incentiveStructure} onChange={(e) => setIncentiveStructure(e.target.value)} placeholder="e.g. 5% on Sales" className="w-full px-5 py-3 rounded-2xl bg-white border border-gray-200 font-bold text-secondary focus:outline-none focus:border-primary" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Membership Commission</label>
                          <input type="text" value={membershipCommission} onChange={(e) => setMembershipCommission(e.target.value)} placeholder="e.g. ₹100 per member" className="w-full px-5 py-3 rounded-2xl bg-white border border-gray-200 font-bold text-secondary focus:outline-none focus:border-primary" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Monthly Targets</label>
                          <input type="text" value={monthlyTargets} onChange={(e) => setMonthlyTargets(e.target.value)} placeholder="e.g. 50 Members/mo" className="w-full px-5 py-3 rounded-2xl bg-white border border-gray-200 font-bold text-secondary focus:outline-none focus:border-primary" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Operational Role</label>
                          <input type="text" value={operationalRole} onChange={(e) => setOperationalRole(e.target.value)} placeholder="e.g. Manage field agents and onboarding" className="w-full px-5 py-3 rounded-2xl bg-white border border-gray-200 font-bold text-secondary focus:outline-none focus:border-primary" />
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={async () => {
                        if (!joiningDate) {
                          toast.error("Please enter Joining Date.");
                          return;
                        }
                        if (localUser.role === 'employee' && !salary) {
                          toast.error("Please enter Salary.");
                          return;
                        }
                        setIsGeneratingAppt(true);
                        try {
                          const endpoint = localUser.role === 'employee' 
                            ? `/api/admin/users/${localUser._id}/offer-letter`
                            : `/api/admin/users/${localUser._id}/vendor-agreement`;
                          
                          const payload = localUser.role === 'employee' 
                            ? { joiningDate, salary }
                            : { 
                                joiningDate, partnerType, assignedTerritory, 
                                salaryStructure, incentiveStructure, membershipCommission, 
                                monthlyTargets, operationalRole 
                              };

                          const res = await axios.post(endpoint, payload);
                          if (res.data.success) {
                            const updatedUser = res.data.data;
                            setLocalUser(updatedUser);

                            // Immediately inject the new doc into digitalCertificates so the
                            // signed-doc review panel appears without needing a page refresh
                            if (localUser.role === 'employee' && updatedUser.offerLetterDetails) {
                              const ol = updatedUser.offerLetterDetails;
                              setDigitalCertificates(prev => {
                                const filtered = prev.filter(c => c.type !== 'employee_offer_letter');
                                return [...filtered, {
                                  _id: ol._id,
                                  type: 'employee_offer_letter',
                                  title: 'Employee Offer Letter',
                                  fileUrl: ol.pdfUrl,
                                  uploadedDocumentUrl: ol.uploadedDocumentUrl,
                                  status: ol.status || 'generated',
                                  isLocked: ol.isLocked || false,
                                  adminRemarks: ol.adminRemarks,
                                  agreementId: ol.offerLetterId,
                                  createdAt: ol.createdAt,
                                  visibleToEmployee: true
                                }];
                              });
                            } else if ((localUser.role === 'vendor' || localUser.role === 'sub_vendor') && updatedUser.vendorAgreementDetails) {
                              const ag = updatedUser.vendorAgreementDetails;
                              setDigitalCertificates(prev => {
                                const filtered = prev.filter(c => c.type !== 'auth_letter');
                                return [...filtered, {
                                  _id: ag._id,
                                  type: 'auth_letter',
                                  title: 'Partnership Agreement',
                                  fileUrl: ag.fileUrl || `/api/vendor/agreement/${ag.agreementId}/preview`,
                                  uploadedDocumentUrl: ag.uploadedDocumentUrl,
                                  status: ag.status || 'generated',
                                  isLocked: ag.isLocked || false,
                                  adminRemarks: ag.adminRemarks,
                                  agreementId: ag.agreementId,
                                  createdAt: ag.createdAt,
                                  visibleToVendor: true
                                }];
                              });
                            }
                            toast.success(hasAgreement ? "Details updated successfully" : "Document generated successfully");
                          }
                        } catch (err: any) {
                          toast.error(err.response?.data?.message || "Failed to update details");
                        } finally {
                          setIsGeneratingAppt(false);
                        }
                      }}
                      disabled={isGeneratingAppt}
                      className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform disabled:opacity-50"
                    >
                      {isGeneratingAppt 
                        ? (hasAgreement ? 'Updating...' : 'Generating...') 
                        : (hasAgreement 
                            ? `Update ${localUser.role === 'employee' ? 'Offer Letter' : 'Agreement'} Details` 
                            : `Generate ${localUser.role === 'employee' ? 'Offer Letter' : 'Vendor Agreement'}`
                          )
                      }
                    </button>
                    <p className="text-[10px] text-gray-400 font-bold text-center uppercase tracking-widest">
                      * System will generate an immutable PDF document using these details.
                    </p>
                  </div>
                </div>

                {/* Signed Document Review Panel */}
                {hasAgreement && (() => {
                  const targetType = localUser.role === 'employee' ? 'employee_offer_letter' : 'auth_letter';
                  const authLetter = digitalCertificates?.find((c: any) => c.type === targetType);
                  if (!authLetter) return null;

                  const docStatus = authLetter.status || 'generated';
                  const isDocLocked = authLetter.isLocked;

                  const statusConfig: Record<string, { label: string; cls: string }> = {
                    generated: { label: 'Generated — Awaiting Signed Copy', cls: 'bg-blue-100 text-blue-700' },
                    uploaded:  { label: 'Signed Copy Uploaded — Pending Review', cls: 'bg-amber-100 text-amber-700' },
                    under_review: { label: 'Under Review', cls: 'bg-amber-100 text-amber-700' },
                    approved:  { label: 'Approved & Locked', cls: 'bg-green-100 text-green-700' },
                    rejected:  { label: 'Rejected', cls: 'bg-red-100 text-red-700' },
                    reupload_required: { label: 'Re-upload Requested', cls: 'bg-orange-100 text-orange-700' },
                  };
                  const meta = statusConfig[docStatus] || statusConfig.generated;

                  return (
                    <div className="bg-white border border-gray-100 shadow-soft rounded-[32px] p-8 mt-8 space-y-6">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-lg font-black text-secondary">
                            {localUser.role === 'employee' ? 'Offer Letter' : 'Vendor Agreement'} — Signed Copy Review
                          </h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                            ID: {authLetter.agreementId || authLetter._id?.toString?.()?.slice(-8)}
                          </p>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shrink-0 ${meta.cls}`}>
                          {meta.label}
                        </span>
                      </div>

                      {/* Signed copy actions / preview */}
                      {authLetter.uploadedDocumentUrl ? (
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row gap-3">
                            <a
                              href={getDocumentViewUrl(authLetter.uploadedDocumentUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-secondary border border-gray-200 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-colors"
                            >
                              <ExternalLink size={14} /> View Signed Document
                            </a>
                            {!isDocLocked && (
                              <a
                                href={authLetter.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-secondary border border-gray-200 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-colors"
                              >
                                <ExternalLink size={14} /> View Generated Copy
                              </a>
                            )}
                          </div>

                          {/* Admin Remarks Input */}
                          {!isDocLocked && (
                            <div>
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
                                Admin Remarks (required for rejection / reupload request)
                              </label>
                              <textarea
                                value={signedDocRemarks}
                                onChange={e => setSignedDocRemarks(e.target.value)}
                                placeholder="Enter remarks for the partner..."
                                rows={2}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold placeholder:text-gray-300 focus:outline-none focus:border-primary resize-none"
                              />
                            </div>
                          )}

                          {/* Display previously saved remarks */}
                          {authLetter.adminRemarks && (docStatus === 'rejected' || docStatus === 'reupload_required') && (
                            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-3">
                              <AlertCircle size={16} className="text-orange-500 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[9px] font-black text-orange-700 uppercase tracking-widest mb-1">Previous Remarks</p>
                                <p className="text-xs font-bold text-orange-800">{authLetter.adminRemarks}</p>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row gap-2">
                            {isDocLocked ? (
                              <button
                                onClick={async () => {
                                  setSignedDocActionLoading('unlock');
                                  await updateDocumentLock(authLetter._id, false, false);
                                  setSignedDocActionLoading(null);
                                }}
                                disabled={!!signedDocActionLoading}
                                className="flex-1 px-4 py-3 bg-amber-50 text-amber-700 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
                              >
                                <AlertCircle size={14} /> {signedDocActionLoading === 'unlock' ? 'Unlocking...' : 'Unlock Document'}
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={async () => {
                                    setSignedDocActionLoading('approve');
                                    await updateDocumentLock(authLetter._id, true, true, signedDocRemarks || undefined, 'approved');
                                    setSignedDocRemarks('');
                                    setSignedDocActionLoading(null);
                                  }}
                                  disabled={!!signedDocActionLoading}
                                  className={`flex-1 px-4 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${
                                    docStatus === 'approved' ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-green-50 text-green-700 hover:bg-green-100'
                                  }`}
                                >
                                  <ShieldCheck size={14} /> {signedDocActionLoading === 'approve' ? 'Approving...' : 'Approve & Lock'}
                                </button>
                                <button
                                  onClick={async () => {
                                    if (!signedDocRemarks.trim()) {
                                      toast.error('Please enter remarks before requesting a reupload.');
                                      return;
                                    }
                                    setSignedDocActionLoading('reupload');
                                    await updateDocumentLock(authLetter._id, false, false, signedDocRemarks, 'reupload_required');
                                    setSignedDocRemarks('');
                                    setSignedDocActionLoading(null);
                                  }}
                                  disabled={!!signedDocActionLoading}
                                  className={`flex-1 px-4 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${
                                    docStatus === 'reupload_required' ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                  }`}
                                >
                                  <RefreshCw size={14} /> {signedDocActionLoading === 'reupload' ? 'Requesting...' : 'Request Reupload'}
                                </button>
                                <button
                                  onClick={async () => {
                                    if (!signedDocRemarks.trim()) {
                                      toast.error('Please enter a reason for rejection.');
                                      return;
                                    }
                                    setSignedDocActionLoading('reject');
                                    await updateDocumentLock(authLetter._id, false, false, signedDocRemarks, 'rejected');
                                    setSignedDocRemarks('');
                                    setSignedDocActionLoading(null);
                                  }}
                                  disabled={!!signedDocActionLoading}
                                  className={`flex-1 px-4 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${
                                    docStatus === 'rejected' ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-red-50 text-red-700 hover:bg-red-100'
                                  }`}
                                >
                                  <X size={14} /> {signedDocActionLoading === 'reject' ? 'Rejecting...' : 'Reject'}
                                </button>
                              </>
                            )}
                          </div>

                          {isDocLocked && (
                            <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                              <CheckCircle2 size={12} /> Document is verified and locked
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                          <FileText size={32} className="text-gray-200 mb-3" />
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Signed copy not yet uploaded
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold mt-2">
                            The partner must download, sign, and upload the document from their dashboard.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          );
        })()}
      </div>

      {/* Footer / Approval Actions */}
      <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 mt-auto shrink-0">
        <div className="flex items-center gap-4">
           <Activity size={20} className="text-primary animate-pulse" />
           <div>
             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Network Health</p>
             <p className="font-bold text-secondary text-sm">
               {user.status === 'active' ? 'Operational & Active' : 
                user.status === 'approved' ? 'Verified but Not Activated' :
                'Account Under Review'}
             </p>
           </div>
        </div>

        <div className="flex gap-4">
           {user.status !== 'active' ? (
             <>
               <button 
                 onClick={() => {
                   const reason = prompt("Please provide a mandatory reason for rejecting this partner:");
                   if (reason !== null && reason.trim() !== "") {
                     onStatusUpdate?.(user._id, 'rejected', reason);
                   } else if (reason !== null) {
                     toast.error("A reason is required to reject the partner.");
                   }
                 }}
                 className="px-8 py-4 rounded-2xl border-2 border-red-100 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all"
               >Reject Partner</button>
               <button 
                 onClick={() => {
                   const requiredDocs = getRequiredDocsForUser(user.role, user.documents, user.vendorType);
                   const allApproved = requiredDocs.every(id => user.documents?.[id]?.status === 'approved' || user.documents?.[id]?.status === 'exception_approved');
                   
                   if (user.role === 'vendor' && !allApproved) {
                     toast.error("Cannot activate vendor: All required documents must be individually approved first. Go to the Compliance tab to verify them.");
                     return;
                   }
                   onStatusUpdate?.(user._id, 'active');
                 }}
                 className="px-10 py-4 bg-secondary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-secondary/20 hover:scale-105 transition-all"
               >Approve & Activate</button>
             </>
           ) : (
             <>
               <button 
                 onClick={() => {
                   const reason = prompt("Please provide a reason for suspending this partner:");
                   if (reason !== null && reason.trim() !== "") {
                     onStatusUpdate?.(user._id, 'suspended', reason);
                   } else if (reason !== null) {
                     toast.error("A reason is required to suspend the partner.");
                   }
                 }}
                 className="px-8 py-4 rounded-2xl border-2 border-amber-100 text-amber-600 font-black text-[10px] uppercase tracking-widest hover:bg-amber-50 transition-all"
               >Suspend Partner</button>
               <button 
                 onClick={onClose}
                 className="px-10 py-4 bg-secondary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-secondary/20 hover:scale-105 transition-all"
               >Close Record</button>
             </>
           )}
        </div>
      </div>
    </div>
  );
}
