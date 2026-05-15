'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import NetworkTree from '@/components/features/dashboard/NetworkTree';
import { MapPin, RefreshCw, Sparkles, User, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import HierarchyDetailView from '@/components/features/dashboard/HierarchyDetailView';

export default function AdminNetworkPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [hierarchyDetail, setHierarchyDetail] = useState<any>(null);

  const fetchNetwork = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/admin/network');
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

  const handleNodeClick = async (node: any) => {
    if (node.role === 'admin' || node.role === 'member') return;
    
    setSelectedNode(node);
    setLoadingDetail(true);
    try {
      const res = await axios.get(`/api/admin/users/${node.id}/hierarchy`);
      if (res.data.success) {
        setHierarchyDetail(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch detail", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string, remarks?: string) => {
     try {
       const res = await axios.patch(`/api/admin/employees/${id}/status`, { 
         status: newStatus,
         remarks 
       });
       if (res.data.success) {
         // Refresh detail if open
         if (selectedNode?.id === id) {
           const freshRes = await axios.get(`/api/admin/users/${id}/hierarchy`);
           if (freshRes.data.success) {
             setHierarchyDetail(freshRes.data.data);
           }
         }
         // Refresh main tree
         fetchNetwork();
       }
     } catch (err) {
       console.error(err);
     }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <header className="flex justify-between items-start flex-wrap gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                <MapPin size={24} />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-secondary">Global Network Tree</h1>
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] ml-13">
              Complete platform hierarchy browser (Admins Only)
            </p>
          </div>
          <button 
            onClick={fetchNetwork}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-soft hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Sync Platform
          </button>
        </header>

        {error ? (
          <div className="bg-red-50 p-8 rounded-[32px] border border-red-100 text-center">
            <h3 className="text-red-500 font-black text-lg">Unable to assemble network</h3>
            <p className="text-red-400 font-bold mt-2">{error}</p>
            <button onClick={fetchNetwork} className="btn-primary px-8 py-3 mt-6 text-[10px]">Retry Assembly</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            <NetworkTree 
              data={data} 
              loading={loading} 
              viewerRole="super_admin" 
              onNodeClick={handleNodeClick}
            />
          </div>
        )}

        {/* Node Detail Modal */}
        <AnimatePresence>
          {selectedNode && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 overflow-hidden">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => {
                  setSelectedNode(null);
                  setHierarchyDetail(null);
                }}
                className="absolute inset-0 bg-secondary/60 backdrop-blur-md" 
              />
              <motion.div 
                initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
                className="relative bg-white w-full max-w-6xl md:max-h-[90vh] rounded-t-[40px] md:rounded-[40px] overflow-y-auto custom-scrollbar shadow-2xl z-10"
              >
                {loadingDetail ? (
                  <div className="h-[600px] flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-gray-100 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-gray-400 font-bold animate-pulse">Fetching Hierarchy Intelligence...</p>
                  </div>
                ) : hierarchyDetail ? (
                  <HierarchyDetailView 
                    data={hierarchyDetail} 
                    onClose={() => {
                      setSelectedNode(null);
                      setHierarchyDetail(null);
                    }}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ) : (
                  <div className="p-20 text-center">
                    <p className="text-red-500 font-bold">Failed to load node details.</p>
                    <button onClick={() => setSelectedNode(null)} className="btn-primary px-8 py-3 mt-4">Close</button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
