'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Target, Users, ArrowRight, Download, BookOpen, Sparkles } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { motion } from 'framer-motion';
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";

export default function EmployeeCampaignsPage() {
  const [assigned, setAssigned] = useState<any[]>([]);
  const [requested, setRequested] = useState<any[]>([]);
  const [available, setAvailable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    try {
      const res = await axios.get('/api/employee/campaigns');
      if (res.data.success) {
        setAssigned(res.data.data.assigned || []);
        setRequested(res.data.data.requested || []);
        setAvailable(res.data.data.available || []);
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

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-10">
        <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-secondary tracking-tight">Active Campaigns</h2>
            <p className="mt-4 text-primary font-bold text-sm md:text-lg uppercase tracking-wider">Track and manage your assigned community drives</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-soft flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Target size={20} /></div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Assigned</p>
                  <p className="text-lg font-black text-secondary">{assigned.length}</p>
                </div>
             </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white p-20 rounded-[40px] border border-gray-100 shadow-soft text-center">
            <div className="text-gray-400 font-bold italic animate-pulse">Syncing with campaign registry...</div>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {assigned.length > 0 && (
              <div>
                <h3 className="text-2xl font-black text-secondary mb-6 flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-green-500"></span> Assigned Campaigns</h3>
                <div className="flex flex-col gap-6">
                  {assigned.map((camp) => (
                    <CampaignCard key={camp._id} camp={camp} type="assigned" />
                  ))}
                </div>
              </div>
            )}

            {requested.length > 0 && (
              <div>
                <h3 className="text-2xl font-black text-secondary mb-6 flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Requested Campaigns</h3>
                <div className="flex flex-col gap-6">
                  {requested.map((camp) => (
                    <CampaignCard key={camp._id} camp={camp} type="requested" />
                  ))}
                </div>
              </div>
            )}

            {available.length > 0 && (
              <div>
                <h3 className="text-2xl font-black text-secondary mb-6 flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Available for Request</h3>
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
                 <h3 className="text-2xl font-black text-secondary">No campaigns found.</h3>
                 <p className="text-gray-400 font-bold mt-2">Wait for your senior to assign new community drives.</p>
              </div>
            )}
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
      const res = await axios.post('/api/employee/campaigns', { campaignId: camp._id });
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
          {type === 'assigned' ? 'Assigned' : type === 'requested' ? 'Pending Approval' : 'Available'}
        </span>
        <h3 className="text-2xl md:text-3xl font-black text-secondary mt-3 mb-2">{camp.title}</h3>
        <p className="text-gray-500 font-medium leading-relaxed max-w-2xl line-clamp-2">{camp.description}</p>
        
        <div className="flex flex-wrap gap-4 mt-6">
           {camp.location && (
             <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                📍 {camp.location}
             </div>
           )}
           <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <Calendar size={14} className="text-primary" /> {new Date(camp.startDate).toLocaleDateString()}
           </div>
           {camp.targetAudience && (
             <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <Users size={14} className="text-primary" /> {camp.targetAudience.split(',').length} Focus Areas
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
             <Link href="/employee/reports" className="no-underline flex-1 lg:flex-none">
               <button className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                 Post Activity <ArrowRight size={18} />
               </button>
             </Link>
           </>
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

