'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { 
  Users, Search, Plus, Trash2, Edit3, Eye, EyeOff,
  Calendar, Loader2, ArrowRight, Upload, X, Save, 
  MapPin, ShieldCheck, MessageSquare, ListCollapse
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface CoreTeamMember {
  _id?: string;
  name: string;
  photo?: string;
  role: string;
  designation?: string;
  bio?: string;
  priority: number;
  district?: string;
  state?: string;
  joiningDate?: string;
  isPublicVisible: boolean;
  message?: string;
  employeeId?: string;
}

export default function AdminTeamManagePage() {
  const [members, setMembers] = useState<CoreTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CoreTeamMember | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<CoreTeamMember>({
    name: "",
    photo: "",
    role: "project_leader",
    designation: "",
    bio: "",
    priority: 0,
    district: "",
    state: "",
    joiningDate: "",
    isPublicVisible: true,
    message: "",
    employeeId: ""
  });
  
  const [customRole, setCustomRole] = useState("");

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/team');
      if (res.data.success) {
        setMembers(res.data.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch team members", err);
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const openAddModal = () => {
    setSelectedMember(null);
    setFormData({
      name: "",
      photo: "",
      role: "project_leader",
      designation: "",
      bio: "",
      priority: members.length + 1,
      district: "",
      state: "",
      joiningDate: new Date().toISOString().split('T')[0],
      isPublicVisible: true,
      message: "",
      employeeId: ""
    });
    setCustomRole("");
    setShowModal(true);
  };

  const openEditModal = (member: CoreTeamMember) => {
    setSelectedMember(member);
    const dateFormatted = member.joiningDate 
      ? new Date(member.joiningDate).toISOString().split('T')[0] 
      : "";
    
    const standardRoles = ["founder", "project_leader", "trainer"];
    const isCustom = !standardRoles.includes(member.role);

    setFormData({
      ...member,
      joiningDate: dateFormatted
    });
    
    if (isCustom) {
      setFormData(prev => ({ ...prev, role: "other" }));
      setCustomRole(member.role);
    } else {
      setCustomRole("");
    }
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this team member card?")) return;
    try {
      const res = await axios.delete(`/api/admin/team?id=${id}`);
      if (res.data.success) {
        toast.success("Team member card deleted successfully");
        fetchMembers();
      }
    } catch (err: any) {
      console.error("Failed to delete member", err);
      toast.error(err.response?.data?.message || "Failed to delete member");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image file size should be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, photo: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = { ...formData };
      if (payload.role === "other") {
        if (!customRole.trim()) {
          toast.error("Please enter a custom role");
          setSaving(false);
          return;
        }
        payload.role = customRole.trim();
      }

      if (selectedMember?._id) {
        payload._id = selectedMember._id;
      }

      const res = await axios.post('/api/admin/team', payload);
      if (res.data.success) {
        toast.success(selectedMember ? "Member updated successfully" : "Member added successfully");
        setShowModal(false);
        fetchMembers();
      }
    } catch (err: any) {
      console.error("Failed to save member", err);
      toast.error(err.response?.data?.message || "Failed to save team member");
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (member: CoreTeamMember) => {
    try {
      const res = await axios.post('/api/admin/team', {
        ...member,
        isPublicVisible: !member.isPublicVisible
      });
      if (res.data.success) {
        toast.success(`Card ${!member.isPublicVisible ? 'visible' : 'hidden'} on public page`);
        fetchMembers();
      }
    } catch (err: any) {
      console.error("Failed to toggle visibility", err);
      toast.error("Failed to change visibility");
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase()) ||
    (m.designation && m.designation.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <Users size={20} />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-secondary">Team Cards Registry</h1>
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Add, edit and prioritize spotlight cards (Founder, Trainer, Project Leaders) on the Our Team page.</p>
          </div>
          <button 
            onClick={openAddModal}
            className="btn-primary py-4 px-8 shadow-xl shadow-primary/20"
          >
            <Plus size={20} /> Add Core Team Card
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, role or designation..." 
              className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-4 bg-white rounded-[40px] border border-gray-100">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Syncing Team Cards...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center gap-6 bg-white rounded-[40px] border border-gray-100 text-center p-10">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200">
              <Users size={40} />
            </div>
            <div>
              <h3 className="text-xl font-black text-secondary">No Core Team Cards</h3>
              <p className="text-gray-400 font-bold mt-2">Start by creating the first dynamic card (e.g. Founder).</p>
            </div>
            <button 
              onClick={openAddModal}
              className="btn-primary py-3 px-8"
            >
              <Plus size={18} /> Add First Card
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMembers.map((member) => (
              <div 
                key={member._id}
                className="group relative bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-soft hover:shadow-xl transition-all flex flex-col justify-between"
              >
                {/* Upper Details */}
                <div>
                  {/* Image/Photo section */}
                  <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                    {member.photo ? (
                      <img 
                        src={member.photo} 
                        alt={member.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                        <Users size={60} />
                      </div>
                    )}
                    
                    {/* Status Badges */}
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg bg-amber-500/80 text-white`}>
                        Priority {member.priority}
                      </span>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg ${member.isPublicVisible ? 'bg-primary/80 text-white' : 'bg-secondary/80 text-white'}`}>
                        {member.isPublicVisible ? 'Visible' : 'Hidden'}
                      </span>
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-secondary/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4 backdrop-blur-[2px]">
                      <button 
                        onClick={() => openEditModal(member)}
                        className="p-4 bg-white text-secondary rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                        title="Edit Card"
                      >
                        <Edit3 size={20} />
                      </button>
                      <button 
                        onClick={() => handleDelete(member._id!)}
                        className="p-4 bg-red-500 text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                        title="Delete Card"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Text details */}
                  <div className="p-8">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="text-xl font-black text-secondary group-hover:text-primary transition-colors line-clamp-1">{member.name}</h3>
                      <span className="px-2 py-0.5 rounded bg-violet-100 text-violet-700 text-[9px] font-black uppercase tracking-widest shrink-0">
                        {member.role}
                      </span>
                    </div>
                    <p className="text-gray-500 font-bold text-xs">{member.designation || 'No Designation Set'}</p>
                    {member.employeeId && <p className="text-[10px] font-mono text-gray-400 mt-1">ID: {member.employeeId}</p>}
                    
                    {member.bio && (
                      <p className="text-gray-400 text-xs mt-4 line-clamp-3 leading-relaxed border-t border-gray-50 pt-4">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-8 pb-8 pt-4 border-t border-gray-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <MapPin size={12} className="text-primary" /> {member.district ? `${member.district}, ${member.state}` : member.state || 'India'}
                  </div>
                  <button 
                    onClick={() => toggleVisibility(member)}
                    className={`p-2 rounded-lg transition-all ${member.isPublicVisible ? 'bg-blue-50 text-primary' : 'bg-gray-100 text-gray-400'}`}
                    title={member.isPublicVisible ? 'Hide from Team Page' : 'Show on Team Page'}
                  >
                    {member.isPublicVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Form */}
        <AnimatePresence>
          {showModal && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                onClick={() => !saving && setShowModal(false)}
                className="fixed inset-0 bg-black z-50 cursor-pointer"
              />

              {/* Drawer Container */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-full sm:w-[540px] bg-white z-[60] shadow-2xl flex flex-col justify-between overflow-y-auto no-scrollbar border-l border-gray-100"
              >
                <form onSubmit={handleSubmit} className="flex flex-col h-full justify-between">
                  {/* Top Header */}
                  <div className="bg-gradient-to-r from-secondary-dark to-secondary p-8 text-white relative">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      disabled={saving}
                      className="absolute right-6 top-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all text-white disabled:opacity-50"
                    >
                      <X size={20} />
                    </button>
                    <h3 className="text-2xl font-black mt-4">
                      {selectedMember ? "Edit Team Card" : "Add Core Team Card"}
                    </h3>
                    <p className="text-white/70 text-xs mt-1">Configure profile details, message, and sorting priority.</p>
                  </div>

                  {/* Body Form Fields */}
                  <div className="p-8 flex-1 space-y-6">
                    {/* Photo Upload */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Profile Photo</label>
                      <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-3xl border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0 relative group">
                          {formData.photo ? (
                            <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <Users size={32} className="text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1">
                          <label className="btn-secondary py-3 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer border border-gray-200">
                            <Upload size={14} /> Upload Image
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleImageChange} 
                              className="hidden" 
                            />
                          </label>
                          <p className="text-[10px] text-gray-400 mt-2">PNG, JPG, JPEG up to 2MB. Square aspect recommended.</p>
                        </div>
                      </div>
                    </div>

                    {/* Basic info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-bold text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Priority Order *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={formData.priority}
                          onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono font-bold text-gray-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">System Role *</label>
                        <select
                          value={formData.role}
                          onChange={e => setFormData({ ...formData, role: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-bold text-gray-700"
                        >
                          <option value="founder">Founder</option>
                          <option value="project_leader">Project Leader</option>
                          <option value="trainer">Trainer</option>
                          <option value="other">Other (Custom Role)</option>
                        </select>
                      </div>
                      <div>
                        {formData.role === "other" ? (
                          <>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Custom Role Name *</label>
                            <input
                              type="text"
                              required
                              value={customRole}
                              onChange={e => setCustomRole(e.target.value)}
                              placeholder="e.g. Program Director"
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-bold text-gray-700"
                            />
                          </>
                        ) : (
                          <>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Designation / Subtitle</label>
                            <input
                              type="text"
                              value={formData.designation}
                              onChange={e => setFormData({ ...formData, designation: e.target.value })}
                              placeholder="e.g. Founder & Chairperson"
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-bold text-gray-700"
                            />
                          </>
                        )}
                      </div>
                    </div>

                    {/* Regional / Joining info */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">State</label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={e => setFormData({ ...formData, state: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-bold text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">District</label>
                        <input
                          type="text"
                          value={formData.district}
                          onChange={e => setFormData({ ...formData, district: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-bold text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Joining Date</label>
                        <input
                          type="date"
                          value={formData.joiningDate}
                          onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono font-bold text-gray-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Masked Employee ID</label>
                        <input
                          type="text"
                          value={formData.employeeId}
                          onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                          placeholder="e.g. FDR000001****"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono font-bold text-gray-700"
                        />
                      </div>
                      <div className="flex items-center pt-8">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={formData.isPublicVisible}
                            onChange={e => setFormData({ ...formData, isPublicVisible: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Visible on Public Page</span>
                        </label>
                      </div>
                    </div>

                    {/* Biography */}
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Biography & Experience</label>
                      <textarea
                        value={formData.bio}
                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-semibold text-gray-700"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Quote / Statement / Message</label>
                      <textarea
                        value={formData.message}
                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                        placeholder="e.g. 'Empowering women is our core mission.'"
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-semibold italic text-gray-700"
                      />
                    </div>
                  </div>

                  {/* Drawer Footer Buttons */}
                  <div className="p-8 border-t border-gray-100 bg-gray-50 flex gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      disabled={saving}
                      className="btn-secondary w-full text-center py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider border border-gray-200 disabled:opacity-50"
                      style={{ justifyContent: 'center' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary w-full text-center py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 size={14} className="animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Save size={14} /> Save Card
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
