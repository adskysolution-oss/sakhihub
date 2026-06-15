'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import {
  History,
  Calendar,
  User,
  Users,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  RefreshCw,
  X,
  ExternalLink,
  Ban,
  Clock,
  ArrowRight
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

function HistoryPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Selected Campaign for Log details
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    searchParams.get('campaignId') || null
  );
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

  // Campaigns list
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campaignsPage, setCampaignsPage] = useState(1);
  const [campaignsTotalPages, setCampaignsTotalPages] = useState(1);
  const [campaignsLoading, setCampaignsLoading] = useState(true);

  // Logs list (Delivery Tracking)
  const [logs, setLogs] = useState<any[]>([]);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsSearch, setLogsSearch] = useState('');
  const [logsStatusFilter, setLogsStatusFilter] = useState('');

  // Fetch campaigns
  const fetchCampaigns = async (page = 1) => {
    setCampaignsLoading(true);
    try {
      const res = await axios.get(`/api/admin/communication/campaigns?page=${page}&limit=8`);
      if (res.data.success) {
        setCampaigns(res.data.data.campaigns || []);
        setCampaignsPage(page);
        setCampaignsTotalPages(res.data.data.pagination.pages || 1);
      }
    } catch (err) {
      toast.error('Failed to load campaign runs');
    } finally {
      setCampaignsLoading(false);
    }
  };

  // Fetch detailed delivery logs for the selected campaign
  const fetchDeliveryLogs = async (campaignId: string, page = 1, search = '', status = '') => {
    setLogsLoading(true);
    try {
      let url = `/api/admin/communication/logs?campaignId=${campaignId}&page=${page}&limit=10`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (status) url += `&status=${status}`;

      const res = await axios.get(url);
      if (res.data.success) {
        setLogs(res.data.data.logs || []);
        setLogsPage(page);
        setLogsTotalPages(res.data.data.pagination.pages || 1);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load recipient logs');
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Fetch campaign info and logs when selected campaign updates
  useEffect(() => {
    if (selectedCampaignId) {
      const fetchCampaignDetails = async () => {
        try {
          const res = await axios.get(`/api/admin/communication/campaigns/${selectedCampaignId}`);
          if (res.data.success) {
            setSelectedCampaign(res.data.data);
          }
        } catch (err) {
          toast.error('Failed to load campaign stats');
        }
      };

      fetchCampaignDetails();
      fetchDeliveryLogs(selectedCampaignId, 1, logsSearch, logsStatusFilter);
    } else {
      setSelectedCampaign(null);
      setLogs([]);
    }
  }, [selectedCampaignId]);

  const selectCampaign = (id: string) => {
    setSelectedCampaignId(id);
    setLogsPage(1);
    setLogsSearch('');
    setLogsStatusFilter('');
    
    // Update URL query param cleanly without reload
    const params = new URLSearchParams(window.location.search);
    params.set('campaignId', id);
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  const clearSelection = () => {
    setSelectedCampaignId(null);
    setSelectedCampaign(null);
    setLogs([]);
    router.push(window.location.pathname);
  };

  const handleCancelCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to abort this campaign? This stops all remaining queued emails.')) return;
    try {
      const res = await axios.patch(`/api/admin/communication/campaigns/${id}`, { status: 'cancelled' });
      if (res.data.success) {
        toast.success('Campaign aborted successfully');
        fetchCampaigns(campaignsPage);
        if (selectedCampaignId === id) {
          setSelectedCampaignId(null);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel campaign');
    }
  };

  const handleResumeCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to resume sending this campaign? This will queue the remaining unsent emails.')) return;
    try {
      const res = await axios.patch(`/api/admin/communication/campaigns/${id}`, { status: 'resume' });
      if (res.data.success) {
        toast.success('Campaign resumed successfully');
        fetchCampaigns(campaignsPage);
        // Refresh campaign details on UI
        const resDetail = await axios.get(`/api/admin/communication/campaigns/${id}`);
        if (resDetail.data.success) {
          setSelectedCampaign(resDetail.data.data);
        }
        fetchDeliveryLogs(id, 1, logsSearch, logsStatusFilter);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resume campaign');
    }
  };

  const handleLogsSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCampaignId) {
      fetchDeliveryLogs(selectedCampaignId, 1, logsSearch, logsStatusFilter);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-600 border-green-150';
      case 'sending':
        return 'bg-blue-50 text-blue-600 border-blue-150 animate-pulse';
      case 'scheduled':
        return 'bg-amber-50 text-amber-500 border-amber-150';
      case 'draft':
        return 'bg-gray-50 text-gray-500 border-gray-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-500 border-rose-150';
      case 'failed':
        return 'bg-red-50 text-red-600 border-red-150';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-150';
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black text-secondary">Campaign Execution History</h2>
            <p className="text-gray-400 font-bold mt-1">Audit detailed delivery records and logs of all email campaigns.</p>
          </div>
          <button
            onClick={() => {
              fetchCampaigns(campaignsPage);
              if (selectedCampaignId) {
                fetchDeliveryLogs(selectedCampaignId, logsPage, logsSearch, logsStatusFilter);
              }
            }}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-secondary border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
          >
            <RefreshCw size={14} className={campaignsLoading || logsLoading ? 'animate-spin' : ''} /> Refresh Feed
          </button>
        </div>

        {/* Master Details Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Campaigns List (Left section - 5 or 12 cols depending on selection) */}
          <div className={`${selectedCampaignId ? 'lg:col-span-5' : 'lg:col-span-12'} flex flex-col gap-5`}>
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
              <div className="p-6 border-b border-gray-50 bg-[#fafafa]">
                <h3 className="text-sm font-black text-secondary uppercase tracking-wider">Campaign Archives</h3>
              </div>

              {campaignsLoading && campaigns.length === 0 ? (
                <div className="p-10 text-center text-gray-400 italic">Loading campaign history...</div>
              ) : campaigns.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {campaigns.map((c) => {
                    const isSelected = selectedCampaignId === c._id;
                    return (
                      <div
                        key={c._id}
                        onClick={() => selectCampaign(c._id)}
                        className={`p-5 flex flex-col gap-3 transition-colors cursor-pointer ${isSelected ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-gray-50/50'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-secondary text-xs">{c.name}</h4>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">{c.subject}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest shrink-0 ${getStatusBadge(c.status)}`}>
                            {c.status}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-[9px] text-gray-400 font-bold border-t border-gray-100/50 pt-2.5">
                          <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(c.createdAt).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Users size={11} /> {c.recipientCount} targets</span>
                          {selectedCampaignId !== c._id && (
                            <span className="text-primary flex items-center gap-0.5 hover:underline">Explore <ArrowRight size={10} /></span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-10 text-center text-gray-400 italic font-semibold">No campaign history found.</div>
              )}

              {/* Pagination */}
              {campaignsTotalPages > 1 && (
                <div className="p-4 border-t border-gray-50 flex justify-between items-center bg-[#fafafa]">
                  <button
                    disabled={campaignsPage === 1}
                    onClick={() => fetchCampaigns(campaignsPage - 1)}
                    className="px-3 py-1.5 text-[8px] font-black uppercase tracking-wider bg-white rounded-lg border border-gray-150 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-[9px] font-bold text-gray-500">Page {campaignsPage} of {campaignsTotalPages}</span>
                  <button
                    disabled={campaignsPage === campaignsTotalPages}
                    onClick={() => fetchCampaigns(campaignsPage + 1)}
                    className="px-3 py-1.5 text-[8px] font-black uppercase tracking-wider bg-white rounded-lg border border-gray-150 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Delivery tracking Logs Explorer (Right section - 7 cols, visible only when campaign selected) */}
          {selectedCampaignId && (
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Campaign Quick Stats & Details */}
              {selectedCampaign && (
                <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-soft flex flex-col gap-4 relative">
                  <button
                    onClick={clearSelection}
                    className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-secondary transition-colors"
                  >
                    <X size={16} />
                  </button>

                  <div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-primary">Selected Campaign Execution Audit</span>
                    <h3 className="text-lg font-black text-secondary mt-1">{selectedCampaign.name}</h3>
                    <p className="text-[10px] text-gray-400 font-semibold mt-1">Subject line: <span className="font-bold text-secondary">"{selectedCampaign.subject}"</span></p>
                  </div>

                  {/* Execution Counter details */}
                  <div className="grid grid-cols-4 gap-4 text-center border-y border-gray-50 py-4">
                    <div>
                      <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider">Recipients</p>
                      <p className="font-bold text-secondary text-sm mt-0.5">{selectedCampaign.recipientCount}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-green-500 font-black uppercase tracking-wider">Delivered</p>
                      <p className="font-bold text-green-600 text-sm mt-0.5">{selectedCampaign.deliveredCount}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-red-500 font-black uppercase tracking-wider">Failed</p>
                      <p className="font-bold text-red-600 text-sm mt-0.5">{selectedCampaign.failedCount}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-primary font-black uppercase tracking-wider">Open Count</p>
                      <p className="font-bold text-primary text-sm mt-0.5">{selectedCampaign.openedCount}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold">
                    <span className="flex items-center gap-1"><User size={13} /> Created by: {selectedCampaign.createdBy?.fullName}</span>
                    <div className="flex items-center gap-2">
                      {['sending', 'cancelled', 'failed'].includes(selectedCampaign.status) && (
                        <button
                          onClick={() => handleResumeCampaign(selectedCampaign._id)}
                          className="px-3.5 py-1.5 text-green-600 bg-green-50 border border-green-100 hover:bg-green-100 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors flex items-center gap-1.5"
                        >
                          <RefreshCw size={12} /> Resume Run
                        </button>
                      )}
                      {['scheduled', 'sending'].includes(selectedCampaign.status) && (
                        <button
                          onClick={() => handleCancelCampaign(selectedCampaign._id)}
                          className="px-3.5 py-1.5 text-rose-500 bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors flex items-center gap-1.5"
                        >
                          <Ban size={12} /> Abort Run
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery logs list */}
              <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-50 bg-[#fafafa]">
                  <h4 className="text-sm font-black text-secondary uppercase tracking-wider">Recipient Delivery Log Status</h4>
                </div>

                {/* Filter and search logs */}
                <form onSubmit={handleLogsSearchSubmit} className="p-4 border-b border-gray-50 flex gap-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search recipient name, email..."
                      value={logsSearch}
                      onChange={(e) => setLogsSearch(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-gray-100 rounded-xl py-2 pl-9 pr-4 text-[10px] font-bold focus:outline-none placeholder:text-gray-300"
                    />
                  </div>
                  <select
                    value={logsStatusFilter}
                    onChange={(e) => setLogsStatusFilter(e.target.value)}
                    className="bg-[#f8f9fa] border border-gray-100 rounded-xl px-2 py-2 text-[10px] font-bold focus:outline-none"
                  >
                    <option value="">All Statuses</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                    <option value="pending">Pending</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-secondary text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-secondary-light transition-colors"
                  >
                    Filter
                  </button>
                </form>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-50 bg-[#fafafa]">
                        <th className="p-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Recipient</th>
                        <th className="p-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Delivery Status</th>
                        <th className="p-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Events</th>
                        <th className="p-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Sent Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logsLoading ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-gray-400 italic text-xs font-semibold">
                            Loading delivery logs...
                          </td>
                        </tr>
                      ) : logs.length > 0 ? (
                        logs.map((log) => (
                          <tr key={log._id} className="border-b border-gray-50 hover:bg-[#fafafa]/50 transition-colors">
                            <td className="p-4">
                              <p className="font-bold text-secondary text-xs">{log.recipientName || 'No Name'}</p>
                              <p className="text-[10px] text-gray-400 font-mono mt-0.5">{log.recipient}</p>
                            </td>
                            <td className="p-4">
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
                                <p className="text-[8px] text-rose-500 font-semibold mt-1 max-w-[150px] truncate" title={log.error}>
                                  Err: {log.error}
                                </p>
                              )}
                            </td>
                            <td className="p-4">
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
                            <td className="p-4 text-[10px] text-gray-400 font-semibold">
                              {log.sentAt ? (
                                <>
                                  <p>{new Date(log.sentAt).toLocaleDateString()}</p>
                                  <p className="text-[8px] text-gray-300 mt-0.5">{new Date(log.sentAt).toLocaleTimeString()}</p>
                                </>
                              ) : (
                                <span className="italic">—</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-gray-400 italic text-xs font-semibold">
                            No logs found matching criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Logs Pagination */}
                {logsTotalPages > 1 && (
                  <div className="p-4 border-t border-gray-50 flex justify-between items-center bg-[#fafafa]">
                    <button
                      disabled={logsPage === 1}
                      onClick={() => fetchDeliveryLogs(selectedCampaignId, logsPage - 1, logsSearch, logsStatusFilter)}
                      className="px-3 py-1.5 text-[8px] font-black uppercase tracking-wider bg-white rounded-lg border border-gray-150 disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <span className="text-[9px] font-bold text-gray-500">Page {logsPage} of {logsTotalPages}</span>
                    <button
                      disabled={logsPage === logsTotalPages}
                      onClick={() => fetchDeliveryLogs(selectedCampaignId, logsPage + 1, logsSearch, logsStatusFilter)}
                      className="px-3 py-1.5 text-[8px] font-black uppercase tracking-wider bg-white rounded-lg border border-gray-150 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-semibold animate-pulse">Loading Campaign History...</p>
      </div>
    }>
      <HistoryPageContent />
    </Suspense>
  );
}
