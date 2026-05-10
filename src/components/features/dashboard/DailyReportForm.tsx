'use client';
 
import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, Users, IndianRupee, MapPin, 
  MessageSquare, Send, CheckCircle, ArrowLeft,
  Calendar, Briefcase, Target, Camera, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
 
export default function DailyReportForm({ onCancel, onSuccess }: { onCancel: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [location, setLocation] = useState<any>(null);
 
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    campaignId: '',
    villageVisited: '',
    groupsCreated: '0',
    membersAdded: '0',
    membershipCollected: '0',
    meetingCount: '0',
    remarks: ''
  });
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/admin/campaigns');
        if (res.data.success) setCampaigns(res.data.data);
      } catch (err) {
        console.error("Failed to fetch campaigns", err);
      }
    };
    fetchData();
 
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      });
    }
  }, []);
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...formData,
        villagesVisited: [formData.villageVisited],
        groupsCreated: parseInt(formData.groupsCreated),
        membersAdded: parseInt(formData.membersAdded),
        membershipCollected: parseInt(formData.membershipCollected),
        meetingCount: parseInt(formData.meetingCount),
        location: location
      };
 
      const res = await axios.post('/api/reports/daily', payload);
      if (res.data.success) {
        setSubmitted(true);
      } else {
        throw new Error(res.data.message || "Failed to submit report");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
 
  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-[500px] mx-auto text-center px-4">
        <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-50">
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-3xl font-black text-secondary mb-4">Report Submitted!</h2>
          <p className="text-gray-500 mb-10 font-semibold">Your daily activity report has been saved to the database successfully.</p>
          <button onClick={onSuccess} className="btn-primary w-full py-4 rounded-2xl justify-center shadow-xl shadow-primary/20">Return to Dashboard</button>
        </div>
      </motion.div>
    );
  }
 
  return (
    <div className="max-w-[800px] mx-auto w-full px-4">
      <button onClick={onCancel} className="flex items-center gap-2 bg-transparent border-none text-gray-500 cursor-pointer mb-8 font-bold hover:text-primary transition-colors">
        <ArrowLeft size={18} /> Back to Dashboard
      </button>
 
      <div className="bg-white p-6 sm:p-10 lg:p-12 rounded-[30px] md:rounded-[40px] shadow-2xl border border-gray-50">
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-2xl md:text-4xl font-black text-secondary leading-tight">Daily Activity Report</h2>
            <p className="text-primary font-bold mt-2 uppercase tracking-widest text-xs">Submit today's field summary</p>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-gray-50 rounded-2xl border border-gray-100">
            <Calendar size={20} className="text-primary" />
            <input 
              type="date" 
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              className="bg-transparent border-none font-bold text-secondary text-sm focus:outline-none"
            />
          </div>
        </div>
 
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Active Campaign</label>
              <div className="relative">
                <Target size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                <select 
                  required
                  className="pl-14 pr-6 py-4 rounded-2xl border border-gray-100 bg-gray-50 w-full focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-secondary appearance-none"
                  value={formData.campaignId}
                  onChange={e => setFormData({...formData, campaignId: e.target.value})}
                >
                  <option value="">Select Campaign</option>
                  {campaigns.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>
            </div>
 
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Village Visited</label>
              <div className="relative">
                <MapPin size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  required
                  placeholder="Enter village name"
                  className="pl-14 pr-6 py-4 rounded-2xl border border-gray-100 bg-gray-50 w-full focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-secondary"
                  value={formData.villageVisited}
                  onChange={e => setFormData({...formData, villageVisited: e.target.value})}
                />
              </div>
            </div>
          </div>
 
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Meetings</label>
                <input 
                  type="number" 
                  required
                  className="p-4 rounded-2xl border border-gray-100 bg-gray-50 w-full focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-secondary"
                  value={formData.meetingCount}
                  onChange={e => setFormData({...formData, meetingCount: e.target.value})}
                />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Groups</label>
                <input 
                  type="number" 
                  required
                  className="p-4 rounded-2xl border border-gray-100 bg-gray-50 w-full focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-secondary"
                  value={formData.groupsCreated}
                  onChange={e => setFormData({...formData, groupsCreated: e.target.value})}
                />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Members</label>
                <input 
                  type="number" 
                  required
                  className="p-4 rounded-2xl border border-gray-100 bg-gray-50 w-full focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-secondary"
                  value={formData.membersAdded}
                  onChange={e => setFormData({...formData, membersAdded: e.target.value})}
                />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Collection</label>
                <input 
                  type="number" 
                  required
                  className="p-4 rounded-2xl border border-gray-100 bg-gray-50 w-full focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-secondary"
                  value={formData.membershipCollected}
                  onChange={e => setFormData({...formData, membershipCollected: e.target.value})}
                />
              </div>
          </div>
 
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Field Remarks & Observations</label>
            <div className="relative">
              <MessageSquare size={20} className="absolute left-5 top-6 text-gray-400" />
              <textarea 
                rows={4}
                placeholder="Share your feedback, challenges, or village status..."
                className="pl-14 pr-6 py-5 rounded-3xl border border-gray-100 bg-gray-50 w-full focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-secondary resize-none"
                value={formData.remarks}
                onChange={e => setFormData({...formData, remarks: e.target.value})}
              ></textarea>
            </div>
          </div>
 
          {error && (
            <div className="p-4 bg-red-50 text-red-500 rounded-2xl flex items-center gap-3 font-bold border border-red-100">
              <AlertCircle size={20} /> {error}
            </div>
          )}
 
          <div className="mt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-5 rounded-[24px] justify-center text-lg font-black shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all group"
            >
              {loading ? "Submitting..." : (
                <>
                  <Send size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                  Submit Daily Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
