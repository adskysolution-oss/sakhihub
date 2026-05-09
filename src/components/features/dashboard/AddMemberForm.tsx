'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Phone, MapPin, Briefcase, 
  Heart, Sparkles, ArrowLeft, Users, 
  ChevronDown, CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const occupations = ["Housewife", "Self Employed", "Labor", "Student", "Farmer", "Other"];
const interestOptions = ["Health Awareness", "Sakhi Care Pads", "Employment", "Training", "Volunteer"];

export default function AddMemberForm({ onCancel, onSuccess }: { onCancel: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    age: '',
    maritalStatus: 'Married',
    occupation: '',
    interests: [] as string[],
    groupId: '',
    village: '',
    district: '',
    block: '',
  });

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get('/api/groups');
        if (res.data.success) setGroups(res.data.data);
      } catch (err) {
        console.error("Failed to fetch groups", err);
      }
    };
    fetchGroups();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/members', formData);
      if (res.data.success) onSuccess();
    } catch (err) {
      console.error("Failed to add member", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button 
        onClick={onCancel} 
        className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-black text-xs uppercase tracking-widest mb-8 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Members
      </button>

      <div className="bg-white p-8 md:p-14 rounded-[40px] shadow-2xl shadow-black/5 border border-gray-50">
        <div className="mb-10 md:mb-14">
          <h2 className="text-3xl md:text-5xl font-black text-secondary tracking-tight">Add New Member</h2>
          <p className="mt-4 text-primary font-bold text-sm md:text-lg flex items-center gap-2">
            <Sparkles size={18} /> Register a community member under a group
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Member Name</label>
              <input 
                required 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Full Name" 
                className="p-4 md:p-5 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-secondary" 
              />
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Number</label>
              <input 
                required 
                type="tel" 
                name="mobile" 
                value={formData.mobile} 
                onChange={handleChange} 
                placeholder="10 Digit Number" 
                className="p-4 md:p-5 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-secondary" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
             <div className="flex flex-col gap-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Age</label>
              <input 
                required 
                type="number" 
                name="age" 
                value={formData.age} 
                onChange={handleChange} 
                placeholder="Age" 
                className="p-4 md:p-5 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-secondary" 
              />
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Marital Status</label>
              <div className="relative">
                <select 
                  name="maritalStatus" 
                  value={formData.maritalStatus} 
                  onChange={handleChange} 
                  className="w-full p-4 md:p-5 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-secondary appearance-none"
                >
                  <option value="Married">Married</option>
                  <option value="Unmarried">Unmarried</option>
                </select>
                <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Occupation</label>
              <div className="relative">
                <select 
                  required 
                  name="occupation" 
                  value={formData.occupation} 
                  onChange={handleChange} 
                  className="w-full p-4 md:p-5 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-secondary appearance-none"
                >
                  <option value="">Select Occupation</option>
                  {occupations.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Select Group</label>
            <div className="relative">
              <select 
                required 
                name="groupId" 
                value={formData.groupId} 
                onChange={handleChange} 
                className="w-full p-4 md:p-5 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-secondary appearance-none"
              >
                <option value="">Choose a Group</option>
                {groups.map(g => <option key={g._id} value={g._id}>{g.groupName} ({g.village})</option>)}
              </select>
              <Users size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input required name="village" value={formData.village} onChange={handleChange} placeholder="Village" className="p-4 md:p-5 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-secondary" />
            <input required name="block" value={formData.block} onChange={handleChange} placeholder="Block" className="p-4 md:p-5 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-secondary" />
            <input required name="district" value={formData.district} onChange={handleChange} placeholder="District" className="p-4 md:p-5 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-secondary" />
          </div>

          <div className="flex flex-col gap-6">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Interested In (Multiple Selection)</label>
            <div className="flex flex-wrap gap-3">
              {interestOptions.map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleInterest(option)}
                  className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${
                    formData.interests.includes(option) 
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105' 
                      : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-primary/30'
                  }`}
                >
                  {formData.interests.includes(option) ? <CheckCircle size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-current opacity-20" />}
                  {option}
                </button>
              ))}
            </div>
          </div>

          <button 
            disabled={loading} 
            type="submit" 
            className="btn-primary w-full py-5 rounded-[24px] text-lg font-black mt-4 shadow-2xl shadow-primary/30 disabled:opacity-50 disabled:transform-none"
          >
            {loading ? "Registering..." : "Complete Registration"} <Sparkles size={22} className="ml-2" />
          </button>
        </form>
      </div>
    </div>
  );
}
