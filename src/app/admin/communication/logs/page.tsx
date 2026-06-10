'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import {
  ClipboardList,
  Search,
  RefreshCw,
  Mail,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function DeliveryLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogsCount, setTotalLogsCount] = useState(0);

  const fetchCampaigns = async () => {
    try {
      const res = await axios.get('/api/admin/communication/campaigns?limit=100');
      if (res.data.success) {
        setCampaigns(res.data.data.campaigns || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLogs = async (currentPage = 1) => {
    setLoading(true);
    try {
      let url = `/api/admin/communication/logs?page=${currentPage}&limit=20`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (selectedCampaign) url += `&campaignId=${selectedCampaign}`;
      if (selectedStatus) url += `&status=${selectedStatus}`;

      const res = await axios.get(url);
      if (res.data.success) {
        setLogs(res.data.data.logs || []);
        setPage(currentPage);
        setTotalPages(res.data.data.pagination.pages || 1);
        setTotalLogsCount(res.data.data.pagination.total || 0);
      }
    } catch (err) {
      toast.error('Failed to load delivery logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchLogs(1);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCampaign('');
    setSelectedStatus('');
    setTimeout(() => {
      fetchLogs(1);
    }, 50);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black text-secondary">Delivery Tracking logs</h2>
            <p className="text-gray-400 font-bold mt-1">Audit individual delivery statuses, errors, and user interaction histories in real-time.</p>
          </div>
          <button
            onClick={() => fetchLogs(page)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-secondary border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Logs
          </button>
        </div>

        {/* Filters and search Form */}
        <form onSubmit={handleSearchSubmit} className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-soft flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search recipient name, email address, or subject line..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f8f9fa] border border-gray-100 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold focus:outline-none placeholder:text-gray-300"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="bg-[#f8f9fa] border border-gray-100 rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none flex-1 md:flex-initial md:w-[180px]"
            >
              <option value="">All Campaigns</option>
              {campaigns.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#f8f9fa] border border-gray-100 rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none flex-1 md:flex-initial md:w-[130px]"
            >
              <option value="">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
            <button
              type="submit"
              className="px-6 bg-secondary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary-light transition-colors"
            >
              Filter
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 text-gray-500 bg-[#f8f9fa] border border-gray-100 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Logs Data Table */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50 bg-[#fafafa]">
                  <th className="p-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Recipient Details</th>
                  <th className="p-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Campaign Reference</th>
                  <th className="p-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Subject</th>
                  <th className="p-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Delivery Status</th>
                  <th className="p-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Audit Trails</th>
                  <th className="p-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Sent Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-400 italic text-xs font-semibold">
                      Loading communication archives...
                    </td>
                  </tr>
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log._id} className="border-b border-gray-50 hover:bg-[#fafafa]/30 transition-colors">
                      <td className="p-5">
                        <p className="font-bold text-secondary text-xs">{log.recipientName || 'Recipient'}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{log.recipient}</p>
                        {log.recipientUser && (
                          <span className="inline-block mt-1 bg-gray-50 border px-1.5 py-0.2 rounded text-[7px] text-gray-400 font-black uppercase tracking-widest">
                            {log.recipientUser.role?.replace('_', ' ')}
                          </span>
                        )}
                      </td>
                      <td className="p-5">
                        {log.campaignId ? (
                          <p className="font-bold text-secondary text-xs max-w-[150px] truncate" title={log.campaignId.name}>
                            {log.campaignId.name}
                          </p>
                        ) : (
                          <span className="text-gray-400 text-[10px] italic font-semibold">Direct Notification</span>
                        )}
                      </td>
                      <td className="p-5 text-xs font-semibold text-secondary max-w-[180px] truncate" title={log.subject}>
                        {log.subject}
                      </td>
                      <td className="p-5">
                        <span className={`inline-block px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest ${
                          log.status === 'success' || log.status === 'delivered'
                            ? 'bg-green-50 text-green-600 border-green-100'
                            : log.status === 'failed'
                            ? 'bg-red-50 text-red-600 border-red-100'
                            : 'bg-gray-50 text-gray-500 border-gray-150'
                        }`}>
                          {log.status}
                        </span>
                        {log.error && (
                          <p className="text-[8px] text-red-500 font-semibold mt-1 max-w-[150px] truncate" title={log.error}>
                            {log.error}
                          </p>
                        )}
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col gap-1 text-[8px] font-bold">
                          <span className={`flex items-center gap-1 ${log.delivered ? 'text-green-600' : 'text-gray-300'}`}>
                            ● Delivered
                          </span>
                          <span className={`flex items-center gap-1 ${log.opened ? 'text-primary' : 'text-gray-300'}`}>
                            ● Opened
                          </span>
                          <span className={`flex items-center gap-1 ${log.clicked ? 'text-secondary' : 'text-gray-300'}`}>
                            ● Clicked
                          </span>
                        </div>
                      </td>
                      <td className="p-5 text-xs text-secondary font-bold">
                        <p className="flex items-center gap-1"><Clock size={12} className="text-gray-400" /> {new Date(log.createdAt).toLocaleDateString()}</p>
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{new Date(log.createdAt).toLocaleTimeString()}</p>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-400 italic text-xs font-semibold">
                      No matching logs found in system registry.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-5 border-t border-gray-50 flex justify-between items-center bg-[#fafafa]">
              <button
                disabled={page === 1}
                onClick={() => fetchLogs(page - 1)}
                className="flex items-center gap-1 px-4 py-2 bg-white text-secondary border border-gray-150 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xs hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Showing {logs.length} of {totalLogsCount} logs | Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => fetchLogs(page + 1)}
                className="flex items-center gap-1 px-4 py-2 bg-white text-secondary border border-gray-150 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xs hover:bg-gray-50 disabled:opacity-50"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
