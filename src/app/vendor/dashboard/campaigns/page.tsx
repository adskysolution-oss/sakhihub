'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { Target, Calendar, Plus, ExternalLink, Users, IndianRupee, BookOpen, Download, ArrowRight, Sparkles, Check, X, Clock, Mail, Phone, MapPin } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function VendorCampaigns() {
  const [assigned, setAssigned] = useState<any[]>([]);
  const [requested, setRequested] = useState<any[]>([]);
  const [available, setAvailable] = useState<any[]>([]);
  const [teamRequests, setTeamRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my' | 'team'>('my');

  const fetchCampaigns = async () => {
    try {
      const [campRes, reqRes] = await Promise.all([
        axios.get('/api/vendor/campaigns'),
        axios.get('/api/vendor/campaigns/requests')
      ]);
      
      if (campRes.data.success) {
        setAssigned(campRes.data.data.assigned || []);
        setRequested(campRes.data.data.requested || []);
        setAvailable(campRes.data.data.available || []);
      }
      
      if (reqRes.data.success) {
        setTeamRequests(reqRes.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch campaigns", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleAction = async (campaignId: string, userId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await axios.post('/api/campaigns/assign', {
        campaignId,
        targetUserId: userId,
        status: status === 'approved' ? 'assigned' : 'rejected'
      });
      if (res.data.success) {
        fetchCampaigns();
      }
    } catch (err) {
      console.error("Action failed", err);
      alert("Failed to process request");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <header className="flex justify-between items-start flex-wrap gap-6 mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-secondary">Campaign Hub</h1>
            <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">Manage your drives and team assignments</p>
          </div>
          <div className="flex bg-gray-100 p-1.5 rounded-2xl">
             <button 
               onClick={() => setActiveTab('my')}
               className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'my' ? 'bg-white text-secondary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
             >
               My Campaigns
             </button>
             <button 
               onClick={() => setActiveTab('team')}
               className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'team' ? 'bg-white text-secondary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
             >
               Team Requests
               {teamRequests.length > 0 && (
                 <span className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px]">{teamRequests.length}</span>
               )}
             </button>
          </div>
        </header>

        {loading ? (
          <div className="bg-white p-20 rounded-[40px] border border-gray-100 shadow-soft text-center">
            <div className="text-gray-400 font-bold italic animate-pulse">Syncing with campaign registry...</div>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            
            <AnimatePresence mode="wait">
              {activeTab === 'my' ? (
                <motion.div 
                  key="my-tabs"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-10"
                >
                  {/* Assigned Campaigns */}
                  {assigned.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-black text-secondary mb-6 flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-green-500"></span> Assigned to Me</h3>
                      <div className="flex flex-col gap-6">
                        {assigned.map((camp) => (
                          <CampaignCard key={camp._id} camp={camp} type="assigned" onFetch={fetchCampaigns} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Requested Campaigns */}
                  {requested.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-black text-secondary mb-6 flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Pending My Approval</h3>
                      <div className="flex flex-col gap-6">
                        {requested.map((camp) => (
                          <CampaignCard key={camp._id} camp={camp} type="requested" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Available Campaigns */}
                  {available.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-black text-secondary mb-6 flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Available for Me</h3>
                      <div className="flex flex-col gap-6">
                        {available.map((camp) => (
                          <CampaignCard key={camp._id} camp={camp} type="available" onFetch={fetchCampaigns} />
                        ))}
                      </div>
                    </div>
                  )}

                  {assigned.length === 0 && requested.length === 0 && available.length === 0 && (
                    <div className="bg-white p-20 rounded-[40px] border-2 border-dashed border-gray-100 text-center">
                       <Sparkles size={60} className="text-gray-200 mx-auto mb-6" />
                       <h3 className="text-2xl font-black text-secondary">No personal campaigns found.</h3>
                       <p className="text-gray-400 font-bold mt-2">Wait for the admin to launch new community drives.</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="team-tabs"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-6"
                >
                  <h3 className="text-2xl font-black text-secondary mb-2 flex items-center gap-3">
                    <Users size={28} className="text-primary" /> Downline Requests
                  </h3>
                  <p className="text-gray-400 font-bold mb-6 text-sm">Approve or reject campaign requests from your Sub-Vendors and Employees.</p>
                  
                  {teamRequests.length > 0 ? (
                    <div className="grid gap-4">
                      {teamRequests.map((req, i) => (
                        <div key={i} className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-soft flex flex-col md:flex-row justify-between items-center gap-6">
                          <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                              <Target size={28} />
                            </div>
                            <div>
                              <h4 className="text-xl font-black text-secondary">{req.campaignTitle}</h4>
                              <div className="flex flex-wrap items-center gap-3 mt-1 mb-2">
                                <span className="text-sm font-bold text-gray-500">{req.userName}</span>
                                <span className="px-3 py-1 bg-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400 rounded-full">{req.userRole}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                {req.userEmail && (
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <Mail size={12} className="text-primary" /> {req.userEmail}
                                  </div>
                                )}
                                {req.userMobile && (
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <Phone size={12} className="text-primary" /> {req.userMobile}
                                  </div>
                                )}
                                {req.userLocation && (
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <MapPin size={12} className="text-primary" /> {req.userLocation}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 w-full md:w-auto">
                            <button 
                              onClick={() => handleAction(req.campaignId, req.userId, 'rejected')}
                              className="flex-1 md:flex-none p-4 rounded-2xl bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                            >
                              <X size={20} />
                            </button>
                            <button 
                              onClick={() => handleAction(req.campaignId, req.userId, 'approved')}
                              className="flex-1 md:flex-none py-4 px-8 rounded-2xl bg-green-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-green-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                              <Check size={20} /> Approve Assignment
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-20 rounded-[40px] border-2 border-dashed border-gray-100 text-center">
                       <Clock size={60} className="text-gray-200 mx-auto mb-6" />
                       <h3 className="text-2xl font-black text-secondary">No pending team requests.</h3>
                       <p className="text-gray-400 font-bold mt-2">When your team members request campaigns, they will appear here.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function CampaignCard({ camp, type, onFetch }: { camp: any, type: string, onFetch?: () => void }) {
  const [requesting, setRequesting] = useState(false);

  const handleRequest = async () => {
    setRequesting(true);
    try {
      const res = await axios.post('/api/vendor/campaigns', { campaignId: camp._id });
      if (res.data.success) {
        if (onFetch) onFetch();
      } else {
        alert(res.data.message || 'Failed to request campaign');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to request campaign');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 md:p-10 rounded-[40px] border border-gray-100 shadow-soft hover:border-primary/30 transition-all flex flex-col lg:flex-row lg:items-center gap-8"
    >
      {camp.bannerImage && (
        <div className="w-full lg:w-48 h-32 shrink-0 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
          <img src={camp.bannerImage} alt={camp.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex-1">
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
          type === 'assigned' ? 'bg-green-50 text-green-600' :
          type === 'requested' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
        }`}>
          {type === 'assigned' ? 'Assigned' : type === 'requested' ? 'Pending Admin Approval' : 'Available'}
        </span>
        <h3 className="text-2xl md:text-3xl font-black text-secondary mt-3 mb-2">{camp.title || camp.name}</h3>
        <p className="text-gray-500 font-medium leading-relaxed max-w-2xl line-clamp-2">{camp.description}</p>
        
        <div className="flex flex-wrap gap-4 mt-6">
           {camp.location && (
             <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                📍 {camp.location}
             </div>
           )}
           {camp.startDate && (
             <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <Calendar size={14} className="text-primary" /> {new Date(camp.startDate).toLocaleDateString()}
             </div>
           )}
           {camp.charges !== undefined && (
             <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <IndianRupee size={14} className="text-primary" /> Charges: {camp.charges}
             </div>
           )}
        </div>
      </div>

      <div className="flex flex-wrap lg:flex-nowrap gap-4 shrink-0 mt-4 lg:mt-0">
         {type === 'assigned' && (
           <>
             {camp.trainingMaterial && (
               <a href={camp.trainingMaterial} target="_blank" className="no-underline flex-1 lg:flex-none">
                 <button className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gray-50 text-secondary font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100">
                   <BookOpen size={18} /> Training
                 </button>
               </a>
             )}
             {camp.posterFiles?.[0] && (
               <a href={camp.posterFiles[0]} download className="no-underline flex-1 lg:flex-none">
                 <button className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gray-50 text-secondary font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100">
                   <Download size={18} /> Assets
                 </button>
               </a>
             )}
           </>
         )}

         {type === 'requested' && (
           <button 
             disabled
             className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-amber-50 text-amber-600 font-black text-xs uppercase tracking-widest border border-amber-100 cursor-not-allowed"
           >
             <Clock size={18} /> Admin Review Pending
           </button>
         )}

         {type === 'available' && (
           <button 
             onClick={handleRequest} 
             disabled={requesting}
             className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest transition-all ${
               requesting ? 'bg-gray-400 cursor-wait' : 'bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95'
             }`}
           >
             {requesting ? 'Requesting...' : 'Request Campaign'}
           </button>
         )}
      </div>
    </motion.div>
  );
}
