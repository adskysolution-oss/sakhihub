'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { 
  UserCircle, MapPin, Search, Plus, 
  ShieldCheck, ShieldAlert, Phone, Mail, Calendar, 
  Filter, X, Briefcase, CheckCircle2, Clock, 
  AlertCircle, FileText, UserCheck, RefreshCw, ChevronRight, Save,
  Upload, FileCheck, FileX
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import DocumentReviewCard from "@/components/features/dashboard/DocumentReviewCard";
import { getDocComplianceSummary, getRequiredDocsForUser } from "@/utils/documents";
import { toast } from 'sonner';
import UnifiedFilterBar from "@/components/shared/filters/UnifiedFilterBar";
import StatusFilterTabs from "@/components/shared/filters/StatusFilterTabs";
import PaginationControls from "@/components/shared/filters/PaginationControls";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/context/LanguageContext";

const MAJOR_STATES = [
  'Andhra Pradesh',
  'Bihar',
  'Delhi',
  'Gujarat',
  'Haryana',
  'Karnataka',
  'Madhya Pradesh',
  'Maharashtra',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Uttar Pradesh'
];

export default function StaffManagement() {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [customDate, setCustomDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [counts, setCounts] = useState<any>({
    status: { all: 0, pending: 0, documents_uploaded: 0, under_review: 0, reupload_required: 0, active: 0, approved: 0, rejected: 0 },
    payment: { all: 0, paid: 0, unpaid: 0 }
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Permission Assign States
  const [allPermissions, setAllPermissions] = useState<any[]>([]);
  const [selectedPermKeys, setSelectedPermKeys] = useState<string[]>([]);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  // Territory Assign States
  const [assignedScope, setAssignedScope] = useState<string>('all');
  const [assignedStates, setAssignedStates] = useState<string[]>([]);
  const [assignedDistricts, setAssignedDistricts] = useState<string[]>([]);
  const [assignedBlocks, setAssignedBlocks] = useState<string[]>([]);
  const [savingTerritory, setSavingTerritory] = useState(false);
  const [customState, setCustomState] = useState('');
  const [customDistrict, setCustomDistrict] = useState('');
  const [customBlock, setCustomBlock] = useState('');

  const handleAddState = (stateName: string) => {
    const formatted = stateName.trim();
    if (!formatted) return;
    if (assignedStates.includes(formatted)) {
      toast.error('State already added');
      return;
    }
    setAssignedStates([...assignedStates, formatted]);
  };

  const handleRemoveState = (stateName: string) => {
    setAssignedStates(assignedStates.filter(s => s !== stateName));
  };

  const handleAddDistrict = () => {
    const formatted = customDistrict.trim();
    if (!formatted) return;
    if (assignedDistricts.includes(formatted)) {
      toast.error('District already added');
      return;
    }
    setAssignedDistricts([...assignedDistricts, formatted]);
    setCustomDistrict('');
  };

  const handleRemoveDistrict = (districtName: string) => {
    setAssignedDistricts(assignedDistricts.filter(d => d !== districtName));
  };

  const handleAddBlock = () => {
    const formatted = customBlock.trim();
    if (!formatted) return;
    if (assignedBlocks.includes(formatted)) {
      toast.error('Block already added');
      return;
    }
    setAssignedBlocks([...assignedBlocks, formatted]);
    setCustomBlock('');
  };

  const handleRemoveBlock = (blockName: string) => {
    setAssignedBlocks(assignedBlocks.filter(b => b !== blockName));
  };

  const handleSaveTerritory = async () => {
    if (!selectedStaff) return;
    setSavingTerritory(true);
    try {
      const res = await axios.post('/api/admin/assignments', {
        userId: selectedStaff._id,
        assignedScope,
        assignedStates,
        assignedDistricts,
        assignedBlocks,
        assignedRegions: []
      });
      if (res.data.success) {
        toast.success(`Territory assignments for ${selectedStaff.fullName} saved successfully`);
        setStaffList(staffList.map(s => s._id === selectedStaff._id ? { 
          ...s, 
          assignedScope,
          assignedStates,
          assignedDistricts,
          assignedBlocks
        } : s));
        setSelectedStaff({ 
          ...selectedStaff, 
          assignedScope,
          assignedStates,
          assignedDistricts,
          assignedBlocks
        });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save territory assignments');
    } finally {
      setSavingTerritory(false);
    }
  };

  const fetchStaff = async () => {
    setLoading(true);
    try {
      // Querying employees API route with role=staff filtering
      const res = await axios.get(`/api/admin/employees?role=staff&status=${status}&search=${search}&dateRange=${dateFilter}&customDate=${customDate}&startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`);
      if (res.data.success) {
        setStaffList(res.data.data);
        if (res.data.counts) {
          setCounts(res.data.counts);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load staff list");
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissionsList = async () => {
    setLoadingPermissions(true);
    try {
      const permsRes = await axios.get('/api/admin/permissions');
      if (permsRes.data.success) {
        setAllPermissions(permsRes.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPermissions(false);
    }
  };

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, status, dateFilter, customDate, startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStaff();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, status, dateFilter, customDate, startDate, endDate, page]);

  useEffect(() => {
    fetchPermissionsList();
  }, []);

  useEffect(() => {
    if (selectedStaff) {
      setSelectedPermKeys(selectedStaff.permissions || []);
      setAssignedScope(selectedStaff.assignedScope || 'all');
      setAssignedStates(selectedStaff.assignedStates || []);
      setAssignedDistricts(selectedStaff.assignedDistricts || []);
      setAssignedBlocks(selectedStaff.assignedBlocks || []);
      setActiveTab('overview');
    }
  }, [selectedStaff?._id]);

  const handleStatusUpdate = async (id: string, newStatus: string, remarks?: string) => {
    try {
      const res = await axios.patch(`/api/admin/employees/${id}/status`, { 
        status: newStatus,
        remarks 
      });
      if (res.data.success) {
        toast.success(`Account status updated successfully to ${newStatus}`);
        if (newStatus.startsWith('doc:')) {
           // Refresh the selected staff's data to reflect document updates
           const freshRes = await axios.get(`/api/admin/employees?role=staff&search=${selectedStaff.mobile}`);
           if (freshRes.data.success && freshRes.data.data.length > 0) {
             setSelectedStaff(freshRes.data.data[0]);
           }
        } else {
           fetchStaff();
           setSelectedStaff(null);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleTogglePermission = (key: string) => {
    if (selectedPermKeys.includes(key)) {
      setSelectedPermKeys(selectedPermKeys.filter(k => k !== key));
    } else {
      setSelectedPermKeys([...selectedPermKeys, key]);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedStaff) return;
    setSavingPermissions(true);
    try {
      const res = await axios.post('/api/admin/permissions', {
        userId: selectedStaff._id,
        permissions: selectedPermKeys
      });
      if (res.data.success) {
        toast.success(`Permissions for ${selectedStaff.fullName} saved successfully`);
        setStaffList(staffList.map(s => s._id === selectedStaff._id ? { ...s, permissions: selectedPermKeys } : s));
        setSelectedStaff({ ...selectedStaff, permissions: selectedPermKeys });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save permissions");
    } finally {
      setSavingPermissions(false);
    }
  };

  // Group permissions by module
  const groupedPermissions = allPermissions.reduce((acc: any, val: any) => {
    acc[val.module] = acc[val.module] || [];
    acc[val.module].push(val);
    return acc;
  }, {});

  const requiredDocs = selectedStaff ? getRequiredDocsForUser('staff', selectedStaff.documents, undefined, selectedStaff.designation) : [];
  const compliance = selectedStaff ? getDocComplianceSummary(selectedStaff.documents, 'staff', undefined, selectedStaff.designation) : null;
  const allDocsApproved = compliance ? compliance.approved === compliance.total : false;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-black text-secondary">{t('staff.title', 'Staff Management')}</h2>
            <p className="text-gray-400 font-bold mt-1">{t('staff.subtitle', 'Verify documents, assign portal permissions, and manage staff user status.')}</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft">
          <UnifiedFilterBar
            search={search} setSearch={setSearch} searchPlaceholder={t('staff.searchPlaceholder', 'Search by name, email, mobile...')}
            dateFilter={dateFilter} setDateFilter={setDateFilter}
            startDate={startDate} setStartDate={setStartDate}
            endDate={endDate} setEndDate={setEndDate}
          />
          <StatusFilterTabs status={status} setStatus={setStatus} counts={counts} />

          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr className="text-left border-b-2 border-gray-50">
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-[60px]">{t('staff.sNo', 'S.No.')}</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('staff.profile', 'Staff Profile')}</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('staff.designation', 'Designation')}</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('staff.compliance', 'Compliance')}</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('staff.permissions', 'Permissions')}</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('staff.status', 'Status')}</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('staff.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="p-20 text-center text-gray-400 font-bold italic">{t('staff.loading', 'Loading staff directory...')}</td></tr>
                ) : staffList.length === 0 ? (
                  <tr><td colSpan={7} className="p-20 text-center text-gray-400 font-bold italic">{t('staff.emptyState', 'No staff users found.')}</td></tr>
                ) : (
                  staffList.map((staff, index) => {
                    const staffComp = getDocComplianceSummary(staff.documents, 'staff', undefined, staff.designation);
                    return (
                      <tr key={staff._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer group" onClick={() => setSelectedStaff(staff)}>
                        <td className="p-5 text-xs font-bold text-gray-400">
                          {(page - 1) * limit + index + 1}
                        </td>
                        <td className="p-5">
                          <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-xl shadow-lg overflow-hidden shrink-0">
                              {staff.fullName[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-black text-secondary leading-tight">{staff.fullName}</p>
                              <p className="text-[10px] text-gray-400 font-bold mt-1">{staff.email || staff.mobile}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-5 text-xs font-black text-secondary">
                          {staff.designation || 'Staff'}
                        </td>
                        <td className="p-5">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                {Array.from({ length: Math.max(1, staffComp.total) }).map((_, i) => (
                                  <div key={i} className={`w-4 h-1.5 rounded-full ${
                                    i < staffComp.approved ? 'bg-green-500' :
                                    i < staffComp.uploaded ? 'bg-primary' :
                                    'bg-gray-200'
                                  }`} />
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
                              {staffComp.uploaded > 0 && (
                                <span className="text-primary flex items-center gap-1"><Upload size={10} /> {staffComp.uploaded}/{staffComp.total}</span>
                              )}
                              {staffComp.approved > 0 && (
                                <span className="text-green-600 flex items-center gap-1"><FileCheck size={10} /> {staffComp.approved}</span>
                              )}
                              {staffComp.rejected > 0 && (
                                <span className="text-red-500 flex items-center gap-1"><FileX size={10} /> {staffComp.rejected}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-5">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                            staff.permissions?.length > 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {staff.permissions?.length || 0} {t('staff.assigned', 'Permissions')}
                          </span>
                        </td>
                        <td className="p-5">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                            staff.status === 'active' ? 'bg-green-100 text-green-700' :
                            staff.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                            staff.status === 'under_review' ? 'bg-purple-100 text-purple-700' :
                            staff.status === 'suspended' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {staff.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-5">
                          <button className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-primary hover:bg-primary/5 transition-all group-hover:scale-105">
                            <ChevronRight size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <PaginationControls
            page={page} setPage={setPage}
            limit={limit} setLimit={setLimit}
            totalCount={counts.status[status] || 0}
          />
        </div>
      </div>

      {/* Details Slide Drawer */}
      <AnimatePresence>
        {selectedStaff && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedStaff(null)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-full md:w-[680px] bg-white z-50 shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-8 border-b border-gray-100 flex justify-between items-start bg-[#fafafa]">
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-2xl shadow-lg">
                    {selectedStaff.fullName[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-secondary leading-tight">{selectedStaff.fullName}</h3>
                    <p className="text-xs font-bold text-gray-400 mt-1">{selectedStaff.designation || 'Staff Member'}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-black/5 text-gray-500`}>
                        Role: {selectedStaff.role}
                      </span>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-black/5 text-gray-500`}>
                        Status: {selectedStaff.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedStaff(null)}
                  className="p-3 hover:bg-gray-100 text-gray-400 hover:text-secondary rounded-2xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Tab Headers */}
              <div className="flex border-b border-gray-100 px-8 bg-white shrink-0">
                {['overview', 'compliance', 'permissions', 'territory'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-6 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${
                      activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/50">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* General Profile Info */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-l-4 border-primary pl-3">
                        Contact Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <Phone size={14} className="text-primary" />
                          <div>
                            <p className="text-[9px] text-gray-400 uppercase tracking-wider">Mobile Number</p>
                            <p className="text-secondary mt-0.5">{selectedStaff.mobile}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <Mail size={14} className="text-primary" />
                          <div>
                            <p className="text-[9px] text-gray-400 uppercase tracking-wider">Email Address</p>
                            <p className="text-secondary mt-0.5">{selectedStaff.email || 'Not Provided'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-l-4 border-primary pl-3">
                        Work Location & Demographics
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <MapPin size={14} className="text-primary" />
                          <div>
                            <p className="text-[9px] text-gray-400 uppercase tracking-wider">State / District / Block</p>
                            <p className="text-secondary mt-0.5">
                              {selectedStaff.state}, {selectedStaff.district}, {selectedStaff.block}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <Calendar size={14} className="text-primary" />
                          <div>
                            <p className="text-[9px] text-gray-400 uppercase tracking-wider">Registered At</p>
                            <p className="text-secondary mt-0.5">
                              {new Date(selectedStaff.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'compliance' && (
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-l-4 border-primary pl-3">
                          Document Checklist ({compliance?.approved}/{compliance?.total} Approved)
                        </h4>
                      </div>
                      <p className="text-xs text-gray-400 font-bold mb-4">
                        Review uploaded credential scans for the designation: <span className="text-secondary font-black">{selectedStaff.designation}</span>.
                      </p>
                    </div>

                    <div className="space-y-6">
                      {requiredDocs.map((type) => (
                        <DocumentReviewCard
                          key={type}
                          type={type}
                          docInfo={selectedStaff.documents?.[type]}
                          onStatusUpdate={(docType, docStatus, docRemarks) => 
                            handleStatusUpdate(selectedStaff._id, `doc:${docType}:${docStatus}`, docRemarks)
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'permissions' && (
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-l-4 border-primary pl-3">
                          Permission Assignment
                        </h4>
                        <button
                          disabled={savingPermissions || !allDocsApproved}
                          onClick={handleSavePermissions}
                          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow hover:scale-105 transition-all disabled:opacity-50"
                        >
                          <Save size={12} /> {savingPermissions ? 'Saving...' : 'Save Rules'}
                        </button>
                      </div>

                      {!allDocsApproved && (
                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3 mb-6">
                          <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-800 font-bold leading-relaxed">
                            <span className="font-black">Sequenced Block</span>: You must verify and approve all uploaded compliance documents before configuration of systems permissions is allowed.
                          </p>
                        </div>
                      )}

                      {allDocsApproved && (
                        <p className="text-xs text-green-600 font-black mb-6 flex items-center gap-1.5">
                          <CheckCircle2 size={14} /> Documents Verified! Select permissions for staff member below and click Save.
                        </p>
                      )}

                      <div className="space-y-6">
                        {loadingPermissions ? (
                          <p className="text-center text-gray-400 italic text-xs py-8">Loading system permissions...</p>
                        ) : (
                          Object.keys(groupedPermissions).map(moduleName => (
                            <div key={moduleName} className="flex flex-col gap-2">
                              <h5 className="text-[9px] font-black text-gray-400 uppercase tracking-wider pl-1">{moduleName}</h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {groupedPermissions[moduleName].map((perm: any) => {
                                  const isChecked = selectedPermKeys.includes(perm.key);
                                  return (
                                    <div
                                      key={perm.key}
                                      onClick={() => allDocsApproved && handleTogglePermission(perm.key)}
                                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                                        !allDocsApproved ? 'opacity-50 cursor-not-allowed border-gray-100 bg-gray-50' :
                                        isChecked ? 'border-primary/20 bg-primary/5 text-primary cursor-pointer' : 
                                        'border-gray-100 bg-white text-secondary hover:border-gray-200 cursor-pointer'
                                      }`}
                                    >
                                      <div>
                                        <p className="text-xs font-black">{perm.name}</p>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{perm.key}</p>
                                      </div>
                                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                        isChecked ? 'bg-primary border-primary text-white' : 'border-gray-200 bg-white'
                                      }`}>
                                        {isChecked && <CheckCircle2 size={10} />}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'territory' && (
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-l-4 border-primary pl-3">
                          Territory Scope & Assignments
                        </h4>
                        <button
                          disabled={savingTerritory}
                          onClick={handleSaveTerritory}
                          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow hover:scale-105 transition-all disabled:opacity-50"
                        >
                          <Save size={12} /> {savingTerritory ? 'Saving...' : 'Save Scope'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 font-bold mb-6">
                        Configure regional scope for this staff user to restrict the geographic data boundary they can view or manage.
                      </p>

                      {/* Scope Selector */}
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scope Level</label>
                        <div className="grid grid-cols-2 gap-4 mt-1">
                          <div
                            onClick={() => setAssignedScope('all')}
                            className={`p-4 rounded-2xl border-2 cursor-pointer text-center transition-all ${
                              assignedScope === 'all'
                                ? 'border-primary bg-primary/5 text-primary font-bold'
                                : 'border-gray-100 bg-white text-secondary hover:border-gray-200'
                            }`}
                          >
                            <MapPin size={20} className="mx-auto mb-2" />
                            <h4 className="text-xs font-black uppercase tracking-wider">All India</h4>
                            <p className="text-[9px] text-gray-400 font-bold mt-1">Has access to all regions/states</p>
                          </div>
                          <div
                            onClick={() => setAssignedScope('state')}
                            className={`p-4 rounded-2xl border-2 cursor-pointer text-center transition-all ${
                              assignedScope === 'state'
                                ? 'border-primary bg-primary/5 text-primary font-bold'
                                : 'border-gray-100 bg-white text-secondary hover:border-gray-200'
                            }`}
                          >
                            <MapPin size={20} className="mx-auto mb-2" />
                            <h4 className="text-xs font-black uppercase tracking-wider">State</h4>
                            <p className="text-[9px] text-gray-400 font-bold mt-1">Restricted to specified states</p>
                          </div>
                          <div
                            onClick={() => setAssignedScope('district')}
                            className={`p-4 rounded-2xl border-2 cursor-pointer text-center transition-all ${
                              assignedScope === 'district'
                                ? 'border-primary bg-primary/5 text-primary font-bold'
                                : 'border-gray-100 bg-white text-secondary hover:border-gray-200'
                            }`}
                          >
                            <MapPin size={20} className="mx-auto mb-2" />
                            <h4 className="text-xs font-black uppercase tracking-wider">District</h4>
                            <p className="text-[9px] text-gray-400 font-bold mt-1">Restricted to specified districts</p>
                          </div>
                          <div
                            onClick={() => setAssignedScope('block')}
                            className={`p-4 rounded-2xl border-2 cursor-pointer text-center transition-all ${
                              assignedScope === 'block'
                                ? 'border-primary bg-primary/5 text-primary font-bold'
                                : 'border-gray-100 bg-white text-secondary hover:border-gray-200'
                            }`}
                          >
                            <MapPin size={20} className="mx-auto mb-2" />
                            <h4 className="text-xs font-black uppercase tracking-wider">Block</h4>
                            <p className="text-[9px] text-gray-400 font-bold mt-1">Restricted to specified blocks</p>
                          </div>
                        </div>
                      </div>

                      {assignedScope !== 'all' && (
                        <div className="mt-8 space-y-6 pt-6 border-t border-gray-100">
                          {/* States selector */}
                          <div className="flex flex-col gap-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assign States</label>
                            <div className="flex flex-wrap gap-2">
                              {MAJOR_STATES.map(state => {
                                const isAssigned = assignedStates.includes(state);
                                return (
                                  <button
                                    key={state}
                                    type="button"
                                    onClick={() => isAssigned ? handleRemoveState(state) : handleAddState(state)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                                      isAssigned 
                                        ? 'bg-primary/10 border-primary/20 text-primary' 
                                        : 'bg-white border-gray-100 text-secondary hover:border-gray-200'
                                    }`}
                                  >
                                    {state}
                                  </button>
                                );
                              })}
                            </div>

                            <div className="flex gap-2 items-center mt-2">
                              <input
                                type="text"
                                placeholder="Add another state name..."
                                value={customState}
                                onChange={(e) => setCustomState(e.target.value)}
                                className="bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none flex-1"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  handleAddState(customState);
                                  setCustomState('');
                                }}
                                className="p-3 bg-secondary text-white rounded-xl text-xs font-bold hover:bg-secondary-light"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Districts Selector */}
                          {(assignedScope === 'district' || assignedScope === 'block') && (
                            <div className="flex flex-col gap-3 border-t border-gray-50 pt-6">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assign Districts</label>
                              {assignedDistricts.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {assignedDistricts.map(district => (
                                    <span
                                      key={district}
                                      className="px-3.5 py-1.5 bg-secondary/10 border border-secondary/20 text-secondary font-bold text-xs rounded-xl flex items-center gap-1.5"
                                    >
                                      {district}
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveDistrict(district)}
                                        className="text-secondary hover:text-red-500"
                                      >
                                        <X size={12} />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[10px] text-gray-400 font-bold italic uppercase tracking-wider">No specific districts assigned.</p>
                              )}

                              <div className="flex gap-2 items-center mt-1">
                                <input
                                  type="text"
                                  placeholder="Type district name to add (e.g. Bhopal, Indore)..."
                                  value={customDistrict}
                                  onChange={(e) => setCustomDistrict(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddDistrict(); }}
                                  className="bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none flex-1"
                                />
                                <button
                                  type="button"
                                  onClick={handleAddDistrict}
                                  className="p-3 bg-secondary text-white rounded-xl text-xs font-bold hover:bg-secondary-light"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Blocks Selector */}
                          {assignedScope === 'block' && (
                            <div className="flex flex-col gap-3 border-t border-gray-50 pt-6">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assign Blocks</label>
                              {assignedBlocks.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {assignedBlocks.map(block => (
                                    <span
                                      key={block}
                                      className="px-3.5 py-1.5 bg-secondary/10 border border-secondary/20 text-secondary font-bold text-xs rounded-xl flex items-center gap-1.5"
                                    >
                                      {block}
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveBlock(block)}
                                        className="text-secondary hover:text-red-500"
                                      >
                                        <X size={12} />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[10px] text-gray-400 font-bold italic uppercase tracking-wider">No specific blocks assigned.</p>
                              )}

                              <div className="flex gap-2 items-center mt-1">
                                <input
                                  type="text"
                                  placeholder="Type block name to add..."
                                  value={customBlock}
                                  onChange={(e) => setCustomBlock(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddBlock(); }}
                                  className="bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none flex-1"
                                />
                                <button
                                  type="button"
                                  onClick={handleAddBlock}
                                  className="p-3 bg-secondary text-white rounded-xl text-xs font-bold hover:bg-secondary-light"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Sticky Footer with Activation Controls */}
              <div className="p-8 border-t border-gray-100 bg-white shrink-0 flex gap-4">
                {selectedStaff.status !== 'active' ? (
                  <button
                    disabled={!allDocsApproved || selectedStaff.permissions?.length === 0}
                    onClick={() => handleStatusUpdate(selectedStaff._id, 'active')}
                    className="flex-1 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-100 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <ShieldCheck size={16} /> Approve & Activate Account
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusUpdate(selectedStaff._id, 'suspended')}
                    className="flex-1 py-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  >
                    <ShieldAlert size={16} /> Suspend Access
                  </button>
                )}
                {selectedStaff.status !== 'rejected' && selectedStaff.status !== 'active' && (
                  <button
                    onClick={() => {
                      const reason = prompt("Enter rejection reason:");
                      if (reason) handleStatusUpdate(selectedStaff._id, 'rejected', reason);
                    }}
                    className="py-4 px-6 border-2 border-gray-100 hover:border-red-200 text-gray-400 hover:text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Reject Application
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
