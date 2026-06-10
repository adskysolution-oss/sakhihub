'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import {
  Mail,
  Send,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  RefreshCw,
  Eye,
  XCircle,
  Percent,
  Play
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function CampaignsDashboard() {
  const [stats, setStats] = useState<any>({
    totalSent: 0,
    totalDelivered: 0,
    totalFailed: 0,
    openRate: 0,
    clickRate: 0,
    activeCampaigns: 0,
    scheduledCampaigns: 0
  });
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch analytics and campaigns list
      const [analyticsRes, campaignsRes] = await Promise.all([
        axios.get('/api/admin/communication/analytics'),
        axios.get('/api/admin/communication/campaigns?limit=5')
      ]);

      if (analyticsRes.data.success) {
        setStats(analyticsRes.data.data.summary);
      }
      if (campaignsRes.data.success) {
        setCampaigns(campaignsRes.data.data.campaigns || []);
      }
    } catch (err: any) {
      toast.error('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this scheduled campaign?')) return;
    try {
      const res = await axios.patch(`/api/admin/communication/campaigns/${id}`, { status: 'cancelled' });
      if (res.data.success) {
        toast.success('Campaign cancelled successfully');
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel campaign');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-600 border-green-100';
      case 'sending':
        return 'bg-blue-50 text-blue-600 border-blue-100 animate-pulse';
      case 'scheduled':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'draft':
        return 'bg-gray-50 text-gray-500 border-gray-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-500 border-rose-100';
      case 'failed':
        return 'bg-red-50 text-red-600 border-red-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black text-secondary">Communication Center</h2>
            <p className="text-gray-400 font-bold mt-1">Manage bulk email campaigns, automation templates, and audience delivery tracking.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={fetchData}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-secondary border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <Link
              href="/admin/communication/campaigns/new"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md shadow-primary/20"
            >
              <Plus size={16} /> Create Campaign
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-soft flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Mail size={22} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Total Sent</p>
              <p className="text-2xl font-black text-secondary mt-1">{stats.totalSent.toLocaleString()}</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-soft flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
              <CheckCircle size={22} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Delivered</p>
              <p className="text-2xl font-black text-secondary mt-1">
                {stats.totalDelivered.toLocaleString()}
                <span className="text-[10px] text-green-500 font-bold ml-1.5">({stats.deliveryRate}%)</span>
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-soft flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Percent size={22} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider font-mono">Open & Click</p>
              <p className="text-sm font-black text-secondary mt-1">
                Open: <span className="text-primary">{stats.openRate}%</span>
                <br />
                Click: <span className="text-secondary">{stats.clickRate}%</span>
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-soft flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Queue Status</p>
              <p className="text-xs font-black text-secondary mt-1 leading-relaxed">
                Active: <span className="text-blue-500 font-black">{stats.activeCampaigns}</span>
                <br />
                Scheduled: <span className="text-amber-500 font-black">{stats.scheduledCampaigns}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Campaign Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-primary to-[#ff477e] p-8 rounded-[32px] text-white flex flex-col justify-between shadow-lg shadow-primary/10 min-h-[220px]">
            <div>
              <Send size={32} />
              <h3 className="text-xl font-black mt-4">New Campaign</h3>
              <p className="text-white/80 text-xs font-semibold mt-1">Design rich HTML campaigns, target specific audience segment groups, and deploy instantly.</p>
            </div>
            <Link
              href="/admin/communication/campaigns/new"
              className="mt-6 inline-flex items-center justify-center w-fit px-6 py-3 bg-white text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-colors"
            >
              Start Designer
            </Link>
          </div>

          <div className="bg-gradient-to-br from-secondary to-[#485368] p-8 rounded-[32px] text-white flex flex-col justify-between shadow-lg shadow-secondary/15 min-h-[220px]">
            <div>
              <Calendar size={32} />
              <h3 className="text-xl font-black mt-4">Campaign Scheduler</h3>
              <p className="text-white/80 text-xs font-semibold mt-1">Schedule system notifications, payment alerts, and customized marketing templates for future delivery.</p>
            </div>
            <Link
              href="/admin/communication/history"
              className="mt-6 inline-flex items-center justify-center w-fit px-6 py-3 bg-white text-secondary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-colors"
            >
              View Scheduled
            </Link>
          </div>

          <div className="bg-gradient-to-br from-[#1a202c] to-[#3a4454] p-8 rounded-[32px] text-white flex flex-col justify-between shadow-lg min-h-[220px]">
            <div>
              <Plus size={32} />
              <h3 className="text-xl font-black mt-4">Template Builder</h3>
              <p className="text-white/80 text-xs font-semibold mt-1">Standardize and maintain welcome notes, registration approval templates, and invoices.</p>
            </div>
            <Link
              href="/admin/communication/templates"
              className="mt-6 inline-flex items-center justify-center w-fit px-6 py-3 bg-white text-neutral-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-colors"
            >
              Manage Templates
            </Link>
          </div>
        </div>

        {/* Recent Campaigns Section */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
            <div>
              <h3 className="text-lg font-black text-secondary">Recent Campaigns</h3>
              <p className="text-xs text-gray-400 font-bold mt-0.5">Quick overview of recent mailings and drafts.</p>
            </div>
            <Link
              href="/admin/communication/history"
              className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
            >
              See All History
            </Link>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-400 italic">Loading campaigns...</div>
          ) : campaigns.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {campaigns.map((c) => (
                <div key={c._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/30 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-black text-secondary text-sm">{c.name}</h4>
                      <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest ${getStatusBadge(c.status)}`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-medium mt-1">Subject: <span className="font-semibold text-secondary">{c.subject}</span></p>
                    <p className="text-[10px] text-gray-400 mt-1 font-semibold">
                      Created on: {new Date(c.createdAt).toLocaleDateString()} at {new Date(c.createdAt).toLocaleTimeString()} | By: {c.createdBy?.fullName || 'System'}
                    </p>
                  </div>

                  <div className="flex items-center gap-8 text-right shrink-0">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider">Recipients</p>
                        <p className="font-bold text-secondary text-xs mt-0.5">{c.recipientCount}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-green-500 font-black uppercase tracking-wider">Delivered</p>
                        <p className="font-bold text-green-600 text-xs mt-0.5">{c.deliveredCount}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-red-400 font-black uppercase tracking-wider">Failed</p>
                        <p className="font-bold text-red-500 text-xs mt-0.5">{c.failedCount}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {c.status === 'scheduled' && (
                        <button
                          onClick={() => handleCancel(c._id)}
                          className="px-3.5 py-2 text-rose-500 border border-rose-100 hover:bg-rose-50 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                        >
                          Cancel
                        </button>
                      )}
                      <Link
                        href={`/admin/communication/history?campaignId=${c._id}`}
                        className="px-3.5 py-2 text-secondary bg-[#f8f9fa] border border-[#eee] hover:bg-gray-100 rounded-xl text-[9px] font-black uppercase tracking-widest no-underline transition-all flex items-center gap-1.5"
                      >
                        <Eye size={12} /> View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center text-gray-400 font-semibold italic">No campaigns found. Click "Create Campaign" to get started!</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
