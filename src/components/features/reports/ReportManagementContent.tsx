'use client';

import React, { useState, useEffect } from "react";
import { 
  BarChart, PieChart, TrendingUp, Download, 
  Calendar, Users, IndianRupee, Map as MapIcon, Award,
  ArrowUpRight, ArrowDownRight, Settings, FileCheck, 
  Clock, Trash2, FolderOpen, MapPin, RefreshCw, FileText,
  X, Eye, AlertTriangle, Check, CheckCircle2, ClipboardList,
  Camera, Video
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const FIELD_OPTIONS = {
  vendors: [
    { value: 'fullName', label: 'Full Name' },
    { value: 'vendorCode', label: 'Vendor Code' },
    { value: 'mobile', label: 'Mobile Number' },
    { value: 'email', label: 'Email' },
    { value: 'status', label: 'Account Status' },
    { value: 'paymentStatus', label: 'Subscription Status' },
    { value: 'state', label: 'State' },
    { value: 'district', label: 'District' },
    { value: 'block', label: 'Block' },
    { value: 'address', label: 'Address' },
    { value: 'createdAt', label: 'Registration Date' }
  ],
  sub_vendors: [
    { value: 'fullName', label: 'Full Name' },
    { value: 'subVendorCode', label: 'Sub-Vendor Code' },
    { value: 'mobile', label: 'Mobile Number' },
    { value: 'email', label: 'Email' },
    { value: 'status', label: 'Account Status' },
    { value: 'paymentStatus', label: 'Subscription Status' },
    { value: 'state', label: 'State' },
    { value: 'district', label: 'District' },
    { value: 'block', label: 'Block' },
    { value: 'address', label: 'Address' },
    { value: 'parentVendorName', label: 'Parent Vendor' },
    { value: 'createdAt', label: 'Registration Date' }
  ],
  employees: [
    { value: 'fullName', label: 'Full Name' },
    { value: 'employeeId', label: 'Employee ID' },
    { value: 'designation', label: 'Designation' },
    { value: 'mobile', label: 'Mobile Number' },
    { value: 'email', label: 'Email' },
    { value: 'status', label: 'Employment Status' },
    { value: 'paymentStatus', label: 'Deposit Status' },
    { value: 'state', label: 'State' },
    { value: 'district', label: 'District' },
    { value: 'block', label: 'Block' },
    { value: 'address', label: 'Address' },
    { value: 'parentVendorName', label: 'Parent Vendor' },
    { value: 'parentSubVendorName', label: 'Parent Sub-Vendor' },
    { value: 'createdAt', label: 'Joining Date' }
  ],
  members: [
    { value: 'name', label: 'Full Name' },
    { value: 'mobile', label: 'Mobile Number' },
    { value: 'connectionStatus', label: 'Connection Status' },
    { value: 'membershipStatus', label: 'Membership Status' },
    { value: 'state', label: 'State' },
    { value: 'district', label: 'District' },
    { value: 'block', label: 'Block' },
    { value: 'village', label: 'Village' },
    { value: 'assignedEmployeeName', label: 'Assigned Executive' },
    { value: 'createdAt', label: 'Enrolled Date' }
  ],
  payments: [
    { value: 'transactionId', label: 'Transaction ID' },
    { value: 'amount', label: 'Amount (₹)' },
    { value: 'userFullName', label: 'User Name' },
    { value: 'userMobile', label: 'User Mobile' },
    { value: 'role', label: 'User Role' },
    { value: 'status', label: 'Status' },
    { value: 'type', label: 'Payment Type' },
    { value: 'createdAt', label: 'Created At' },
    { value: 'paidAt', label: 'Paid At' }
  ],
  memberships: [
    { value: 'membershipId', label: 'Membership ID' },
    { value: 'receiptNumber', label: 'Receipt Number' },
    { value: 'amount', label: 'Amount (₹)' },
    { value: 'memberName', label: 'Member Name' },
    { value: 'memberMobile', label: 'Member Mobile' },
    { value: 'paymentMode', label: 'Payment Mode' },
    { value: 'paymentDate', label: 'Payment Date' },
    { value: 'createdAt', label: 'Created At' }
  ],
  compliance: [
    { value: 'fullName', label: 'Full Name' },
    { value: 'role', label: 'Role' },
    { value: 'status', label: 'Account Status' },
    { value: 'parentVendorName', label: 'Parent Vendor' },
    { value: 'pendingDocsCount', label: 'Pending Documents' },
    { value: 'agreementStatus', label: 'Vendor Agreement' },
    { value: 'offerLetterStatus', label: 'Employee Offer Letter' },
    { value: 'createdAt', label: 'Registration Date' }
  ]
};

export default function ReportManagementContent() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const userPermissions = Array.isArray(user?.permissions) ? user.permissions : [];
  const canExport = isSuperAdmin || userPermissions.includes('reports.export');

  const [activeTab, setActiveTab] = useState<'overview' | 'builder' | 'templates' | 'audit' | 'meetings'>('overview');
  
  // Data Overview State
  const [overviewData, setOverviewData] = useState<any>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  // Saved Templates State
  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  
  // Meeting Analytics & Evidence States
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [meetingsFilter, setMeetingsFilter] = useState({
    state: '',
    district: '',
    block: '',
    conductedBy: '',
    groupId: ''
  });
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [loadingMeetingDetails, setLoadingMeetingDetails] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState<any>(null);
  const [rejectionRemarks, setRejectionRemarks] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Report Builder States
  const [entityType, setEntityType] = useState<'vendors' | 'sub_vendors' | 'employees' | 'members' | 'payments' | 'memberships' | 'compliance'>('vendors');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState({ state: '', district: '', block: '' });
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [status, setStatus] = useState<string[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<string[]>([]);
  const [format, setFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [saveTemplateName, setSaveTemplateName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [designation, setDesignation] = useState('');

  // Set default selected fields based on selected entity type
  useEffect(() => {
    setSelectedFields(FIELD_OPTIONS[entityType].map(f => f.value));
    setStatus([]);
    setPaymentStatus([]);
    setDesignation('');
  }, [entityType]);

  const fetchOverview = async () => {
    setLoadingOverview(true);
    try {
      const res = await axios.get('/api/admin/reports');
      if (res.data.success) setOverviewData(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load platform overview metrics");
    } finally {
      setLoadingOverview(false);
    }
  };

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const res = await axios.get('/api/admin/reports/templates');
      if (res.data.success) setTemplates(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load saved templates");
    } finally {
      setLoadingTemplates(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const res = await axios.get('/api/admin/reports/audit');
      if (res.data.success) setAuditLogs(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load audit logs");
    } finally {
      setLoadingAudit(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchOverview();
    } else if (activeTab === 'templates') {
      fetchTemplates();
    } else if (activeTab === 'audit') {
      fetchAuditLogs();
    } else if (activeTab === 'meetings') {
      fetchMeetingsData();
    }
  }, [activeTab]);

  const fetchMeetingsData = async () => {
    setLoadingMeetings(true);
    try {
      const res = await axios.get('/api/meetings?limit=1000');
      if (res.data.success) {
        setMeetings(res.data.data.data || res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load meetings evidence directory");
    } finally {
      setLoadingMeetings(false);
    }
  };

  const fetchMeetingDetails = async (meetingId: string) => {
    setLoadingMeetingDetails(true);
    setShowRejectInput(false);
    setRejectionRemarks('');
    try {
      const res = await axios.get(`/api/meetings/${meetingId}`);
      if (res.data.success) {
        setMeetingDetails(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load meeting verification details");
    } finally {
      setLoadingMeetingDetails(false);
    }
  };

  const handleReviewMeeting = async (meetingId: string, status: 'verified' | 'rejected') => {
    try {
      const payload: any = { status };
      if (status === 'rejected') {
        if (!rejectionRemarks.trim()) {
          toast.error("Please provide a rejection reason");
          return;
        }
        payload.rejectionReason = rejectionRemarks;
      }

      const res = await axios.patch(`/api/meetings/${meetingId}`, payload);
      if (res.data.success) {
        toast.success(`Meeting status updated to ${status} successfully`);
        fetchMeetingDetails(meetingId);
        fetchMeetingsData(); // refresh list
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update meeting review status");
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canExport) {
      toast.error("You do not have permission to export reports.");
      return;
    }
    if (selectedFields.length === 0) {
      toast.error("Please select at least one column for the report.");
      return;
    }
    
    setIsGenerating(true);
    const toastId = toast.loading("Generating and compiling report files...");
    try {
      const response = await axios({
        url: '/api/admin/reports/generate',
        method: 'POST',
        data: {
          entityType,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          status: status.length > 0 ? status : undefined,
          paymentStatus: paymentStatus.length > 0 ? paymentStatus : undefined,
          location: (location.state || location.district || location.block) ? location : undefined,
          designation: designation || undefined,
          selectedFields,
          format,
          saveTemplateName: saveTemplateName || undefined
        },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], {
        type: response.headers['content-type'] as string | undefined
      });

      const contentDisposition = response.headers['content-disposition'] as string | undefined;
      let filename = `report_${entityType}_${Date.now()}.${format === 'excel' ? 'xls' : format}`;
      if (contentDisposition) {
        const matches = /filename="?([^"]+)"?/g.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Report generated and downloaded successfully!', { id: toastId });
      
      if (saveTemplateName) {
        setSaveTemplateName('');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to compile the custom report. Ensure you have matching filters.', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRunTemplate = async (template: any) => {
    if (!canExport) {
      toast.error("You do not have permission to run export templates.");
      return;
    }
    const toastId = toast.loading(`Running template "${template.name}"...`);
    try {
      const response = await axios({
        url: '/api/admin/reports/generate',
        method: 'POST',
        data: {
          entityType: template.entityType,
          startDate: template.filters?.startDate,
          endDate: template.filters?.endDate,
          status: template.filters?.status,
          paymentStatus: template.filters?.paymentStatus,
          location: template.filters?.location,
          designation: template.filters?.designation,
          selectedFields: template.selectedFields,
          format: template.format
        },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], {
        type: response.headers['content-type'] as string | undefined
      });

      const contentDisposition = response.headers['content-disposition'] as string | undefined;
      let filename = template.name.toLowerCase().replace(/\s+/g, '_') + `_${Date.now()}.${template.format === 'excel' ? 'xls' : template.format}`;
      if (contentDisposition) {
        const matches = /filename="?([^"]+)"?/g.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Template report downloaded successfully!', { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to execute template.', { id: toastId });
    }
  };

  const handleLoadTemplate = (template: any) => {
    setEntityType(template.entityType);
    setStartDate(template.filters?.startDate ? new Date(template.filters.startDate).toISOString().split('T')[0] : '');
    setEndDate(template.filters?.endDate ? new Date(template.filters.endDate).toISOString().split('T')[0] : '');
    setStatus(template.filters?.status || []);
    setPaymentStatus(template.filters?.paymentStatus || []);
    setLocation(template.filters?.location || { state: '', district: '', block: '' });
    setDesignation(template.filters?.designation || '');
    setSelectedFields(template.selectedFields);
    setFormat(template.format);
    setActiveTab('builder');
    toast.success(`Template "${template.name}" configuration loaded!`);
  };

  const handleDeleteTemplate = async (id: string) => {
    const toastId = toast.loading("Deleting template...");
    try {
      const res = await axios.delete(`/api/admin/reports/templates?id=${id}`);
      if (res.data.success) {
        toast.success("Template deleted successfully", { id: toastId });
        fetchTemplates();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete template", { id: toastId });
    }
  };

  const handleFieldToggle = (fieldVal: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldVal) 
        ? prev.filter(f => f !== fieldVal) 
        : [...prev, fieldVal]
    );
  };

  const handleStatusToggle = (val: string) => {
    setStatus(prev => 
      prev.includes(val) 
        ? prev.filter(s => s !== val) 
        : [...prev, val]
    );
  };

  const handlePaymentStatusToggle = (val: string) => {
    setPaymentStatus(prev => 
      prev.includes(val) 
        ? prev.filter(p => p !== val) 
        : [...prev, val]
    );
  };

  return (
    <>
      {/* Header and Brand */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '35px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--secondary)', letterSpacing: '-0.03em' }}>Enterprise Report Command Center</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '5px' }}>
            Centralized platform reporting layer for custom query parameters, network summaries, compliance logs, and bulk formats.
          </p>
        </div>
      </div>

      {/* Tabs Selection Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '30px', background: '#f1f5f9', padding: '6px', borderRadius: '20px', width: 'fit-content' }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '14px', border: 'none', cursor: 'pointer',
            fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.2s',
            background: activeTab === 'overview' ? 'white' : 'transparent',
            color: activeTab === 'overview' ? 'var(--secondary)' : '#64748b',
            boxShadow: activeTab === 'overview' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
          }}
        >
          <BarChart size={16} /> Overview
        </button>
        <button
          onClick={() => setActiveTab('builder')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '14px', border: 'none', cursor: 'pointer',
            fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.2s',
            background: activeTab === 'builder' ? 'white' : 'transparent',
            color: activeTab === 'builder' ? 'var(--secondary)' : '#64748b',
            boxShadow: activeTab === 'builder' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
          }}
        >
          <Settings size={16} /> Custom Builder
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '14px', border: 'none', cursor: 'pointer',
            fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.2s',
            background: activeTab === 'templates' ? 'white' : 'transparent',
            color: activeTab === 'templates' ? 'var(--secondary)' : '#64748b',
            boxShadow: activeTab === 'templates' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
          }}
        >
          <FileCheck size={16} /> Saved Templates
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '14px', border: 'none', cursor: 'pointer',
            fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.2s',
            background: activeTab === 'audit' ? 'white' : 'transparent',
            color: activeTab === 'audit' ? 'var(--secondary)' : '#64748b',
            boxShadow: activeTab === 'audit' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
          }}
        >
          <Clock size={16} /> Audit Logs
        </button>
        <button
          onClick={() => setActiveTab('meetings')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '14px', border: 'none', cursor: 'pointer',
            fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.2s',
            background: activeTab === 'meetings' ? 'white' : 'transparent',
            color: activeTab === 'meetings' ? 'var(--secondary)' : '#64748b',
            boxShadow: activeTab === 'meetings' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
          }}
        >
          <ClipboardList size={16} /> Meeting Analytics
        </button>
      </div>

      {/* Tab 1: Platform Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {loadingOverview ? (
            <div style={{ padding: '80px', textAlign: 'center', color: '#64748b', fontWeight: 'bold' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px' }} />
              Compiling live platform metrics...
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px' }}>
                {/* Monthly Growth */}
                <div className="glass-card" style={{ background: 'white', padding: '35px', borderRadius: '35px', boxShadow: '0 10px 40px rgba(0,0,0,0.02)' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--secondary)' }}>
                    <TrendingUp size={22} color="var(--primary)" /> Registration Growth
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {overviewData?.monthlyRegs?.map((m: any) => (
                      <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ width: '80px', fontSize: '0.85rem', fontWeight: '800', color: '#64748b' }}>Month {m._id}</span>
                        <div style={{ flex: 1, height: '24px', background: '#f1f5f9', borderRadius: '12px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(m.count * 5, 100)}%`, height: '100%', background: 'var(--grad-primary)', borderRadius: '12px' }}></div>
                        </div>
                        <span style={{ fontWeight: '900', color: 'var(--secondary)', fontSize: '0.9rem' }}>{m.count} Members</span>
                      </div>
                    ))}
                    {!overviewData?.monthlyRegs?.length && <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px', fontStyle: 'italic' }}>Insufficient data for trend analysis.</p>}
                  </div>
                </div>

                {/* Collection Metrics */}
                <div className="glass-card" style={{ background: 'white', padding: '35px', borderRadius: '35px', boxShadow: '0 10px 40px rgba(0,0,0,0.02)' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--secondary)' }}>
                    <IndianRupee size={22} color="#10b981" /> Revenue Streams
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {overviewData?.monthlyCollections?.map((m: any) => (
                      <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ width: '80px', fontSize: '0.85rem', fontWeight: '800', color: '#64748b' }}>Month {m._id}</span>
                        <div style={{ flex: 1, height: '24px', background: '#f0fdf4', borderRadius: '12px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(m.total / 1000, 100)}%`, height: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '12px' }}></div>
                        </div>
                        <span style={{ fontWeight: '900', color: '#059669', fontSize: '0.9rem' }}>₹{m.total.toLocaleString()}</span>
                      </div>
                    ))}
                    {!overviewData?.monthlyCollections?.length && <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px', fontStyle: 'italic' }}>No revenue data recorded yet.</p>}
                  </div>
                </div>
              </div>

              {/* Employee Leaderboard */}
              <div className="glass-card" style={{ background: 'white', padding: '35px', borderRadius: '35px', boxShadow: '0 10px 40px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--secondary)' }}>
                  <Award size={26} color="#f59e0b" /> Field Efficiency Leaderboard
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                  {overviewData?.employeePerformance?.map((perf: any, i: number) => (
                    <div key={perf._id} style={{ padding: '20px 25px', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '20px', background: i === 0 ? '#fffcf0' : 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.01)' }}>
                      <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: i === 0 ? '#f59e0b' : '#f1f5f9', color: i === 0 ? 'white' : '#475569', display: 'flex', alignItems: 'center', alignContent: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.1rem' }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontWeight: '800', color: 'var(--secondary)' }}>{perf.employeeName}</h4>
                        <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{perf.mobile}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: 'var(--primary)' }}>{perf.membersCount}</p>
                        <p style={{ margin: 0, fontSize: '0.65rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Members</p>
                      </div>
                    </div>
                  ))}
                  {!overviewData?.employeePerformance?.length && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#94a3b8', fontStyle: 'italic' }}>No performance data available yet.</div>}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 2: Custom Builder Form */}
      {activeTab === 'builder' && (
        <form onSubmit={handleGenerate} className="glass-card" style={{ background: 'white', padding: '40px', borderRadius: '40px', boxShadow: '0 15px 50px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '35px' }}>
          
          {/* Entity and Format Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: '8px' }}>1. Target Entity</label>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value as any)}
                style={{ width: '100%', padding: '15px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontWeight: '700', color: 'var(--secondary)', fontSize: '0.95rem', cursor: 'pointer', outline: 'none' }}
              >
                <option value="vendors">Vendor Partners</option>
                <option value="sub_vendors">Sub-Vendor Partners</option>
                <option value="employees">Field Employees</option>
                <option value="members">Women Members</option>
                <option value="payments">Online Transactions</option>
                <option value="memberships">Membership Receipts</option>
                <option value="compliance">Compliance & Docs Registry</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: '8px' }}>2. Output Format</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['pdf', 'excel', 'csv'].map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setFormat(fmt as any)}
                    style={{
                      flex: 1, padding: '15px 20px', borderRadius: '16px', border: format === fmt ? '2px solid var(--secondary)' : '1px solid #cbd5e1',
                      fontWeight: '800', textTransform: 'uppercase', fontSize: '0.85rem', cursor: 'pointer',
                      background: format === fmt ? 'var(--secondary)' : 'white',
                      color: format === fmt ? 'white' : '#64748b',
                      transition: 'all 0.2s'
                    }}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Range and Location Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', borderTop: '1px solid #f1f5f9', paddingTop: '30px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: '8px' }}>3. Date Filter Range (Optional)</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ flex: 1, padding: '14px 16px', borderRadius: '16px', border: '1px solid #cbd5e1', color: 'var(--secondary)', fontWeight: '700', outline: 'none' }}
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ flex: 1, padding: '14px 16px', borderRadius: '16px', border: '1px solid #cbd5e1', color: 'var(--secondary)', fontWeight: '700', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: '8px' }}>4. Location Scope (Optional)</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="State"
                  value={location.state}
                  onChange={(e) => setLocation(prev => ({ ...prev, state: e.target.value }))}
                  style={{ flex: 1, padding: '14px 16px', borderRadius: '16px', border: '1px solid #cbd5e1', color: 'var(--secondary)', fontWeight: '700', outline: 'none' }}
                />
                <input
                  type="text"
                  placeholder="District"
                  value={location.district}
                  onChange={(e) => setLocation(prev => ({ ...prev, district: e.target.value }))}
                  style={{ flex: 1, padding: '14px 16px', borderRadius: '16px', border: '1px solid #cbd5e1', color: 'var(--secondary)', fontWeight: '700', outline: 'none' }}
                />
                <input
                  type="text"
                  placeholder="Block"
                  value={location.block}
                  onChange={(e) => setLocation(prev => ({ ...prev, block: e.target.value }))}
                  style={{ flex: 1, padding: '14px 16px', borderRadius: '16px', border: '1px solid #cbd5e1', color: 'var(--secondary)', fontWeight: '700', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Designation Filter Grid (Conditional) */}
          {(entityType === 'employees' || entityType === 'compliance') && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', borderTop: '1px solid #f1f5f9', paddingTop: '30px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: '8px' }}>Designation Filter (Optional)</label>
                <select
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  style={{ width: '100%', padding: '14px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontWeight: '700', color: 'var(--secondary)', fontSize: '0.95rem', cursor: 'pointer', outline: 'none' }}
                >
                  <option value="">All Designations</option>
                  <option value="Block Coordinator">Block Coordinator</option>
                  <option value="District Coordinator">District Coordinator</option>
                  <option value="Trainer">Trainer</option>
                  <option value="Volunteer">Volunteer</option>
                  <option value="Delivery Partner">Delivery Partner</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div />
            </div>
          )}

          {/* Status and Payment Status Filters */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', borderTop: '1px solid #f1f5f9', paddingTop: '30px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: '8px' }}>5. Status Flags</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {entityType === 'members' ? (
                  ['active', 'pending_request', 'rejected', 'terminated'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleStatusToggle(s)}
                      style={{
                        padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer',
                        background: status.includes(s) ? '#f3e8ff' : '#f8fafc',
                        color: status.includes(s) ? '#7c3aed' : '#475569',
                        borderColor: status.includes(s) ? '#c084fc' : '#e2e8f0'
                      }}
                    >
                      {s.replace('_', ' ')}
                    </button>
                  ))
                ) : (
                  ['pending', 'active', 'approved', 'under_review', 'reupload_required', 'rejected', 'suspended'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleStatusToggle(s)}
                      style={{
                        padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer',
                        background: status.includes(s) ? '#f3e8ff' : '#f8fafc',
                        color: status.includes(s) ? '#7c3aed' : '#475569',
                        borderColor: status.includes(s) ? '#c084fc' : '#e2e8f0'
                      }}
                    >
                      {s.replace('_', ' ')}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: '8px' }}>6. Payment / Collection Status</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(entityType === 'payments' || entityType === 'memberships') ? (
                  ['paid', 'pending', 'failed', 'success'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePaymentStatusToggle(p)}
                      style={{
                        padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer',
                        background: paymentStatus.includes(p) ? '#dcfce7' : '#f8fafc',
                        color: paymentStatus.includes(p) ? '#166534' : '#475569',
                        borderColor: paymentStatus.includes(p) ? '#86efac' : '#e2e8f0'
                      }}
                    >
                      {p.toUpperCase()}
                    </button>
                  ))
                ) : (
                  ['Paid', 'Unpaid'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePaymentStatusToggle(p)}
                      style={{
                        padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer',
                        background: paymentStatus.includes(p) ? '#dcfce7' : '#f8fafc',
                        color: paymentStatus.includes(p) ? '#166534' : '#475569',
                        borderColor: paymentStatus.includes(p) ? '#86efac' : '#e2e8f0'
                      }}
                    >
                      {p}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Column selection */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '30px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: '15px' }}>7. Select Columns to Include</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {FIELD_OPTIONS[entityType].map((f) => (
                <label key={f.value} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(f.value)}
                    onChange={() => handleFieldToggle(f.value)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                  />
                  <span>{f.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Template saving and execution */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '30px', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1, minWidth: '300px' }}>
              <input
                type="text"
                placeholder={canExport ? "Name template to save configurations (Optional)..." : "Saving templates requires export permissions."}
                disabled={!canExport}
                value={saveTemplateName}
                onChange={(e) => setSaveTemplateName(e.target.value)}
                style={{ flex: 1, padding: '14px 18px', borderRadius: '16px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem', fontWeight: '600', background: canExport ? 'white' : '#f1f5f9' }}
              />
            </div>
            {canExport ? (
              <button
                type="submit"
                disabled={isGenerating}
                style={{
                  padding: '16px 40px', borderRadius: '18px', border: 'none', background: 'var(--grad-primary)', color: 'white',
                  fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
                }}
              >
                {isGenerating ? <RefreshCw className="animate-spin" size={16} /> : <Download size={16} />} 
                {isGenerating ? 'Compiling...' : 'Generate & Download'}
              </button>
            ) : (
              <button
                type="button"
                disabled
                style={{
                  padding: '16px 40px', borderRadius: '18px', border: 'none', background: '#cbd5e1', color: '#94a3b8',
                  fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'not-allowed',
                  display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.7
                }}
              >
                <Download size={16} /> Export Locked
              </button>
            )}
          </div>
        </form>
      )}

      {/* Tab 3: Saved Templates Grid */}
      {activeTab === 'templates' && (
        <div className="glass-card" style={{ background: 'white', padding: '35px', borderRadius: '35px', boxShadow: '0 10px 40px rgba(0,0,0,0.02)' }}>
          {loadingTemplates ? (
            <div style={{ padding: '50px', textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px' }} /> Load template registry...
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ padding: '18px 15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Template Name</th>
                    <th style={{ padding: '18px 15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Target Entity</th>
                    <th style={{ padding: '18px 15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Active Filters</th>
                    <th style={{ padding: '18px 15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Columns Count</th>
                    <th style={{ padding: '18px 15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Export Format</th>
                    <th style={{ padding: '18px 15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((t) => (
                    <tr key={t._id} style={{ borderBottom: '1px solid #f8fafc' }} className="hover:bg-slate-50/50">
                      <td style={{ padding: '18px 15px', fontWeight: '800', color: 'var(--secondary)' }}>{t.name}</td>
                      <td style={{ padding: '18px 15px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '8px', textTransform: 'uppercase' }}>
                          {t.entityType.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '18px 15px', color: '#64748b', fontSize: '0.8rem' }}>
                        {t.filters?.startDate || t.filters?.endDate ? 'Date range applied' : 'No dates'}
                        {t.filters?.location?.district ? ` • ${t.filters.location.district}` : ''}
                        {t.filters?.designation ? ` • ${t.filters.designation}` : ''}
                      </td>
                      <td style={{ padding: '18px 15px', fontWeight: '700', color: '#475569' }}>{t.selectedFields?.length || 0} Fields</td>
                      <td style={{ padding: '18px 15px', fontWeight: '800', textTransform: 'uppercase', color: t.format === 'pdf' ? '#7c3aed' : '#059669' }}>{t.format}</td>
                      <td style={{ padding: '18px 15px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {canExport && (
                          <button
                            onClick={() => handleRunTemplate(t)}
                            style={{ border: 'none', background: '#f0fdf4', color: '#166534', padding: '8px 14px', borderRadius: '10px', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Download size={12} /> Run
                          </button>
                        )}
                        <button
                          onClick={() => handleLoadTemplate(t)}
                          style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', padding: '8px 14px', borderRadius: '10px', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <FolderOpen size={12} /> Load
                        </button>
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleDeleteTemplate(t._id)}
                            style={{ border: 'none', background: '#fef2f2', color: '#991b1b', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {templates.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                        No saved configuration templates. Select "Save template" in the Custom Builder.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Audit Logs Registry */}
      {activeTab === 'audit' && (
        <div className="glass-card" style={{ background: 'white', padding: '35px', borderRadius: '35px', boxShadow: '0 10px 40px rgba(0,0,0,0.02)' }}>
          {loadingAudit ? (
            <div style={{ padding: '50px', textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px' }} /> Load audit logs registry...
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ padding: '18px 15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Timestamp</th>
                    <th style={{ padding: '18px 15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Report Type</th>
                    <th style={{ padding: '18px 15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Downloaded By</th>
                    <th style={{ padding: '18px 15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Records Scope</th>
                    <th style={{ padding: '18px 15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Format</th>
                    <th style={{ padding: '18px 15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Filename</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '18px 15px', color: '#64748b', fontSize: '0.85rem' }}>
                        {new Date(log.generatedAt).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '18px 15px', fontWeight: '800', color: 'var(--secondary)' }}>
                        {log.reportType}
                      </td>
                      <td style={{ padding: '18px 15px', fontWeight: '600', color: '#475569' }}>
                        {log.generatedBy?.fullName || 'System Admin'}
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontWeight: '400' }}>{log.generatedBy?.email || 'N/A'}</p>
                      </td>
                      <td style={{ padding: '18px 15px', fontWeight: '700', color: '#059669' }}>
                        {log.recordsIncluded} Records
                      </td>
                      <td style={{ padding: '18px 15px', fontWeight: '800', textTransform: 'uppercase', color: log.format === 'pdf' ? '#7c3aed' : '#059669' }}>
                        {log.format}
                      </td>
                      <td style={{ padding: '18px 15px', color: '#64748b', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        {log.fileName}
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                        No audit logs recorded. Generate a report in the builder or Network Tree to trigger a log.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {/* Tab 5: Meetings Evidence Directory */}
      {activeTab === 'meetings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Dynamically calculated Metrics Counters */}
          {(() => {
            const filtered = meetings.filter(m => {
              const groupRef = m.groupId || {};
              if (meetingsFilter.state && m.state !== meetingsFilter.state) return false;
              if (meetingsFilter.district && m.district !== meetingsFilter.district) return false;
              if (meetingsFilter.block && m.block !== meetingsFilter.block) return false;
              if (meetingsFilter.conductedBy && m.conductedBy?._id !== meetingsFilter.conductedBy) return false;
              if (meetingsFilter.groupId && groupRef._id !== meetingsFilter.groupId) return false;
              return true;
            });

            const uniqueGroupIds = new Set(filtered.map(m => m.groupId?._id).filter(Boolean));
            const totalMeetingsCount = filtered.length;
            const totalGroupsCount = uniqueGroupIds.size;
            const totalMembersCount = filtered.reduce((sum, m) => sum + (m.attendeesCount || 0), 0);
            const totalPhotosCount = filtered.reduce((sum, m) => sum + (m.photoCount || 0), 0);
            const totalVideosCount = filtered.reduce((sum, m) => sum + (m.videoCount || 0), 0);

            // Filter sets for dropdowns
            const uniqueStates = Array.from(new Set(meetings.map(m => m.state).filter(Boolean)));
            const uniqueDistricts = Array.from(new Set(meetings.filter(m => !meetingsFilter.state || m.state === meetingsFilter.state).map(m => m.district).filter(Boolean)));
            const uniqueBlocks = Array.from(new Set(meetings.filter(m => (!meetingsFilter.state || m.state === meetingsFilter.state) && (!meetingsFilter.district || m.district === meetingsFilter.district)).map(m => m.block).filter(Boolean)));
            const uniqueEmployees = Array.from(new Map(filtered.map(m => [m.conductedBy?._id, m.conductedBy] as [any, any]).filter(([id, u]) => id && u)).values());
            const uniqueGroups = Array.from(new Map(filtered.map(m => [m.groupId?._id, m.groupId] as [any, any]).filter(([id, g]) => id && g)).values());

            return (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  <div className="glass-card" style={{ background: 'white', padding: '25px', borderRadius: '25px', border: '1px solid #f1f5f9', display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ padding: '12px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', borderRadius: '12px' }}><ClipboardList size={22} /></div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Total Meetings</p>
                      <p style={{ margin: '3px 0 0', fontSize: '1.4rem', fontWeight: '900', color: 'var(--secondary)' }}>{totalMeetingsCount}</p>
                    </div>
                  </div>
                  <div className="glass-card" style={{ background: 'white', padding: '25px', borderRadius: '25px', border: '1px solid #f1f5f9', display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ padding: '12px', background: 'rgba(106, 27, 154, 0.1)', color: '#6a1b9a', borderRadius: '12px' }}><Users size={22} /></div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Groups Covered</p>
                      <p style={{ margin: '3px 0 0', fontSize: '1.4rem', fontWeight: '900', color: 'var(--secondary)' }}>{totalGroupsCount}</p>
                    </div>
                  </div>
                  <div className="glass-card" style={{ background: 'white', padding: '25px', borderRadius: '25px', border: '1px solid #f1f5f9', display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '12px' }}><Users size={22} /></div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Attendees Count</p>
                      <p style={{ margin: '3px 0 0', fontSize: '1.4rem', fontWeight: '900', color: 'var(--secondary)' }}>{totalMembersCount}</p>
                    </div>
                  </div>
                  <div className="glass-card" style={{ background: 'white', padding: '25px', borderRadius: '25px', border: '1px solid #f1f5f9', display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ padding: '12px', background: 'rgba(233, 30, 99, 0.1)', color: 'var(--primary)', borderRadius: '12px' }}><Camera size={22} /></div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Total Photos</p>
                      <p style={{ margin: '3px 0 0', fontSize: '1.4rem', fontWeight: '900', color: 'var(--secondary)' }}>{totalPhotosCount}</p>
                    </div>
                  </div>
                  <div className="glass-card" style={{ background: 'white', padding: '25px', borderRadius: '25px', border: '1px solid #f1f5f9', display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '12px' }}><Video size={22} /></div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Total Videos</p>
                      <p style={{ margin: '3px 0 0', fontSize: '1.4rem', fontWeight: '900', color: 'var(--secondary)' }}>{totalVideosCount}</p>
                    </div>
                  </div>
                </div>

                {/* State -> District -> Block -> Coordinator -> Group Dropdown Select drills */}
                <div className="glass-card" style={{ background: 'white', padding: '25px', borderRadius: '25px', border: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px' }}>Select State</label>
                    <select
                      value={meetingsFilter.state}
                      onChange={e => setMeetingsFilter(prev => ({ ...prev, state: e.target.value, district: '', block: '', groupId: '', conductedBy: '' }))}
                      style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: '700', outline: 'none' }}
                    >
                      <option value="">All States</option>
                      {uniqueStates.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px' }}>Select District</label>
                    <select
                      value={meetingsFilter.district}
                      onChange={e => setMeetingsFilter(prev => ({ ...prev, district: e.target.value, block: '', groupId: '', conductedBy: '' }))}
                      style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: '700', outline: 'none' }}
                    >
                      <option value="">All Districts</option>
                      {uniqueDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px' }}>Select Block</label>
                    <select
                      value={meetingsFilter.block}
                      onChange={e => setMeetingsFilter(prev => ({ ...prev, block: e.target.value, groupId: '', conductedBy: '' }))}
                      style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: '700', outline: 'none' }}
                    >
                      <option value="">All Blocks</option>
                      {uniqueBlocks.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px' }}>Select Employee</label>
                    <select
                      value={meetingsFilter.conductedBy}
                      onChange={e => setMeetingsFilter(prev => ({ ...prev, conductedBy: e.target.value }))}
                      style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: '700', outline: 'none' }}
                    >
                      <option value="">All Employees</option>
                      {uniqueEmployees.map((emp: any) => <option key={emp._id} value={emp._id}>{emp.fullName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px' }}>Select Group</label>
                    <select
                      value={meetingsFilter.groupId}
                      onChange={e => setMeetingsFilter(prev => ({ ...prev, groupId: e.target.value }))}
                      style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: '700', outline: 'none' }}
                    >
                      <option value="">All Groups</option>
                      {uniqueGroups.map((g: any) => <option key={g._id} value={g._id}>{g.groupName}</option>)}
                    </select>
                  </div>
                </div>

                {/* Master Details Panel split view */}
                <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '30px', alignItems: 'start' }}>
                  
                  {/* Left: Meetings List */}
                  <div className="glass-card" style={{ background: 'white', padding: '20px', borderRadius: '25px', border: '1px solid #f1f5f9', maxHeight: '60vh', overflowY: 'auto' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '15px' }}>Meetings Log ({filtered.length})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {filtered.map(m => (
                        <div
                          key={m._id}
                          onClick={() => {
                            setSelectedMeetingId(m._id);
                            fetchMeetingDetails(m._id);
                          }}
                          style={{
                            padding: '15px',
                            borderRadius: '16px',
                            border: selectedMeetingId === m._id ? '2px solid var(--primary)' : '1px solid #f1f5f9',
                            background: selectedMeetingId === m._id ? '#fffcfd' : 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontWeight: '800', color: 'var(--secondary)', fontSize: '0.9rem' }}>
                              {new Date(m.meetingDate).toLocaleDateString()}
                            </span>
                            <span style={{
                              padding: '4px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase',
                              background: m.status === 'verified' ? '#ecfdf5' : m.status === 'rejected' ? '#fef2f2' : m.status === 'submitted' ? '#eff6ff' : '#f8fafc',
                              color: m.status === 'verified' ? '#059669' : m.status === 'rejected' ? '#dc2626' : m.status === 'submitted' ? '#2563eb' : '#64748b'
                            }}>
                              {m.status}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '800', color: '#475569' }}>Group: {m.groupId?.groupName}</p>
                          <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>Exec: {m.conductedBy?.fullName}</p>
                          <div style={{ display: 'flex', gap: '10px', marginTop: '8px', fontSize: '0.7rem', color: '#64748b', fontWeight: '800' }}>
                            <span>👥 {m.attendeesCount} Attended</span>
                            <span>📸 {m.photoCount} Photos</span>
                            <span>🎥 {m.videoCount} Videos</span>
                          </div>
                        </div>
                      ))}
                      {filtered.length === 0 && <p style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No matching meetings recorded.</p>}
                    </div>
                  </div>

                  {/* Right: Detailed Evidence Viewer & Review Action Center */}
                  <div className="glass-card" style={{ background: 'white', padding: '30px', borderRadius: '30px', border: '1px solid #f1f5f9', minHeight: '50vh' }}>
                    {loadingMeetingDetails ? (
                      <div style={{ padding: '80px 0', textAlign: 'center', fontWeight: 'bold', color: '#64748b' }}>
                        <RefreshCw className="animate-spin" style={{ margin: '0 auto 10px' }} size={24} /> Loading meeting details...
                      </div>
                    ) : meetingDetails ? (
                      <div>
                        {/* Details Header */}
                        <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', marginBottom: '20px' }}>
                          <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--secondary)', margin: 0 }}>Review Meeting Evidence Details</h3>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                            <div>
                              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontWeight: '800' }}>GROUP UNIT</p>
                              <p style={{ margin: '2px 0 0', fontWeight: '800', color: 'var(--secondary)', fontSize: '0.95rem' }}>{meetingDetails.meeting.groupId?.groupName}</p>
                              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Leader: {meetingDetails.meeting.groupId?.leaderName} ({meetingDetails.meeting.groupId?.leaderMobile})</p>
                            </div>
                            <div>
                              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontWeight: '800' }}>MEETING LOG DETAILS</p>
                              <p style={{ margin: '2px 0 0', fontWeight: '800', color: 'var(--secondary)', fontSize: '0.95rem' }}>Conducted: {new Date(meetingDetails.meeting.meetingDate).toLocaleDateString()}</p>
                              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Exec: {meetingDetails.meeting.conductedBy?.fullName} ({meetingDetails.meeting.conductedBy?.employeeId})</p>
                            </div>
                            <div>
                              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontWeight: '800' }}>LOCATION SCOPE</p>
                              <p style={{ margin: '2px 0 0', fontWeight: '800', color: '#64748b', fontSize: '0.85rem' }}>{meetingDetails.meeting.village}, {meetingDetails.meeting.block}, {meetingDetails.meeting.district}</p>
                            </div>
                            <div>
                              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontWeight: '800' }}>STATUS WORKFLOW</p>
                              <span style={{
                                display: 'inline-block', padding: '4px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '950', textTransform: 'uppercase', marginTop: '4px',
                                background: meetingDetails.meeting.status === 'verified' ? '#ecfdf5' : meetingDetails.meeting.status === 'rejected' ? '#fef2f2' : meetingDetails.meeting.status === 'submitted' ? '#eff6ff' : '#f8fafc',
                                color: meetingDetails.meeting.status === 'verified' ? '#059669' : meetingDetails.meeting.status === 'rejected' ? '#dc2626' : meetingDetails.meeting.status === 'submitted' ? '#2563eb' : '#64748b'
                              }}>{meetingDetails.meeting.status}</span>
                            </div>
                          </div>
                        </div>

                        {/* Admin Action Center */}
                        {meetingDetails.meeting.status === 'submitted' && (
                          <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
                            <h4 style={{ margin: '0 0 10px', fontSize: '0.85rem', fontWeight: '900', color: 'var(--secondary)' }}>Verification Actions</h4>
                            
                            {!showRejectInput ? (
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <button
                                  onClick={() => handleReviewMeeting(meetingDetails.meeting._id, 'verified')}
                                  style={{ flex: 1, padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                >
                                  <Check size={16} /> Approve & Verify
                                </button>
                                <button
                                  onClick={() => setShowRejectInput(true)}
                                  style={{ flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                >
                                  <X size={16} /> Reject Evidence
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <textarea
                                  placeholder="Enter the reason why this evidence is rejected..."
                                  rows={2}
                                  value={rejectionRemarks}
                                  onChange={e => setRejectionRemarks(e.target.value)}
                                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.8rem', outline: 'none', resize: 'none' }}
                                />
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                  <button onClick={() => setShowRejectInput(false)} style={{ padding: '8px 15px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
                                  <button onClick={() => handleReviewMeeting(meetingDetails.meeting._id, 'rejected')} style={{ padding: '8px 15px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>Submit Rejection</button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {meetingDetails.meeting.status === 'rejected' && (
                          <div style={{ display: 'flex', gap: '10px', padding: '15px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '16px', marginBottom: '25px', color: '#b91c1c', fontSize: '0.85rem' }}>
                            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                              <strong style={{ fontWeight: '900' }}>Rejection Reason:</strong>
                              <p style={{ margin: '5px 0 0', color: '#991b1b', fontWeight: '700' }}>{meetingDetails.meeting.rejectionReason}</p>
                            </div>
                          </div>
                        )}

                        {/* Attendees checklist */}
                        <div style={{ marginBottom: '25px' }}>
                          <h4 style={{ margin: '0 0 10px', fontSize: '0.85rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attended Members ({meetingDetails.meeting.attendees?.length || 0})</h4>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {meetingDetails.meeting.attendees?.map((att: any) => (
                              <span key={att._id} style={{ padding: '6px 12px', background: '#f1f5f9', color: '#334155', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '700' }}>
                                {att.name} ({att.mobile})
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Photos Gallery Section */}
                        <div style={{ marginBottom: '25px' }}>
                          <h4 style={{ margin: '0 0 10px', fontSize: '0.85rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Photos Evidence ({meetingDetails.media?.filter((m: any) => m.type === 'photo').length || 0})</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
                            {meetingDetails.media?.filter((m: any) => m.type === 'photo').map((media: any) => (
                              <div
                                key={media._id}
                                onClick={() => setLightboxImage(media.url)}
                                style={{ aspectRatio: '1', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', cursor: 'pointer', position: 'relative' }}
                                className="group"
                              >
                                <img src={media.url} alt="Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'opacity 0.2s' }} className="group-hover:opacity-100">
                                  <Eye size={16} />
                                </div>
                              </div>
                            ))}
                            {meetingDetails.media?.filter((m: any) => m.type === 'photo').length === 0 && <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>No photos attached.</p>}
                          </div>
                        </div>

                        {/* Videos Player Section */}
                        <div style={{ marginBottom: '25px' }}>
                          <h4 style={{ margin: '0 0 10px', fontSize: '0.85rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Videos Evidence ({meetingDetails.media?.filter((m: any) => m.type === 'video').length || 0})</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                            {meetingDetails.media?.filter((m: any) => m.type === 'video').map((media: any) => (
                              <div key={media._id} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
                                <video src={media.url} controls style={{ width: '100%', aspectRatio: '16/9', background: 'black' }} preload="none" />
                                {media.duration && <p style={{ margin: '5px 10px', fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)' }}>Duration: {Math.round(media.duration)}s</p>}
                              </div>
                            ))}
                            {meetingDetails.media?.filter((m: any) => m.type === 'video').length === 0 && <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>No videos attached.</p>}
                          </div>
                        </div>

                        {/* Geolocation Tag */}
                        {(() => {
                          const firstMediaGeo = meetingDetails.media?.find((m: any) => m.latitude && m.longitude);
                          if (!firstMediaGeo) return null;
                          return (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', fontSize: '0.75rem', color: '#166534', fontWeight: '800', width: 'fit-content' }}>
                              <MapPin size={14} />
                              Captured Coordinates: ({firstMediaGeo.latitude.toFixed(5)}, {firstMediaGeo.longitude.toFixed(5)})
                              {firstMediaGeo.capturedAt && <span> • {new Date(firstMediaGeo.capturedAt).toLocaleString()}</span>}
                            </div>
                          );
                        })()}

                      </div>
                    ) : (
                      <div style={{ padding: '80px 0', textAlign: 'center', color: '#94a3b8', fontWeight: '800', fontStyle: 'italic' }}>
                        Select a meeting log from the left side registry to review attendees and evidence media.
                      </div>
                    )}
                  </div>

                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {lightboxImage && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
            <div onClick={() => setLightboxImage(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }} />
            <button onClick={() => setLightboxImage(null)} style={{ position: 'absolute', right: '30px', top: '30px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={24} />
            </button>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <img src={lightboxImage} alt="Fullscreen Evidence" style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
