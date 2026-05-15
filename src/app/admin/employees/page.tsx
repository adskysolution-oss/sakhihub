'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { 
  UserCircle, MapPin, TrendingUp, Search, Plus, 
  Edit2, Trash2, ShieldCheck, ShieldAlert,
  Phone, Mail, Calendar, Filter, X,
  Briefcase, Network, Link2, ExternalLink,
  CheckCircle2, Clock, AlertCircle, FileText
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import RegisterPartnerModal from "@/components/features/dashboard/RegisterPartnerModal";
import DocumentReviewCard from "@/components/features/dashboard/DocumentReviewCard";
import { REQUIRED_DOCS_BY_ROLE, getDocComplianceSummary } from "@/utils/documents";

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  
  // Assignment State
  const [allPartners, setAllPartners] = useState<any[]>([]);
  const [assignTarget, setAssignTarget] = useState<any>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/employees?status=${status}&search=${search}`);
      if (res.data.success) setEmployees(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      const res = await axios.get('/api/admin/partners/list');
      if (res.data.success) setAllPartners(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, status]);

  const handleStatusUpdate = async (id: string, newStatus: string, remarks?: string) => {
    try {
      const res = await axios.patch(`/api/admin/employees/${id}/status`, { 
        status: newStatus,
        remarks 
      });
      if (res.data.success) {
        if (newStatus.startsWith('doc:')) {
           // Refresh the selected employee's data to reflect document changes
           const freshRes = await axios.get(`/api/admin/employees?search=${selectedEmp.mobile}`);
           if (freshRes.data.success && freshRes.data.data.length > 0) {
             setSelectedEmp(freshRes.data.data[0]);
           }
        } else {
           fetchEmployees();
           setSelectedEmp(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignPartner = async (partnerId: string | null) => {
    if (!assignTarget) return;
    setIsAssigning(true);
    try {
      const res = await axios.patch(`/api/admin/users/${assignTarget._id}/assign`, { 
        parentVendorId: partnerId 
      });
      if (res.data.success) {
        fetchEmployees();
        setAssignTarget(null);
        if (selectedEmp?._id === assignTarget._id) {
           setSelectedEmp(res.data.data);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update assignment");
    } finally {
      setIsAssigning(false);
    }
  };

  const compliance = selectedEmp ? getDocComplianceSummary(selectedEmp.documents, 'employee') : null;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-start flex-wrap gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-secondary">Employee Force</h1>
            <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">Verify credentials and manage regional field staff hierarchy.</p>
          </div>
          <button 
            onClick={() => setShowRegisterModal(true)}
            className="btn-primary py-4 px-8"
          >
            <Plus size={20} /> Add New Employee
          </button>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft">
          <div className="flex gap-4 mb-8 flex-wrap">
            <div className="relative flex-1 min-w-[300px]">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, ID, mobile..." 
                className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
            <div className="flex gap-2 bg-gray-50 p-1.5 rounded-2xl">
               {['all', 'pending', 'active', 'rejected'].map((s) => (
                 <button 
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${status === s ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                   {s}
                 </button>
               ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr className="text-left border-b-2 border-gray-50">
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee Profile</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Parent Network</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Compliance</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                   <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-bold italic">Syncing field records...</td></tr>
                ) : employees.length === 0 ? (
                   <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-bold italic">No employees found.</td></tr>
                ) : (
                   employees.map((emp) => {
                     const empComp = getDocComplianceSummary(emp.documents, 'employee');
                     return (
                      <tr key={emp._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer group">
                        <td className="p-5" onClick={() => setSelectedEmp(emp)}>
                          <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-xl shadow-lg">
                              {emp.fullName[0]}
                            </div>
                            <div>
                              <p className="font-black text-secondary leading-tight">{emp.fullName}</p>
                              <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">{emp.mobile}</p>
                            </div>
                          </div>
                        </td>
                         <td className="p-5">
                           {emp.parentVendorId ? (
                             <div className="flex flex-col gap-1 group/link">
                               <span className="font-black text-secondary text-xs">Assigned</span>
                               <button 
                                 onClick={(e) => { e.stopPropagation(); setAssignTarget(emp); }}
                                 className="text-[10px] text-primary font-bold uppercase tracking-widest flex items-center gap-1 hover:underline"
                               >
                                 <Network size={10} /> Network Active <Edit2 size={10} className="ml-1 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                               </button>
                             </div>
                           ) : (
                             <button 
                               onClick={(e) => { e.stopPropagation(); setAssignTarget(emp); }}
                               className="px-4 py-2 rounded-xl bg-amber-50 text-amber-600 font-black text-[9px] uppercase tracking-widest hover:bg-amber-100 transition-all flex items-center gap-2"
                             >
                               <Link2 size={12} /> Assign Parent
                             </button>
                           )}
                         </td>
                        <td className="p-5">
                          <div className="flex items-center gap-2">
                             <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                               <div 
                                 className="h-full bg-primary" 
                                 style={{ width: `${(empComp.approved / empComp.total) * 100}%` }}
                               />
                             </div>
                             <span className="text-[10px] font-black text-secondary">{empComp.approved}/{empComp.total}</span>
                          </div>
                        </td>
                        <td className="p-5">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${emp.status === 'active' ? 'bg-green-100 text-green-600' : emp.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                            {emp.status}
                          </span>
                        </td>
                        <td className="p-5">
                          <button 
                            onClick={() => setSelectedEmp(emp)}
                            className="px-5 py-2.5 rounded-xl border border-gray-100 bg-white text-secondary font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all"
                          >Review & Manage</button>
                        </td>
                      </tr>
                    );
                   })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Employee Detail Slide-over/Modal */}
        <AnimatePresence>
          {selectedEmp && (
            <div className="fixed inset-0 z-[100] flex items-center justify-end">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedEmp(null)}
                className="absolute inset-0 bg-secondary/40 backdrop-blur-sm" 
              />
              <motion.div 
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                className="relative bg-white w-full max-w-4xl h-full shadow-2xl flex flex-col"
              >
                {/* Header */}
                <div className="bg-secondary-dark p-10 text-white relative shrink-0">
                  <button 
                    onClick={() => setSelectedEmp(null)}
                    className="absolute right-8 top-8 w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all"
                  ><X size={24} /></button>
                  
                  <div className="flex gap-8 items-center">
                    <div className="w-24 h-24 rounded-[32px] bg-white text-secondary-dark flex items-center justify-center text-4xl font-black shadow-2xl shadow-black/20">
                      {selectedEmp.fullName[0]}
                    </div>
                    <div>
                      <h2 className="text-4xl font-black mb-2">{selectedEmp.fullName}</h2>
                      <div className="flex flex-wrap gap-4 items-center">
                        <span className="px-4 py-1.5 bg-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Employee Profile</span>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${selectedEmp.status === 'active' ? 'border-green-500 text-green-500' : 'border-amber-500 text-amber-500'}`}>
                          {selectedEmp.status}
                        </span>
                        <div className="h-4 w-px bg-white/20" />
                        <p className="flex items-center gap-2 text-white/60 font-bold text-sm">
                          <Phone size={14} className="text-primary" /> {selectedEmp.mobile}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs / Content Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-10">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
                      <div className="space-y-6">
                         <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-l-4 border-primary pl-4">Personal & Network Details</h4>
                         <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                            <div>
                               <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Email Address</p>
                               <p className="font-bold text-secondary text-sm">{selectedEmp.email || 'Not provided'}</p>
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Designation</p>
                               <p className="font-bold text-secondary text-sm">{selectedEmp.designation || 'Field Staff'}</p>
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Assigned Vendor</p>
                               <p className="font-black text-primary text-sm">{selectedEmp.parentVendorId ? 'Network Linked' : 'Unassigned'}</p>
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Joined Date</p>
                               <p className="font-bold text-secondary text-sm">{new Date(selectedEmp.createdAt).toLocaleDateString()}</p>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-6">
                         <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-l-4 border-amber-500 pl-4">Operational Status</h4>
                         <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-3xl border border-gray-100 h-full">
                            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                               <ShieldCheck size={24} className={selectedEmp.isVerified ? 'text-green-500' : 'text-gray-200'} />
                               <p className="text-[9px] font-black uppercase mt-2 text-gray-400">Verified</p>
                               <p className="font-black text-secondary text-xs">{selectedEmp.isVerified ? 'YES' : 'NO'}</p>
                            </div>
                            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                               <Network size={24} className={selectedEmp.dashboardAccess ? 'text-primary' : 'text-gray-200'} />
                               <p className="text-[9px] font-black uppercase mt-2 text-gray-400">Dashboard</p>
                               <p className="font-black text-secondary text-xs">{selectedEmp.dashboardAccess ? 'ENABLED' : 'BLOCKED'}</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Document Verification Section */}
                   <section className="space-y-8">
                      <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                        <div>
                          <h4 className="text-xl font-black text-secondary">Compliance Documents</h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Review employee KYC and bank credentials</p>
                        </div>
                        <div className="text-right">
                           <p className="text-2xl font-black text-primary">{compliance?.approved}/{compliance?.total}</p>
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Verified</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        {REQUIRED_DOCS_BY_ROLE.employee.map(type => (
                          <DocumentReviewCard 
                            key={type}
                            type={type}
                            docInfo={selectedEmp.documents?.[type]}
                            onStatusUpdate={(t, s, r) => handleStatusUpdate(selectedEmp._id, `doc:${t}:${s}`, r)}
                          />
                        ))}
                      </div>
                   </section>
                </div>

                {/* Footer Actions */}
                <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between items-center shrink-0">
                   <div className="flex gap-4">
                      {selectedEmp.status === 'pending' || selectedEmp.status === 'rejected' ? (
                        <button 
                          onClick={() => handleStatusUpdate(selectedEmp._id, 'active')}
                          className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                        >Approve & Activate</button>
                      ) : (
                        <button 
                          onClick={() => handleStatusUpdate(selectedEmp._id, 'suspended')}
                          className="px-8 py-4 bg-red-50 text-red-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-red-100 transition-all"
                        >Suspend Employee</button>
                      )}
                      
                      {selectedEmp.parentVendorId ? (
                        <button 
                          onClick={() => setAssignTarget(selectedEmp)}
                          className="px-8 py-4 bg-amber-50 text-amber-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-amber-100 transition-all flex items-center gap-2"
                        ><Edit2 size={16} /> Change Parent</button>
                      ) : (
                        <button 
                          onClick={() => setAssignTarget(selectedEmp)}
                          className="px-8 py-4 bg-secondary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-secondary/20 hover:scale-105 transition-all flex items-center gap-2"
                        ><Link2 size={16} /> Assign to Network</button>
                      )}
                   </div>
                   <button 
                    onClick={() => setSelectedEmp(null)}
                    className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-secondary transition-all"
                   >Close Details</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Assignment Modal */}
        <AnimatePresence>
          {assignTarget && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setAssignTarget(null)}
                className="absolute inset-0 bg-secondary/60 backdrop-blur-md" 
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
              >
                 <div className="bg-primary p-8 text-white flex justify-between items-center">
                    <div>
                       <h3 className="text-2xl font-black italic">Network Hierarchy Mapping</h3>
                       <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-1">Select a Vendor or Sub-Vendor for {assignTarget.fullName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                       {assignTarget.parentVendorId && (
                         <button 
                           onClick={() => {
                             if(confirm("Are you sure you want to remove the current assignment?")) {
                               handleAssignPartner(null);
                             }
                           }}
                           className="px-4 py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all flex items-center gap-2"
                         >
                           <Trash2 size={14} /> Unlink Current
                         </button>
                       )}
                       <button onClick={() => setAssignTarget(null)} className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30"><X size={20} /></button>
                    </div>
                 </div>

                <div className="p-8 overflow-y-auto">
                   <div className="grid grid-cols-1 gap-4">
                      {allPartners.map(partner => (
                        <button
                          key={partner._id}
                          onClick={() => handleAssignPartner(partner._id)}
                          disabled={isAssigning}
                          className="p-6 bg-gray-50 border border-gray-100 rounded-3xl text-left hover:border-primary hover:bg-white hover:shadow-xl hover:scale-[1.02] transition-all group flex justify-between items-center"
                        >
                           <div>
                              <div className="flex items-center gap-3">
                                 <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${partner.role === 'vendor' ? 'bg-indigo-100 text-indigo-600' : 'bg-primary/10 text-primary'}`}>
                                    {partner.role.replace('_', ' ')}
                                 </div>
                                 <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{partner.vendorCode || partner.subVendorCode}</span>
                              </div>
                              <h5 className="text-lg font-black text-secondary mt-1 group-hover:text-primary transition-colors">{partner.fullName}</h5>
                              <p className="text-xs text-gray-400 font-bold mt-1">{partner.mobile}</p>
                           </div>
                           <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-gray-300 group-hover:border-primary group-hover:text-primary group-hover:bg-primary/5">
                              <Plus size={20} />
                           </div>
                        </button>
                      ))}
                   </div>
                </div>

                <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-center">
                   <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Only active partners are shown for mapping</p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <RegisterPartnerModal 
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onSuccess={() => fetchEmployees()}
          role="employee"
        />
      </div>
    </DashboardLayout>
  );
}
