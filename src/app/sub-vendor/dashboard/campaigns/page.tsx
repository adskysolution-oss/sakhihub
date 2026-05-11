'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { Target, Search, Plus, ExternalLink, Calendar, Users, IndianRupee } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

export default function SubVendorCampaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await axios.get('/api/sub-vendor/campaigns');
        if (res.data.success) setCampaigns(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <header>
          <h1 className="text-3xl md:text-4xl font-black text-secondary">Campaigns</h1>
          <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">Assigned recruitment programs and performance targets</p>
        </header>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft">
          {loading ? (
            <div className="p-20 text-center text-gray-400 font-bold italic animate-pulse">Syncing campaigns...</div>
          ) : campaigns.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Target size={40} className="text-gray-200" />
              </div>
              <p className="text-gray-400 font-bold italic">No active campaigns assigned to your sub-vendor code.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {campaigns.map((camp, i) => (
                <motion.div
                  key={camp._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 rounded-[32px] border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-xl transition-all group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-secondary text-white flex items-center justify-center shadow-lg">
                      <Target size={24} />
                    </div>
                    <span className="px-4 py-1.5 bg-green-100 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">Live</span>
                  </div>
                  
                  <h3 className="text-xl font-black text-secondary mb-2">{camp.name}</h3>
                  <p className="text-sm text-gray-400 font-medium line-clamp-2 mb-6">{camp.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-white rounded-2xl border border-gray-50">
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Your Reward</p>
                      <p className="font-black text-secondary flex items-center gap-1"><IndianRupee size={14} /> {camp.subVendorReward || 0}</p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-gray-50">
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">My Recruits</p>
                      <p className="font-black text-secondary flex items-center gap-1"><Users size={14} /> 0</p>
                    </div>
                  </div>
                  
                  <button className="w-full py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/10">
                    Track Performance
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
