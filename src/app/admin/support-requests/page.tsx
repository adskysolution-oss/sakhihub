'use client';

import React, { useEffect, useState } from 'react';
import { Mail, Clock, CheckCircle, AlertCircle, Search, RefreshCw, User, Trash2, Eye, X, MessageSquare, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function SupportRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/support-requests?status=${filter}&search=${searchTerm}`);
      if (res.data.success) setRequests(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequests();
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdating(true);
    try {
      const res = await axios.patch('/api/admin/support-requests', { id, status });
      if (res.data.success) {
        if (selectedRequest && selectedRequest._id === id) {
          setSelectedRequest({ ...selectedRequest, status });
        }
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedRequest) return;
    setUpdating(true);
    try {
      const res = await axios.patch('/api/admin/support-requests', { 
        id: selectedRequest._id, 
        adminNotes 
      });
      if (res.data.success) {
        setSelectedRequest({ ...selectedRequest, adminNotes });
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this query?')) return;
    try {
      const res = await axios.delete(`/api/admin/support-requests?id=${id}`);
      if (res.data.success) {
        if (selectedRequest && selectedRequest._id === id) setSelectedRequest(null);
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-50 text-blue-500 border-blue-100';
      case 'in_progress': return 'bg-amber-50 text-amber-500 border-amber-100';
      case 'resolved': return 'bg-green-50 text-green-500 border-green-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  return (
    <div className="p-4 md:p-10 bg-[#f8f9fa] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-secondary">Support Queries</h1>
            <p className="text-gray-500 font-bold mt-1">Manage and respond to user messages</p>
          </div>
          <button 
            onClick={fetchRequests}
            className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-primary hover:bg-primary hover:text-white transition-all group"
          >
            <RefreshCw size={20} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name, email or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-secondary"
            />
          </form>
          <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200 overflow-x-auto no-scrollbar">
            {['all', 'new', 'in_progress', 'resolved'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === s ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-secondary'}`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {requests.map((req) => (
              <motion.div
                key={req._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-black/[0.02] transition-all flex flex-col group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                     onClick={() => handleDelete(req._id)}
                     className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                   >
                     <Trash2 size={18} />
                   </button>
                </div>

                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                    <User size={24} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(req.status)}`}>
                    {req.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-lg font-black text-secondary mb-1 truncate pr-8">{req.name}</h3>
                <div className="flex flex-col gap-2 mb-6">
                  <span className="text-xs font-bold text-gray-400 flex items-center gap-2">
                    <Mail size={14} /> {req.email}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-300">
                    <Clock size={12} /> {new Date(req.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="bg-gray-50/50 p-4 rounded-2xl mb-6 flex-1 border border-gray-50">
                  <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Subject: {req.subject}</h4>
                  <p className="text-sm font-medium text-secondary leading-relaxed line-clamp-3">
                    {req.message}
                  </p>
                </div>

                <button 
                  onClick={() => {
                    setSelectedRequest(req);
                    setAdminNotes(req.adminNotes || '');
                  }}
                  className="w-full py-3 bg-white border border-gray-100 text-secondary rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-center gap-2 group/btn"
                >
                  <Eye size={14} /> View Details
                  <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {requests.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-400">No support queries found</h3>
            <p className="text-gray-300 font-medium mt-1">Try adjusting your filters or search term</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
              className="absolute inset-0 bg-secondary/20 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-8 md:p-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                      <User size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-secondary">{selectedRequest.name}</h2>
                      <p className="text-gray-400 font-bold text-sm">{selectedRequest.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedRequest(null)}
                    className="p-3 hover:bg-gray-50 rounded-2xl transition-colors text-gray-400"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">Status</span>
                    <select 
                      value={selectedRequest.status}
                      onChange={(e) => handleStatusUpdate(selectedRequest._id, e.target.value)}
                      disabled={updating}
                      className="bg-transparent text-sm font-bold text-secondary outline-none w-full"
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">Role</span>
                    <span className="text-sm font-bold text-secondary uppercase tracking-wider">{selectedRequest.userRole || 'Guest'}</span>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                    <MessageSquare size={14} /> Subject: {selectedRequest.subject}
                  </h4>
                  <div className="bg-[#FFF5F8] p-6 rounded-3xl border border-primary/5">
                    <p className="text-secondary font-medium leading-relaxed">
                      {selectedRequest.message}
                    </p>
                  </div>
                </div>

                <div className="mb-8">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 ml-1">Admin Remarks / Notes</label>
                  <textarea 
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this query..."
                    rows={3}
                    className="w-full p-5 bg-gray-50 rounded-3xl border border-gray-100 focus:bg-white focus:border-primary outline-none transition-all text-secondary font-medium resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={handleSaveNotes}
                    disabled={updating}
                    className="flex-1 py-4 bg-primary text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
                  >
                    {updating ? 'Saving...' : 'Save Remarks'}
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(selectedRequest._id, 'resolved')}
                    disabled={updating || selectedRequest.status === 'resolved'}
                    className="flex-1 py-4 bg-green-500 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-green-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {selectedRequest.status === 'resolved' ? 'Already Resolved' : 'Mark as Resolved'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
