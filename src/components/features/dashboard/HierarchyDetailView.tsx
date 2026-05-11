'use client';

import React from 'react';
import { 
  User, ShieldCheck, MapPin, Phone, Mail, 
  Users, Briefcase, Sparkles, Target, 
  FileText, CreditCard, PieChart, Activity,
  ChevronRight, Link2, ExternalLink, Calendar,
  CheckCircle2, Clock, AlertCircle, X
} from 'lucide-react';
import { motion } from 'framer-motion';

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
  onStatusUpdate?: (id: string, status: string) => void;
}

export default function HierarchyDetailView({ data, onClose, onStatusUpdate }: HierarchyDetailViewProps) {
  const { user, counts, hierarchy } = data;
  const [activeTab, setActiveTab] = React.useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: PieChart },
    { id: 'network', label: 'Network', icon: Users },
    { id: 'ops', label: 'Operations', icon: Target },
    { id: 'docs', label: 'Compliance', icon: ShieldCheck },
  ];

  const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-soft flex items-center gap-4 hover:border-primary/20 transition-all group">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center transition-transform group-hover:scale-110`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-xl font-black text-secondary mt-0.5">{value}</p>
      </div>
    </div>
  );

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
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-[40px] bg-white text-secondary flex items-center justify-center text-4xl md:text-6xl font-black shadow-2xl border-4 border-white/20">
            {user.fullName?.[0] || 'U'}
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
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-2xl text-xs font-bold border border-white/10">
                <MapPin size={14} className="text-primary-light" />
                <span>{user.district}, {user.state}</span>
              </div>
              {user.parentVendorId && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-2xl text-xs font-bold border border-white/10">
                  <Link2 size={14} className="text-primary-light" />
                  <span>Parent: {user.parentVendorId.fullName}</span>
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
                      { label: 'WhatsApp', value: user.whatsapp || 'N/A', icon: Phone },
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

                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <ShieldCheck size={14} /> Document Status
                  </h4>
                  <div className="space-y-4">
                     {[
                       { label: 'KYC Documents', status: 'verified', icon: CheckCircle2, color: 'text-green-500' },
                       { label: 'Partnership Agreement', status: 'signed', icon: CheckCircle2, color: 'text-green-500' },
                       { label: 'Bank Details', status: 'verified', icon: CheckCircle2, color: 'text-green-500' },
                       { label: 'Security Deposit', status: 'pending', icon: Clock, color: 'text-amber-500' }
                     ].map((doc, idx) => (
                       <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                         <span className="text-xs font-bold text-gray-500">{doc.label}</span>
                         <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${doc.color}`}>
                           <doc.icon size={14} /> {doc.status}
                         </div>
                       </div>
                     ))}
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
                         <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center font-black text-lg">S</div>
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
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {['ID Proof', 'Organization Photo', 'KYC Document', 'Agreement Copy'].map((doc, idx) => (
                  <div key={idx} className="p-8 bg-white border border-gray-100 rounded-[32px] shadow-sm group hover:border-primary transition-all">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <FileText size={24} />
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Verified</span>
                    </div>
                    <h5 className="font-black text-secondary text-lg mb-1">{doc}</h5>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">Uploaded on Oct 12, 2026</p>
                    <button className="w-full py-3 bg-gray-50 text-secondary font-black text-[10px] uppercase tracking-widest rounded-xl border border-gray-100 group-hover:bg-secondary group-hover:text-white transition-all">View Document</button>
                  </div>
                ))}
             </div>
          </motion.div>
        )}
      </div>

      {/* Footer / Approval Actions */}
      <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 mt-auto shrink-0">
        <div className="flex items-center gap-4">
           <Activity size={20} className="text-primary animate-pulse" />
           <div>
             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Network Health</p>
             <p className="font-bold text-secondary text-sm">Operational & Active</p>
           </div>
        </div>

        <div className="flex gap-4">
           {user.status === 'pending' ? (
             <>
               <button 
                 onClick={() => onStatusUpdate?.(user._id, 'rejected')}
                 className="px-8 py-4 rounded-2xl border-2 border-red-100 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all"
               >Reject Partner</button>
               <button 
                 onClick={() => onStatusUpdate?.(user._id, 'active')}
                 className="px-10 py-4 bg-secondary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-secondary/20 hover:scale-105 transition-all"
               >Approve Partner</button>
             </>
           ) : (
             <button 
               onClick={onClose}
               className="px-10 py-4 bg-secondary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-secondary/20 hover:scale-105 transition-all"
             >Close Record</button>
           )}
        </div>
      </div>
    </div>
  );
}
