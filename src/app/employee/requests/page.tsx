'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { User, Phone, MapPin, Check, X, Clock, AlertCircle } from "lucide-react";
import axios from "axios";

export default function EmployeeRequestsPage() {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/employee/requests');
      if (res.data.success) setRequests(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setActionLoading(id);
    try {
      const res = await axios.patch('/api/employee/requests', { id, status });
      if (res.data.success) {
        setRequests(prev => prev.filter(r => r._id !== id));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update request");
    } finally {
      setActionLoading(null);
    }
  };

  const receivedRequests = requests.filter(r => r.requestedBy === 'member');
  const sentRequests = requests.filter(r => r.requestedBy === 'employee');
  const displayRequests = activeTab === 'received' ? receivedRequests : sentRequests;

  return (
    <DashboardLayout>
      <div className="mb-8 md:mb-14">
        <h2 className="text-3xl md:text-5xl font-black text-secondary tracking-tight">Member Requests</h2>
        <p className="mt-4 text-gray-500 font-bold text-sm md:text-lg">Manage your connections and approvals with community members.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 md:gap-10 mb-8 md:mb-12 border-b border-gray-100 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('received')}
          className={`whitespace-nowrap pb-5 px-2 text-sm md:text-xl font-black tracking-tight transition-all ${
            activeTab === 'received' ? 'text-primary border-b-4 border-primary' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Incoming <span className="hidden sm:inline">(From Members)</span>
        </button>
        <button 
          onClick={() => setActiveTab('sent')}
          className={`whitespace-nowrap pb-5 px-2 text-sm md:text-xl font-black tracking-tight transition-all ${
            activeTab === 'sent' ? 'text-primary border-b-4 border-primary' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Outgoing <span className="hidden sm:inline">(Sent to Members)</span>
        </button>
      </div>

      {loading ? (
        <div className="p-20 text-center">
          <div className="animate-pulse text-xl font-black text-gray-300 uppercase tracking-widest">Loading Requests...</div>
        </div>
      ) : displayRequests.length === 0 ? (
        <div className="p-16 md:p-24 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100 shadow-soft">
          <Clock size={64} className="mx-auto text-gray-200 mb-6" />
          <h3 className="text-xl md:text-2xl font-black text-secondary mb-3">No {activeTab} Requests</h3>
          <p className="text-gray-400 font-bold text-sm md:text-base max-w-sm mx-auto">
            {activeTab === 'received' ? 'When members near you request to connect, they will appear here.' : 'Members you have sent connection requests to will be listed here.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {displayRequests.map((request) => (
            <div key={request._id} className="bg-white p-6 md:p-10 rounded-[35px] shadow-2xl shadow-black/5 border border-gray-50 flex flex-col lg:flex-row justify-between items-center gap-8 hover:shadow-primary/5 transition-all">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center w-full lg:w-auto text-center md:text-left">
                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center shrink-0 shadow-lg ${
                  activeTab === 'received' ? 'bg-gradient-to-br from-primary to-secondary text-white' : 'bg-gray-50 text-gray-300'
                }`}>
                  <User size={40} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-black text-secondary tracking-tight">{request.memberId?.fullName}</h3>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8 mt-3">
                    <span className="flex items-center gap-2 text-sm font-black text-gray-400">
                      <Phone size={16} className="text-primary" /> {request.memberId?.mobile}
                    </span>
                    <span className="flex items-center gap-2 text-sm font-black text-gray-400">
                      <MapPin size={16} className="text-primary" /> {request.memberId?.area || 'Area N/A'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                {activeTab === 'received' ? (
                  <>
                    <button 
                      onClick={() => handleAction(request._id, 'rejected')}
                      disabled={!!actionLoading}
                      className="flex-1 sm:flex-none px-8 py-4 rounded-2xl bg-gray-50 text-gray-400 font-black text-xs uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center gap-2 border border-transparent hover:border-red-100"
                    >
                      <X size={18} /> Reject
                    </button>
                    <button 
                      onClick={() => handleAction(request._id, 'approved')}
                      disabled={!!actionLoading}
                      className="flex-1 sm:flex-none px-10 py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
                    >
                      {actionLoading === request._id ? 'Processing...' : <><Check size={18} /> Approve & Connect</>}
                    </button>
                  </>
                ) : (
                  <div className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 font-black text-xs uppercase tracking-widest">
                    <Clock size={18} /> Pending Member Response
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
