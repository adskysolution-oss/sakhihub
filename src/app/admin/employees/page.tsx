'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { 
  UserCircle, MapPin, TrendingUp, Search, Plus, 
  Edit2, Trash2, ShieldCheck, ShieldAlert,
  Phone, Mail, Calendar, Filter, X,
  Briefcase, Network, Link2, ExternalLink,
  CheckCircle2, Clock, AlertCircle, FileText,
  Landmark, UserCheck, FileCheck, RefreshCw
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import RegisterPartnerModal from "@/components/features/dashboard/RegisterPartnerModal";
import DocumentReviewCard from "@/components/features/dashboard/DocumentReviewCard";
import { REQUIRED_DOCS_BY_ROLE, getDocComplianceSummary, getRequiredDocsForUser, getDocumentViewUrl } from "@/utils/documents";
import { toast } from 'sonner';
import { getProxiedImageUrl } from '@/utils/imageUrl';

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [customDate, setCustomDate] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  
  // Assignment State
  const [allPartners, setAllPartners] = useState<any[]>([]);
  const [assignTarget, setAssignTarget] = useState<any>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  // Appointment Letter State
  const [joiningDate, setJoiningDate] = useState('');
  const [salary, setSalary] = useState('');
  const [isGeneratingAppt, setIsGeneratingAppt] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [signedDocRemarks, setSignedDocRemarks] = useState('');
  const [signedDocActionLoading, setSignedDocActionLoading] = useState<string | null>(null);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/employees?status=${status}&search=${search}&dateRange=${dateFilter}&paymentStatus=${paymentFilter}&customDate=${customDate}`);
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
  }, [search, status, dateFilter, paymentFilter, customDate]);

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
      toast.error("Failed to update assignment");
    } finally {
      setIsAssigning(false);
    }
  };

  const generateOfferLetter = async () => {
    if (!joiningDate || !salary) {
      toast.error("Please enter both Joining Date and Salary.");
      return;
    }
    setIsGeneratingAppt(true);
    try {
      const res = await axios.post(`/api/admin/users/${selectedEmp._id}/offer-letter`, {
        joiningDate,
        salary
      });
      if (res.data.success) {
        setSelectedEmp(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to generate offer letter");
    } finally {
      setIsGeneratingAppt(false);
    }
  };

  const updateDocumentLock = async (
    empId: string,
    docId: string,
    isLocked: boolean,
    isApproved: boolean,
    adminRemarks?: string,
    newStatus?: string
  ) => {
    try {
      const res = await axios.post(`/api/admin/users/${empId}/documents/${docId}/lock`, {
        isLocked,
        isApproved,
        adminRemarks,
        newStatus
      });
      if (res.data.success && selectedEmp) {
        // Refresh employee data to reflect the updated document status
        setSelectedEmp((prev: any) => ({
          ...prev,
          offerLetterDetails: {
            ...prev.offerLetterDetails,
            ...res.data.data.document
          }
        }));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update document status');
    }
  };

  const compliance = selectedEmp ? getDocComplianceSummary(selectedEmp.documents, 'employee', undefined, selectedEmp.designation) : null;

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
            <div className="flex gap-2">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="custom">Custom Date</option>
              </select>
              
              {dateFilter === 'custom' && (
                <input 
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              )}
              
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
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
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Status</th>
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
                     const empComp = getDocComplianceSummary(emp.documents, 'employee', undefined, emp.designation);
                     return (
                      <tr key={emp._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer group">
                        <td className="p-5" onClick={() => setSelectedEmp(emp)}>
                          <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-xl shadow-lg overflow-hidden">
                              {emp.profileImage ? (
                                <img src={getProxiedImageUrl(emp.profileImage)} alt={emp.fullName} className="w-full h-full object-cover" />
                              ) : (
                                emp.fullName[0]
                              )}
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
                          {emp.paymentCompleted ? (
                            <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-600">
                              Paid
                            </span>
                          ) : emp.subscriptionPaid ? (
                            <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-600">
                              Sub Paid
                            </span>
                          ) : (
                            <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-600">
                              Unpaid
                            </span>
                          )}
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
                onClick={() => { setSelectedEmp(null); setActiveTab('overview'); }}
                className="absolute inset-0 bg-secondary/40 backdrop-blur-sm" 
              />
              <motion.div 
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                className="relative bg-white w-full max-w-4xl h-full shadow-2xl flex flex-col"
              >
                {/* Header */}
                <div className="bg-secondary-dark p-10 text-white relative shrink-0">
                  <button 
                    onClick={() => { setSelectedEmp(null); setActiveTab('overview'); }}
                    className="absolute right-8 top-8 w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all"
                  ><X size={24} /></button>
                  
                  <div className="flex gap-8 items-center">
                    <div className="w-24 h-24 rounded-[32px] bg-white text-secondary-dark flex items-center justify-center text-4xl font-black shadow-2xl shadow-black/20 overflow-hidden">
                      {selectedEmp.profileImage ? (
                        <img src={getProxiedImageUrl(selectedEmp.profileImage)} alt={selectedEmp.fullName} className="w-full h-full object-cover" />
                      ) : (
                        selectedEmp.fullName[0]
                      )}
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

                  <div className="flex gap-2 mt-8 bg-white/5 p-1.5 rounded-[24px] border border-white/10 w-fit">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-white text-secondary shadow-xl' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                    >
                      Overview & Compliance
                    </button>
                    <button
                      onClick={() => setActiveTab('agreement')}
                      className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'agreement' ? 'bg-white text-secondary shadow-xl' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                    >
                      Agreement
                    </button>
                  </div>
                </div>

                {/* Tabs / Content Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-10">
                  {activeTab === 'overview' && (
                    <>
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
                         <div className="grid grid-cols-3 gap-4 bg-gray-50 p-6 rounded-3xl border border-gray-100 h-full">
                            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                               <ShieldCheck size={20} className={selectedEmp.isVerified ? 'text-green-500' : 'text-gray-200'} />
                               <p className="text-[9px] font-black uppercase mt-2 text-gray-400">Verified</p>
                               <p className="font-black text-secondary text-[11px]">{selectedEmp.isVerified ? 'YES' : 'NO'}</p>
                            </div>
                            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                               <Network size={20} className={selectedEmp.dashboardAccess ? 'text-primary' : 'text-gray-200'} />
                               <p className="text-[9px] font-black uppercase mt-2 text-gray-400">Dashboard</p>
                               <p className="font-black text-secondary text-[11px]">{selectedEmp.dashboardAccess ? 'ENABLED' : 'BLOCKED'}</p>
                            </div>
                            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                               <span className={`text-[10px] font-black leading-none ${selectedEmp.paymentCompleted ? 'text-green-500' : selectedEmp.subscriptionPaid ? 'text-amber-500' : 'text-red-500'}`}>
                                 {selectedEmp.paymentCompleted ? 'PAID' : selectedEmp.subscriptionPaid ? 'SUB PAID' : 'UNPAID'}
                               </span>
                               <p className="text-[9px] font-black uppercase mt-2 text-gray-400">Payment</p>
                               <p className="font-black text-secondary text-[10px]">{selectedEmp.paymentCompleted || selectedEmp.subscriptionPaid ? 'COMPLETED' : 'PENDING'}</p>
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
                                  {selectedEmp.aadhaarNumber ? selectedEmp.aadhaarNumber.replace(/(\d{4})/g, '$1 ').trim() : 'Not Provided'}
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
                                  {selectedEmp.panNumber || 'Not Provided'}
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
                                <p className="font-black text-secondary text-xs truncate">{selectedEmp.bankDetails?.bankName || 'Not Provided'}</p>
                              </div>
                            </div>
                            {selectedEmp.bankDetails?.accountNumber ? (
                              <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className="min-w-0">
                                  <p className="text-[8px] font-black text-gray-400 uppercase">Account Holder</p>
                                  <p className="font-bold text-secondary truncate mt-0.5">{selectedEmp.bankDetails?.accountHolderName || 'N/A'}</p>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[8px] font-black text-gray-400 uppercase">Account Number</p>
                                  <p className="font-mono font-bold text-secondary truncate mt-0.5">{selectedEmp.bankDetails?.accountNumber}</p>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[8px] font-black text-gray-400 uppercase">IFSC Code</p>
                                  <p className="font-mono font-bold text-secondary truncate mt-0.5">{selectedEmp.bankDetails?.ifscCode || 'N/A'}</p>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[8px] font-black text-gray-400 uppercase">Branch</p>
                                  <p className="font-bold text-secondary truncate mt-0.5">{selectedEmp.bankDetails?.branchName || 'N/A'}</p>
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
                        {getRequiredDocsForUser('employee', selectedEmp.documents, undefined, selectedEmp.designation).map(type => (
                          <DocumentReviewCard 
                            key={type}
                            type={type}
                            docInfo={selectedEmp.documents?.[type]}
                            onStatusUpdate={(t, s, r) => handleStatusUpdate(selectedEmp._id, `doc:${t}:${s}`, r)}
                          />
                        ))}
                      </div>
                   </section>
                    </>
                  )}

                  {activeTab === 'agreement' && (
                    <div className="max-w-2xl mx-auto space-y-8 py-8">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl mx-auto flex items-center justify-center mb-4">
                          <FileText size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-secondary tracking-tight">Employee Offer Letter</h3>
                        <p className="text-sm text-gray-500 font-bold mt-2">
                          Generate the official offer letter for this employee.
                        </p>
                      </div>

                      {selectedEmp.offerLetterDetails ? (
                        <>
                        <div className="bg-green-50 border border-green-200 rounded-[32px] p-8 text-center relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/50 rounded-full blur-2xl -mr-16 -mt-16" />
                          <div className="relative z-10">
                            <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
                            <h4 className="text-xl font-black text-green-800">Employee Offer Letter Generated Successfully</h4>
                            <p className="text-sm text-green-700 font-bold mt-2 mb-6">
                              Offer Letter ID: <span className="font-mono bg-white px-2 py-1 rounded">{selectedEmp.offerLetterDetails.offerLetterId}</span>
                            </p>
                            <a 
                              href={`/employee-offer-letter/${selectedEmp._id}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
                            >
                              <ExternalLink size={16} /> Preview & Print Letter
                            </a>
                          </div>
                        </div>

                        {/* Signed Document Review Panel */}
                        {(() => {
                          const ol = selectedEmp.offerLetterDetails;
                          const docStatus = ol.status || 'generated';
                          const isDocLocked = ol.isLocked;

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
                            <div className="bg-white border border-gray-100 shadow-soft rounded-[32px] p-8 space-y-6">
                              {/* Header */}
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h4 className="text-lg font-black text-secondary">
                                    Offer Letter — Signed Copy Review
                                  </h4>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                    ID: {ol.offerLetterId}
                                  </p>
                                </div>
                                <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shrink-0 ${meta.cls}`}>
                                  {meta.label}
                                </span>
                              </div>

                              {/* Signed copy actions / preview */}
                              {ol.uploadedDocumentUrl ? (
                                <div className="space-y-4">
                                  <div className="flex flex-col sm:flex-row gap-3">
                                    <a
                                      href={getDocumentViewUrl(ol.uploadedDocumentUrl)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-secondary border border-gray-200 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-colors"
                                    >
                                      <ExternalLink size={14} /> View Signed Document
                                    </a>
                                    {!isDocLocked && (
                                      <a
                                        href={`/employee-offer-letter/${selectedEmp._id}`}
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
                                        placeholder="Enter remarks for the employee..."
                                        rows={2}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold placeholder:text-gray-300 focus:outline-none focus:border-primary resize-none"
                                      />
                                    </div>
                                  )}

                                  {/* Display previously saved remarks */}
                                  {ol.adminRemarks && (docStatus === 'rejected' || docStatus === 'reupload_required') && (
                                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-3">
                                      <AlertCircle size={16} className="text-orange-500 shrink-0 mt-0.5" />
                                      <div>
                                        <p className="text-[9px] font-black text-orange-700 uppercase tracking-widest mb-1">Previous Remarks</p>
                                        <p className="text-xs font-bold text-orange-800">{ol.adminRemarks}</p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Action Buttons */}
                                  <div className="flex flex-col sm:flex-row gap-2">
                                    {isDocLocked ? (
                                      <button
                                        onClick={async () => {
                                          setSignedDocActionLoading('unlock');
                                          await updateDocumentLock(selectedEmp._id, ol._id, false, false, undefined, 'uploaded');
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
                                            await updateDocumentLock(selectedEmp._id, ol._id, true, true, signedDocRemarks || undefined, 'approved');
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
                                            await updateDocumentLock(selectedEmp._id, ol._id, false, false, signedDocRemarks, 'reupload_required');
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
                                            await updateDocumentLock(selectedEmp._id, ol._id, false, false, signedDocRemarks, 'rejected');
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
                                    The employee must download, sign, and upload the document from their dashboard.
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                        </>
                      ) : (
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
                            <div>
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Fixed Remuneration (Salary)</label>
                              <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                <input 
                                  type="number" 
                                  value={salary}
                                  onChange={(e) => setSalary(e.target.value)}
                                  placeholder="e.g. 15000"
                                  className="w-full pl-10 pr-5 py-3 rounded-2xl bg-white border border-gray-200 font-bold text-secondary focus:outline-none focus:border-primary"
                                />
                              </div>
                            </div>
                            <div className="flex gap-4">
                                  <button
                                    onClick={generateOfferLetter}
                                    disabled={isGeneratingAppt}
                                    className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50"
                                  >
                                    {isGeneratingAppt ? 'Generating...' : 'Generate Offer Letter'}
                                  </button>
                                </div>
                            <p className="text-[10px] text-gray-400 font-bold text-center uppercase tracking-widest">
                              * Other details will be auto-filled from the employee profile.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between items-center shrink-0">
                   <div className="flex gap-4">
                      {['pending', 'rejected', 'suspended'].includes(selectedEmp.status) ? (
                        <button 
                          onClick={() => handleStatusUpdate(selectedEmp._id, 'active')}
                          className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                        >{selectedEmp.status === 'suspended' ? 'Re-activate Employee' : 'Approve & Activate'}</button>
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
                   {assignTarget.parentVendorId && (
                      <div className="mb-6 p-6 bg-primary/5 border border-primary/20 rounded-3xl flex justify-between items-center relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                         <div className="relative z-10">
                            <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-1 flex items-center gap-1"><CheckCircle2 size={12} /> Currently Assigned Parent</p>
                            {(() => {
                               const currentParent = allPartners.find(p => p._id === assignTarget.parentVendorId);
                               if (currentParent) {
                                 return (
                                   <>
                                     <h5 className="text-xl font-black text-secondary mt-1">{currentParent.fullName}</h5>
                                     <p className="text-xs text-gray-500 font-bold mt-1 uppercase">
                                       {currentParent.role.replace('_', ' ')} • {currentParent.vendorCode || currentParent.subVendorCode} • {currentParent.mobile}
                                     </p>
                                   </>
                                 );
                               }
                               return <p className="text-sm font-bold text-gray-500 mt-1">ID: {assignTarget.parentVendorId}</p>;
                            })()}
                         </div>
                      </div>
                   )}
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
