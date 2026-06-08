'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Download, RefreshCw, DollarSign, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

interface ReportFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userRole: string;
  reportType: string;
  onConfirm: (filters: {
    format: string;
    dateRange: string;
    startDate: string;
    endDate: string;
    status: string;
    paymentType: string;
    scope: string;
  }) => void;
}

export default function ReportFilterModal({
  isOpen,
  onClose,
  userId,
  userRole,
  reportType,
  onConfirm
}: ReportFilterModalProps) {
  const [format, setFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState('month'); // default to 'month'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('all');
  const [paymentType, setPaymentType] = useState('all');
  const [scope, setScope] = useState('entire');

  // Preview state
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewData, setPreviewData] = useState<{
    count: number;
    totalPaidAmount: number;
    totalPendingAmount: number;
  } | null>(null);

  // Determine if filters are applicable
  const isCollectionReport = reportType === 'collection' || reportType === 'payment' || reportType === 'membership';
  const isNetworkReport = reportType === 'network' || reportType === 'performance' || reportType === 'member' || reportType === 'activity';
  const showPaymentTypeFilter = isCollectionReport;
  
  // Scope filter: Vendor/Sub-Vendor only, and only for reports containing multi-node aggregates
  const showScopeFilter = (userRole === 'vendor' || userRole === 'sub_vendor') && 
    (reportType === 'network' || reportType === 'collection' || reportType === 'performance' || reportType === 'profile');

  // Reset states when modal is opened for a different report type
  useEffect(() => {
    if (isOpen) {
      setFormat('pdf');
      setDateRange('month');
      setStartDate('');
      setEndDate('');
      setStatus('all');
      setPaymentType('all');
      setScope('entire');
      setPreviewData(null);
    }
  }, [isOpen, reportType]);

  // Run preview API query
  useEffect(() => {
    if (!isOpen || !userId) return;

    let active = true;
    const fetchPreview = async () => {
      setLoadingPreview(true);
      try {
        const queryParams = new URLSearchParams({
          reportType,
          preview: 'true',
          dateRange,
          scope,
          status,
          paymentType,
          startDate,
          endDate
        });

        const res = await axios.get(`/api/admin/reports/users/${userId}?${queryParams.toString()}`);
        if (active && res.data.success) {
          setPreviewData({
            count: res.data.count,
            totalPaidAmount: res.data.totalPaidAmount,
            totalPendingAmount: res.data.totalPendingAmount
          });
        }
      } catch (err) {
        console.error('Failed to fetch report preview', err);
      } finally {
        if (active) setLoadingPreview(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchPreview();
    }, 300);

    return () => {
      active = false;
      clearTimeout(delayDebounce);
    };
  }, [isOpen, userId, reportType, dateRange, startDate, endDate, status, paymentType, scope]);

  if (!isOpen) return null;

  const handleGenerate = () => {
    onConfirm({
      format,
      dateRange,
      startDate,
      endDate,
      status,
      paymentType,
      scope
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-secondary-dark/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[36px] shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-gray-50 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl font-black text-secondary tracking-tight">Report Configuration</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              {reportType.toUpperCase()} REPORT • ROLE: {userRole.replace('_', ' ').toUpperCase()}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-secondary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Filters */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 custom-scrollbar flex-1">
          
          {/* Format Selection */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2.5">Export Format</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'pdf', label: 'PDF Document', color: 'border-secondary-light text-secondary bg-secondary/5' },
                { id: 'excel', label: 'Excel Spread', color: 'border-emerald-200 text-emerald-600 bg-emerald-50/50' },
                { id: 'csv', label: 'CSV File', color: 'border-blue-200 text-blue-600 bg-blue-50/50' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFormat(item.id)}
                  className={`px-4 py-3 rounded-2xl border-2 text-xs font-black uppercase tracking-wider text-center transition-all ${
                    format === item.id 
                      ? `${item.color} border-current shadow-md scale-[1.02]` 
                      : 'border-gray-100 text-gray-400 hover:border-gray-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Selector */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2.5">Date Range Filter</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[
                { id: 'today', label: 'Today' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: 'week', label: 'This Week' },
                { id: 'month', label: 'This Month' },
                { id: 'custom', label: 'Custom' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setDateRange(item.id)}
                  className={`py-2 px-1 rounded-xl border text-[10px] font-bold uppercase tracking-wider text-center transition-all ${
                    dateRange === item.id 
                      ? 'border-secondary bg-secondary text-white shadow-sm' 
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Inputs */}
          {dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-secondary focus:outline-none focus:border-secondary"
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-secondary focus:outline-none focus:border-secondary"
                />
              </div>
            </div>
          )}

          {/* Status filter selection */}
          {(isCollectionReport || isNetworkReport) && (
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Status Filter</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-bold text-secondary focus:outline-none focus:border-secondary cursor-pointer"
              >
                <option value="all">All Statuses</option>
                {isCollectionReport ? (
                  <>
                    <option value="Paid">Paid Only</option>
                    <option value="Pending">Pending Only</option>
                    <option value="Failed">Failed Only</option>
                    <option value="Unpaid">Unpaid Only</option>
                  </>
                ) : (
                  <>
                    <option value="active">Active Only</option>
                    <option value="pending">Pending Only</option>
                    <option value="rejected">Rejected Only</option>
                  </>
                )}
              </select>
            </div>
          )}

          {/* Payment Type Filter */}
          {showPaymentTypeFilter && (
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Payment Type</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-bold text-secondary focus:outline-none focus:border-secondary cursor-pointer"
              >
                <option value="all">All Payment Types</option>
                <option value="membership">Membership Fee</option>
                <option value="deposit">Security Deposit</option>
                <option value="subscription">Subscription Fee</option>
              </select>
            </div>
          )}

          {/* Network Scope filter */}
          {showScopeFilter && (
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Network Downline Scope</label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-bold text-secondary focus:outline-none focus:border-secondary cursor-pointer"
              >
                <option value="entire">Entire Downline Network (Recursive)</option>
                <option value="direct">Direct Children Only (1 Level Down)</option>
              </select>
            </div>
          )}

          {/* Preview Section */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 p-6 rounded-[28px] border border-gray-100 space-y-4 relative overflow-hidden">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <FileText size={12} className="text-secondary" /> Live Filter Preview
            </h4>

            {loadingPreview ? (
              <div className="py-4 flex flex-col items-center justify-center gap-2">
                <RefreshCw size={20} className="text-secondary animate-spin" />
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Querying database...</span>
              </div>
            ) : previewData ? (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white p-3 rounded-2xl border border-gray-100">
                  <p className="text-lg font-black text-secondary">{previewData.count}</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase mt-0.5">Records</p>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-gray-100">
                  <p className="text-lg font-black text-green-600">₹{previewData.totalPaidAmount.toLocaleString()}</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase mt-0.5">Paid Amt</p>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-gray-100">
                  <p className="text-lg font-black text-amber-500">₹{previewData.totalPendingAmount.toLocaleString()}</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase mt-0.5">Pending</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-xs font-bold text-gray-400 italic">
                Select configuration to load preview.
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 border-2 border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={loadingPreview || (previewData !== null && previewData.count === 0)}
            className="flex-1 py-3.5 bg-secondary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-secondary-dark hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:pointer-events-none"
          >
            <Download size={14} /> Generate Report
          </button>
        </div>

      </div>
    </div>
  );
}
