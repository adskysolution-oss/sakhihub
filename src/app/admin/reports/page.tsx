'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { 
  BarChart, PieChart, TrendingUp, Download, 
  Calendar, Users, IndianRupee, Map, Award,
  ArrowUpRight, ArrowDownRight, Settings, FileCheck, 
  Clock, Trash2, FolderOpen, MapPin, RefreshCw, FileText
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

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

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'builder' | 'templates' | 'audit'>('overview');
  
  // Data Overview State
  const [overviewData, setOverviewData] = useState<any>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  // Saved Templates State
  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

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
    }
  }, [activeTab]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <DashboardLayout>
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
                  <option value="Block Employee">Block Employee</option>
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
                placeholder="Name template to save configurations (Optional)..."
                value={saveTemplateName}
                onChange={(e) => setSaveTemplateName(e.target.value)}
                style={{ flex: 1, padding: '14px 18px', borderRadius: '16px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem', fontWeight: '600' }}
              />
            </div>
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
                        <button
                          onClick={() => handleRunTemplate(t)}
                          style={{ border: 'none', background: '#f0fdf4', color: '#166534', padding: '8px 14px', borderRadius: '10px', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Download size={12} /> Run
                        </button>
                        <button
                          onClick={() => handleLoadTemplate(t)}
                          style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', padding: '8px 14px', borderRadius: '10px', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <FolderOpen size={12} /> Load
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(t._id)}
                          style={{ border: 'none', background: '#fef2f2', color: '#991b1b', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
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
    </DashboardLayout>
  );
}
