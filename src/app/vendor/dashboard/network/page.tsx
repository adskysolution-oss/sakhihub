'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import NetworkTree from '@/components/features/dashboard/NetworkTree';
import { MapPin, Sparkles, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function NetworkMappingPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNetwork = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/vendor/network');
      if (res.data.success) {
        setData(res.data.data);
      } else {
        setError(res.data.message || 'Failed to fetch network');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while fetching network');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetwork();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <header className="flex justify-between items-start flex-wrap gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <MapPin size={24} />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-secondary">Network Mapping</h1>
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] ml-13">
              Complete hierarchical browser of your partner network
            </p>
          </div>
          <button 
            onClick={fetchNetwork}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-soft hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Network
          </button>
        </header>

        {error ? (
          <div className="bg-red-50 p-8 rounded-[32px] border border-red-100 text-center">
            <h3 className="text-red-500 font-black text-lg">Unable to load network</h3>
            <p className="text-red-400 font-bold mt-2">{error}</p>
            <button 
              onClick={fetchNetwork}
              className="mt-6 px-8 py-3 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-200"
            >
              Try Again
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <NetworkTree data={data} loading={loading} viewerRole="vendor" />
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
