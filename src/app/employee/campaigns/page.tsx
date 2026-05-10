'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Target, Users, ArrowRight, Download, BookOpen, Sparkles } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function EmployeeCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    try {
      const res = await axios.get('/api/admin/campaigns');
      if (res.data.success) setCampaigns(res.data.data);
    } catch (err) {
      console.error("Failed to fetch campaigns", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  if (loading) return <div className="p-10 text-center font-bold text-gray-400">Loading Assigned Campaigns...</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-secondary tracking-tight">Active Campaigns</h2>
          <p className="mt-4 text-primary font-bold text-sm md:text-lg">Track and manage your assigned community drives</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-soft flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Target size={20} /></div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Active</p>
                <p className="text-lg font-black text-secondary">{campaigns.length}</p>
              </div>
           </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {campaigns.length > 0 ? campaigns.map((camp) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={camp._id} 
            className="bg-white p-6 md:p-10 rounded-[40px] border border-gray-100 shadow-soft hover:border-primary/30 transition-all flex flex-col lg:flex-row lg:items-center gap-8"
          >
            <div className="flex-1">
              <span className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">Ongoing</span>
              <h3 className="text-2xl md:text-3xl font-black text-secondary mt-3 mb-2">{camp.title}</h3>
              <p className="text-gray-500 font-medium leading-relaxed max-w-2xl line-clamp-2">{camp.description}</p>
              
              <div className="flex flex-wrap gap-4 mt-6">
                 <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <Calendar size={14} className="text-primary" /> {new Date(camp.startDate).toLocaleDateString()}
                 </div>
                 <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <Users size={14} className="text-primary" /> {camp.targetAudience?.split(',').length || 0} Key Focus Areas
                 </div>
              </div>
            </div>

            <div className="flex flex-wrap lg:flex-nowrap gap-4 shrink-0">
               {camp.trainingMaterial && (
                 <a href={camp.trainingMaterial} target="_blank" className="no-underline">
                   <button className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-gray-50 text-secondary font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100">
                     <BookOpen size={18} /> Training
                   </button>
                 </a>
               )}
               {camp.posterFiles?.[0] && (
                 <a href={camp.posterFiles[0]} download className="no-underline">
                   <button className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-gray-50 text-secondary font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100">
                     <Download size={18} /> Assets
                   </button>
                 </a>
               )}
               <Link href="/employee/reports" className="no-underline">
                 <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                   Post Activity <ArrowRight size={18} />
                 </button>
               </Link>
            </div>
          </motion.div>
        )) : (
          <div className="bg-white p-20 rounded-[40px] border-2 border-dashed border-gray-100 text-center">
             <Sparkles size={60} className="text-gray-200 mx-auto mb-6" />
             <h3 className="text-2xl font-black text-secondary">No active campaigns assigned.</h3>
             <p className="text-gray-400 font-bold mt-2">Wait for the admin to assign new community drives.</p>
          </div>
        )}
      </div>
    </div>
  );
}

