'use client';

import React, { useState } from 'react';
import { 
  ClipboardCheck, Users, IndianRupee, MapPin, 
  MessageSquare, Send, CheckCircle, ArrowLeft,
  Calendar, Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function DailyReportForm({ onCancel, onSuccess }: { onCancel: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    villageVisited: '',
    membersMet: '',
    collectionsMade: '',
    newRegistrations: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Mocking submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitted(true);
    } catch (err) {
      console.error(err);
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
          <p className="text-gray-500 mb-10 font-semibold">Your daily activity report has been sent to the District Coordinator.</p>
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
            <span className="font-bold text-secondary text-sm">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">New Registrations</label>
              <div className="relative">
                <Users size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="number" 
                  required
                  placeholder="Count"
                  className="pl-14 pr-6 py-4 rounded-2xl border border-gray-100 bg-gray-50 w-full focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-secondary"
                  value={formData.newRegistrations}
                  onChange={e => setFormData({...formData, newRegistrations: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
             <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Members Met</label>
                <div className="relative">
                  <Briefcase size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="number" 
                    required
                    placeholder="Total women met"
                    className="pl-14 pr-6 py-4 rounded-2xl border border-gray-100 bg-gray-50 w-full focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-secondary"
                    value={formData.membersMet}
                    onChange={e => setFormData({...formData, membersMet: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Collections Made (₹)</label>
                <div className="relative">
                  <IndianRupee size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="number" 
                    required
                    placeholder="Amount collected"
                    className="pl-14 pr-6 py-4 rounded-2xl border border-gray-100 bg-gray-50 w-full focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-secondary"
                    value={formData.collectionsMade}
                    onChange={e => setFormData({...formData, collectionsMade: e.target.value})}
                  />
                </div>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Field Notes & Observations</label>
            <div className="relative">
              <MessageSquare size={20} className="absolute left-5 top-6 text-gray-400" />
              <textarea 
                rows={4}
                placeholder="Share your feedback, challenges, or village status..."
                className="pl-14 pr-6 py-5 rounded-3xl border border-gray-100 bg-gray-50 w-full focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-secondary resize-none"
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              ></textarea>
            </div>
          </div>

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
