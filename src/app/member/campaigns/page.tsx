'use client';

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";
import { 
  Target, Sparkles, ShieldAlert, Award, 
  Clock, ArrowRight, ShieldCheck, CheckCircle2, 
  HelpCircle, ChevronRight, BookmarkCheck, Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from 'sonner';

export default function MemberCampaignsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<{ assigned: any[]; requested: any[]; available: any[] }>({
    assigned: [],
    requested: [],
    available: []
  });
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [joiningCampaignId, setJoiningCampaignId] = useState<string>("");

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('/api/member/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    }
  };

  const fetchCampaigns = async () => {
    setCampaignLoading(true);
    try {
      const res = await axios.get('/api/member/campaigns');
      if (res.data.success) {
        setCampaigns(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load campaigns", err);
    } finally {
      setCampaignLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchDashboardData();
      setLoading(false);
    };
    if (user) init();
  }, [user]);

  useEffect(() => {
    if (data?.fieldRecord?.assignedEmployeeId || data?.profile?.parentVendorId) {
      fetchCampaigns();
    }
  }, [data]);

  const handleJoinCampaign = async (campaignId: string) => {
    setJoiningCampaignId(campaignId);
    try {
      const res = await axios.post('/api/member/campaigns', { campaignId });
      if (res.data.success) {
        toast.success("Your request to join the campaign was submitted successfully!");
        await fetchCampaigns();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to join campaign");
    } finally {
      setJoiningCampaignId("");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-100 border-t-primary rounded-full animate-spin"></div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing campaign catalog...</p>
        </div>
      </DashboardLayout>
    );
  }

  const hasEmployeeConnection = !!(data?.fieldRecord?.assignedEmployeeId || data?.profile?.parentVendorId);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-6 px-4">
        {/* Page Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
              <Target className="text-primary w-10 h-10" /> Campaigns & Events
            </h1>
            <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-xs">
              Participate in community development campaigns and distribute essential care kits
            </p>
          </div>
          {hasEmployeeConnection && (
            <div className="px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 text-xs font-black uppercase tracking-widest flex items-center gap-2 self-start md:self-auto">
              <ShieldCheck size={16} /> Verified Regional Access
            </div>
          )}
        </div>

        {!hasEmployeeConnection ? (
          <div className="p-12 text-center bg-pink-50/20 border-2 border-dashed border-pink-100 rounded-[35px] max-w-xl mx-auto my-12 shadow-sm">
            <ShieldAlert size={48} className="mx-auto text-primary mb-4 animate-pulse" />
            <h4 className="text-xl font-bold text-secondary">Unlock Campaign Participation</h4>
            <p className="text-gray-400 text-sm font-semibold max-w-md mx-auto mt-2 leading-relaxed">
              Connecting with a local Sakhi Hero (Employee) is required to view and join active regional awareness campaigns. Please coordinate with your local coordinator.
            </p>
          </div>
        ) : campaignLoading ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-gray-100 border-t-primary rounded-full animate-spin"></div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing campaign catalog...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* 1. Joined campaigns */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <BookmarkCheck size={18} />
                </div>
                <h2 className="text-xl font-black text-secondary uppercase tracking-wider">Joined Campaigns ({campaigns.assigned.length})</h2>
              </div>
              
              {campaigns.assigned.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 border border-gray-100 rounded-3xl">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">You haven't joined any campaigns yet</p>
                  <p className="text-gray-400 text-xs mt-1">Request enrollment in available campaigns listed below to begin participating.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {campaigns.assigned.map(c => (
                    <div 
                      key={c._id} 
                      className="p-6 bg-emerald-50/50 border border-emerald-100/80 rounded-[30px] flex justify-between items-center gap-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                    >
                      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:scale-125 transition-all"></div>
                      <div className="space-y-2">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5">
                          <CheckCircle2 size={12} /> Active Participant
                        </span>
                        <h4 className="font-black text-secondary text-base leading-tight mt-2">{c.campaignName}</h4>
                        <div className="flex gap-4 items-center text-gray-500 text-[10px] font-bold uppercase">
                          <span>Code: {c.campaignCode}</span>
                          <span>•</span>
                          <span>{c.district || 'All Districts'}</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100 shrink-0">
                        <Award size={20} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 2. Pending request campaigns */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Clock size={18} />
                </div>
                <h2 className="text-xl font-black text-secondary uppercase tracking-wider">Awaiting Approval ({campaigns.requested.length})</h2>
              </div>
              
              {campaigns.requested.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 border border-gray-100 rounded-3xl">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">No pending requests</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {campaigns.requested.map(c => (
                    <div 
                      key={c._id} 
                      className="p-6 bg-amber-50/50 border border-amber-100/80 rounded-[30px] flex justify-between items-center gap-6 shadow-sm relative overflow-hidden group"
                    >
                      <div className="space-y-2">
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 animate-pulse">
                          <Clock size={12} /> Pending Hero Review
                        </span>
                        <h4 className="font-black text-secondary text-base leading-tight mt-2">{c.campaignName}</h4>
                        <div className="flex gap-4 items-center text-gray-500 text-[10px] font-bold uppercase">
                          <span>Code: {c.campaignCode}</span>
                          <span>•</span>
                          <span>{c.district || 'All Districts'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 3. Available to join */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                  <Sparkles size={18} />
                </div>
                <h2 className="text-xl font-black text-secondary uppercase tracking-wider">Available Campaigns</h2>
              </div>

              {campaigns.available.length === 0 ? (
                <div className="p-10 text-center bg-emerald-50/20 border border-emerald-100 rounded-3xl">
                  <p className="text-emerald-700 text-sm font-black uppercase tracking-wider">★ All set!</p>
                  <p className="text-gray-400 text-xs mt-1">You have requested or joined all regional campaigns available in your block today.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {campaigns.available.map(c => (
                    <div 
                      key={c._id} 
                      className="p-6 bg-white border border-gray-100 hover:border-primary/20 rounded-[30px] flex justify-between items-center gap-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                    >
                      <div className="space-y-2">
                        <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-[9px] font-black uppercase tracking-widest inline-block">
                          Open Enrollment
                        </span>
                        <h4 className="font-black text-secondary text-base leading-tight mt-2">{c.campaignName}</h4>
                        <div className="flex gap-4 items-center text-gray-400 text-[10px] font-bold uppercase">
                          <span>Code: {c.campaignCode}</span>
                          <span>•</span>
                          <span>{c.district || 'All Districts'}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleJoinCampaign(c._id)}
                        disabled={joiningCampaignId === c._id}
                        className="px-6 py-3.5 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-md hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        {joiningCampaignId === c._id ? 'Joining...' : 'Request Join'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
