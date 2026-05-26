'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, MapPin, Calendar, ClipboardList, 
  X, Save, Sparkles, Building, UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';

interface GroupEditModalProps {
  group: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GroupEditModal({ group, onClose, onSuccess }: GroupEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    groupName: group?.groupName || '',
    village: group?.village || '',
    panchayatWard: group?.panchayatWard || '',
    block: group?.block || '',
    district: group?.district || '',
    leaderName: group?.leaderName || '',
    leaderMobile: group?.leaderMobile || '',
    meetingDate: group?.meetingDate ? new Date(group.meetingDate).toISOString().split('T')[0] : '',
    campaignId: group?.campaignId?._id || group?.campaignId || '',
    remarks: group?.remarks || '',
    createdBy: group?.createdBy?._id || group?.createdBy || '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [campRes, empRes] = await Promise.all([
          axios.get('/api/admin/campaigns').catch(() => ({ data: { data: [] } })),
          axios.get('/api/admin/users?role=employee').catch(() => ({ data: { data: [] } }))
        ]);
        if (campRes.data?.success) setCampaigns(campRes.data.data);
        if (empRes.data?.success) setEmployees(empRes.data.data);
      } catch (err) {
        console.error("Failed to fetch dependencies", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.patch(`/api/groups/${group._id}`, formData);
      if (res.data.success) {
        toast.success("Group updated successfully");
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-[32px] w-full max-w-3xl shadow-2xl overflow-hidden my-auto border border-gray-100"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-secondary-dark to-secondary p-6 text-white flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Users size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-black text-xl leading-tight">Edit Group</h3>
                <p className="text-[10px] uppercase tracking-widest font-bold text-white/70">Update unit details</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <form onSubmit={handleSubmit} className="grid gap-6">
              
              {/* Group Core Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Group Name</label>
                  <input required name="groupName" value={formData.groupName} onChange={handleChange} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-secondary focus:bg-white focus:border-primary focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Campaign Allocation</label>
                  <select name="campaignId" value={formData.campaignId} onChange={handleChange} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-secondary focus:bg-white focus:border-primary focus:outline-none transition-colors">
                    <option value="">No Campaign Assigned</option>
                    {campaigns.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                  </select>
                </div>
              </div>

              {/* Area & Location */}
              <div className="p-5 rounded-3xl border border-gray-100 bg-gray-50/50 space-y-4">
                <h4 className="text-xs font-black text-secondary flex items-center gap-2">
                  <MapPin size={16} className="text-primary" /> Location Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Village/Area</label>
                    <input required name="village" value={formData.village} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-bold text-secondary focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Panchayat</label>
                    <input required name="panchayatWard" value={formData.panchayatWard} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-bold text-secondary focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Block</label>
                    <input required name="block" value={formData.block} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-bold text-secondary focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">District</label>
                    <input required name="district" value={formData.district} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-bold text-secondary focus:border-primary focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Leadership & Logistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                   <h4 className="text-xs font-black text-secondary flex items-center gap-2 border-b border-gray-100 pb-2">
                     <UserCheck size={16} className="text-primary" /> Leadership
                   </h4>
                   <div>
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Group Leader Name</label>
                     <input required name="leaderName" value={formData.leaderName} onChange={handleChange} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-secondary focus:bg-white focus:border-primary focus:outline-none transition-colors" />
                   </div>
                   <div>
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Leader Mobile</label>
                     <input required name="leaderMobile" value={formData.leaderMobile} onChange={handleChange} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-secondary focus:bg-white focus:border-primary focus:outline-none transition-colors" />
                   </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-xs font-black text-secondary flex items-center gap-2 border-b border-gray-100 pb-2">
                     <Building size={16} className="text-primary" /> Management
                   </h4>
                   <div>
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Assign Field Employee</label>
                     <select name="createdBy" value={formData.createdBy} onChange={handleChange} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-secondary focus:bg-white focus:border-primary focus:outline-none transition-colors">
                       <option value="">Select Employee</option>
                       {employees.map(emp => (
                         <option key={emp._id} value={emp._id}>{emp.fullName} ({emp.employeeId})</option>
                       ))}
                     </select>
                   </div>
                   <div>
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Default Meeting Date</label>
                     <input required type="date" name="meetingDate" value={formData.meetingDate} onChange={handleChange} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-secondary focus:bg-white focus:border-primary focus:outline-none transition-colors" />
                   </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Remarks</label>
                <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows={3} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-secondary focus:bg-white focus:border-primary focus:outline-none transition-colors" placeholder="Any additional notes..."></textarea>
              </div>

            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t border-gray-100">
            <button onClick={onClose} disabled={loading} className="px-6 py-3 rounded-xl font-black text-sm text-gray-500 hover:bg-gray-200 transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={loading} className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2 text-sm shadow-lg shadow-primary/30 hover:shadow-primary/50">
              {loading ? "Saving..." : <><Save size={18} /> Save Changes</>}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
