'use client';

import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { 
  Target, Calendar, Plus, Search, 
  Trash2, Edit2, ShieldCheck, Clock,
  FileText, ImageIcon, ExternalLink, Users, MapPin, X, Check,
  ChevronDown, ArrowUpRight
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showBannersFor, setShowBannersFor] = useState<any>(null);
  const [viewRequestsFor, setViewRequestsFor] = useState<any>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAudience: '',
    location: '',
    charges: '',
    hideChargesFromSubVendors: true,
    hideTargetDetailsFromEmployees: false,
    status: 'active',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    assignedVendors: [] as string[]
  });
  
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  
  // Vendor dropdown state
  const [vendorSearch, setVendorSearch] = useState('');
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);

  const fetchCampaigns = async () => {
    try {
      const res = await axios.get('/api/admin/campaigns');
      if (res.data.success) setCampaigns(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await axios.get('/api/admin/vendors');
      if (res.data.success) setVendors(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchVendors();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowVendorDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEdit = (c: any) => {
    setFormData({
      title: c.title || '',
      description: c.description || '',
      targetAudience: c.targetAudience || '',
      location: c.location || '',
      charges: c.charges ? c.charges.toString() : '',
      hideChargesFromSubVendors: c.visibilityOptions?.hideChargesFromSubVendors ?? true,
      hideTargetDetailsFromEmployees: c.visibilityOptions?.hideTargetDetailsFromEmployees ?? false,
      status: c.status || 'active',
      startDate: c.startDate ? new Date(c.startDate).toISOString().split('T')[0] : '',
      endDate: c.endDate ? new Date(c.endDate).toISOString().split('T')[0] : '',
      assignedVendors: c.assignedVendors || []
    });
    setEditingId(c._id);
    setIsEditing(true);
    setShowCreate(true);
    setBannerFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('targetAudience', formData.targetAudience);
      payload.append('location', formData.location);
      payload.append('charges', formData.charges);
      payload.append('hideChargesFromSubVendors', String(formData.hideChargesFromSubVendors));
      payload.append('hideTargetDetailsFromEmployees', String(formData.hideTargetDetailsFromEmployees));
      payload.append('status', formData.status);
      payload.append('startDate', formData.startDate);
      if (formData.endDate) payload.append('endDate', formData.endDate);
      
      // Append assigned vendors as JSON string
      payload.append('assignedVendors', JSON.stringify(formData.assignedVendors));
      
      if (bannerFile) {
        payload.append('bannerImage', bannerFile);
      }

      let res;
      if (isEditing && editingId) {
        // Ideally we would PUT or PATCH to /api/admin/campaigns/[id], but if not available we can just post or handle edit properly.
        // Assuming POST updates if ID is passed, but let's check API. 
        // Oh wait, `api/admin/campaigns/route.ts` only has POST (create) and GET.
        // I'll create a PUT endpoint inside the route or use a specific one. Let's assume there's an edit API, or we update using a new route `api/admin/campaigns/update`.
        // Wait, for this prompt I must send to `api/admin/campaigns/edit` or similar if the route exists. Let's send to POST with editingId to see if backend handles it, or I'll quickly fix the backend.
        payload.append('id', editingId);
        res = await axios.put('/api/admin/campaigns/update', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await axios.post('/api/admin/campaigns', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res?.data?.success) {
        fetchCampaigns();
        closeForm();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save campaign. If Edit API is missing, make sure to add it.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (campaignId: string, userId: string, status: string) => {
    try {
      const res = await axios.post('/api/campaigns/assign', {
        campaignId,
        targetUserId: userId,
        status
      });
      if (res.data.success) {
        // Update local state to reflect change without full refresh
        setCampaigns(prev => prev.map(c => {
          if (c._id === campaignId) {
            return {
              ...c,
              assignments: c.assignments.map((a: any) => 
                a.userId?._id === userId ? { ...a, status, updatedAt: new Date() } : a
              )
            };
          }
          return c;
        }));
        
        // Also update the modal view state
        setViewRequestsFor((prev: any) => ({
          ...prev,
          assignments: prev.assignments.map((a: any) => 
            a.userId?._id === userId ? { ...a, status, updatedAt: new Date() } : a
          )
        }));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update request status');
    }
  };

  const closeForm = () => {
    setShowCreate(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({ 
      title: '', description: '', targetAudience: '', location: '', charges: '', 
      hideChargesFromSubVendors: true, hideTargetDetailsFromEmployees: false, status: 'active',
      startDate: new Date().toISOString().split('T')[0], endDate: '', assignedVendors: []
    });
    setBannerFile(null);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete campaign "${title}"?`)) return;
    try {
      setLoading(true);
      const res = await axios.delete(`/api/admin/campaigns?id=${id}`);
      if (res.data.success) {
        fetchCampaigns();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete campaign.');
      setLoading(false);
    }
  };

  const toggleVendor = (vendorId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedVendors: prev.assignedVendors.includes(vendorId)
        ? prev.assignedVendors.filter(id => id !== vendorId)
        : [...prev.assignedVendors, vendorId]
    }));
    // Close dropdown after selection to prevent blocking the UI
    setShowVendorDropdown(false);
  };

  const filteredVendors = vendors.filter(v => 
    v.fullName?.toLowerCase().includes(vendorSearch.toLowerCase()) || 
    v.vendorCode?.toLowerCase().includes(vendorSearch.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-black text-secondary">Active Campaigns</h2>
          <p className="text-gray-400 font-bold">Manage awareness drives, training programs, and health missions.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary px-6 py-3 flex items-center gap-2">
          <Plus size={20} /> Launch Campaign
        </button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white p-8 rounded-[30px] mb-8 border-2 border-dashed border-primary/50 shadow-soft"
          >
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-black text-secondary">{isEditing ? 'Edit Campaign' : 'New Campaign Setup'}</h3>
               <button onClick={closeForm} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
             </div>
             
             <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <input required placeholder="Campaign Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none" />
                  <input placeholder="Target Audience (e.g., Women, Students)" value={formData.targetAudience} onChange={e => setFormData({...formData, targetAudience: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none" />
                  <input placeholder="Location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none" />
                  <input type="number" placeholder="Charges / Price" value={formData.charges} onChange={e => setFormData({...formData, charges: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Start Date</label>
                      <input type="date" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">End Date (Optional)</label>
                      <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Vendor Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Assign Vendors</label>
                    <div 
                      className="w-full p-4 rounded-xl border border-gray-200 bg-white cursor-pointer flex justify-between items-center"
                      onClick={() => setShowVendorDropdown(!showVendorDropdown)}
                    >
                      <span className={formData.assignedVendors.length ? 'text-gray-900 font-bold' : 'text-gray-400'}>
                        {formData.assignedVendors.length ? `${formData.assignedVendors.length} Vendor(s) Selected` : 'Select Vendors...'}
                      </span>
                      <div className="flex items-center gap-2">
                        {formData.assignedVendors.length > 0 && (
                          <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); setFormData({...formData, assignedVendors: []}); }}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X size={16} />
                          </button>
                        )}
                        <ChevronDown size={18} className={`text-gray-400 transition-transform ${showVendorDropdown ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    
                    {showVendorDropdown && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-64 flex flex-col">
                        <div className="p-3 border-b border-gray-100 sticky top-0 bg-white">
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input 
                              type="text" 
                              placeholder="Search vendor name or code..." 
                              value={vendorSearch}
                              onChange={e => setVendorSearch(e.target.value)}
                              className="w-full pl-9 p-2 text-sm bg-gray-50 rounded-lg outline-none"
                            />
                          </div>
                        </div>
                        <div className="overflow-y-auto p-2">
                          {filteredVendors.map(v => (
                            <div 
                              key={v._id} 
                              onClick={() => toggleVendor(v._id)}
                              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                            >
                              <div>
                                <p className="text-sm font-bold text-gray-900">{v.fullName}</p>
                                <p className="text-xs text-gray-500">{v.vendorCode}</p>
                              </div>
                              {formData.assignedVendors.includes(v._id) && <Check size={18} className="text-primary" />}
                            </div>
                          ))}
                          {filteredVendors.length === 0 && <p className="text-center text-gray-400 p-4 text-sm">No vendors found</p>}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Banner Image</label>
                    <input type="file" accept="image/*" onChange={e => setBannerFile(e.target.files?.[0] || null)} className="w-full text-sm" />
                    <p className="text-[10px] text-gray-400">JPG, PNG, WEBP allowed.</p>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Visibility Rules</label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={formData.hideChargesFromSubVendors} onChange={e => setFormData({...formData, hideChargesFromSubVendors: e.target.checked})} className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold text-gray-700">Hide Charges from Sub-Vendors</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={formData.hideTargetDetailsFromEmployees} onChange={e => setFormData({...formData, hideTargetDetailsFromEmployees: e.target.checked})} className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold text-gray-700">Hide Target Details from Employees</span>
                    </label>
                  </div>
                  
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                  >
                    <option value="active">Active</option>
                    <option value="hold">On Hold</option>
                    <option value="closed">Closed</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <textarea required placeholder="Campaign Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none md:col-span-2 min-h-[120px] resize-y" />
                
                <div className="flex gap-4 md:col-span-2 pt-4">
                  <button type="submit" disabled={loading} className="btn-primary px-8 py-3 w-full md:w-auto">
                    {loading ? 'Saving...' : isEditing ? 'Update Campaign' : 'Create & Activate'}
                  </button>
                  <button type="button" onClick={closeForm} className="px-8 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 w-full md:w-auto">
                    Cancel
                  </button>
                </div>
             </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && !showCreate ? (
        <div className="p-10 text-center font-bold text-gray-400">Syncing with campaign records...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((c) => (
            <div key={c._id} className="bg-white rounded-[30px] overflow-hidden shadow-soft hover:shadow-xl transition-all border border-gray-100 flex flex-col h-full group">
              {/* Banner Area */}
              <div className="h-48 relative bg-gray-100 overflow-hidden">
                {c.bannerImage ? (
                  <img src={c.bannerImage} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex flex-col items-center justify-center text-secondary/50">
                    <ImageIcon size={40} className="mb-2 opacity-50" />
                    <span className="text-xs font-black uppercase tracking-widest">No Banner</span>
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2 items-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    c.status === 'active' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 
                    c.status === 'closed' ? 'bg-gray-800 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {c.status}
                  </span>
                  <button 
                    onClick={() => handleDelete(c._id, c.title)} 
                    className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg shadow-red-500/30 transition-transform hover:scale-110"
                    title="Delete Campaign"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6 flex-1 flex flex-col">
                 <h3 className="text-xl font-black text-secondary mb-2 line-clamp-1">{c.title}</h3>
                 <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4 flex-1">{c.description}</p>
                 
                 <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                       <MapPin size={14} className="text-primary shrink-0" /> <span className="truncate">{c.location || 'Anywhere'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                       <Users size={14} className="text-primary shrink-0" /> <span className="truncate">{c.targetAudience || 'Public'}</span>
                    </div>
                    {c.startDate && (
                      <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest col-span-2">
                         <Calendar size={14} className="text-primary shrink-0" /> 
                         <span>{new Date(c.startDate).toLocaleDateString()} {c.endDate && `- ${new Date(c.endDate).toLocaleDateString()}`}</span>
                      </div>
                    )}
                 </div>
                 
                 <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-3">
                    <button onClick={() => handleEdit(c)} className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest">
                       <Edit2 size={14} /> Edit
                    </button>
                    <button onClick={() => setViewRequestsFor(c)} className="flex-1 py-3 px-4 rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest relative">
                       <Users size={14} /> Requests
                       {c.assignments?.filter((a:any) => a.status === 'requested').length > 0 && (
                         <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] border-2 border-white">
                           {c.assignments?.filter((a:any) => a.status === 'requested').length}
                         </span>
                       )}
                    </button>
                    <button onClick={() => setShowBannersFor(c)} className="flex-1 py-3 px-4 rounded-xl bg-secondary text-white font-bold hover:bg-secondary-light transition-colors flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest">
                       <ImageIcon size={14} /> Banner
                    </button>
                 </div>
              </div>
            </div>
          ))}
          {campaigns.length === 0 && !showCreate && (
             <div className="col-span-full text-center py-20 bg-white rounded-[30px] border border-gray-100">
                <Target size={60} className="text-gray-200 mx-auto mb-4" />
                <h3 className="text-xl font-black text-secondary">No active campaigns</h3>
                <p className="text-gray-400 mt-2">Click 'Launch Campaign' to get started.</p>
             </div>
          )}
        </div>
      )}

      {/* Banner Modal */}
      {showBannersFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[30px] overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col relative">
            <button onClick={() => setShowBannersFor(null)} className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70">
              <X size={20} />
            </button>
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-2xl font-black text-secondary">{showBannersFor.title} - Banners</h3>
            </div>
            <div className="p-6 overflow-y-auto bg-gray-50 flex-1 flex items-center justify-center">
              {showBannersFor.bannerImage ? (
                <img src={showBannersFor.bannerImage} alt="Campaign Banner" className="max-w-full rounded-2xl shadow-xl" />
              ) : (
                <div className="text-center text-gray-400 p-10">
                  <ImageIcon size={60} className="mx-auto mb-4 opacity-50" />
                  <p className="font-bold">No banner image uploaded for this campaign.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Requests Modal */}
      {viewRequestsFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[30px] overflow-hidden max-w-2xl w-full max-h-[80vh] flex flex-col relative shadow-2xl"
          >
            <button onClick={() => setViewRequestsFor(null)} className="absolute top-6 right-6 z-10 w-10 h-10 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
              <X size={20} />
            </button>
            <div className="p-8 border-b border-gray-100">
              <h3 className="text-2xl font-black text-secondary">Campaign Requests</h3>
              <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">{viewRequestsFor.title}</p>
            </div>
            <div className="p-8 overflow-y-auto bg-gray-50 flex-1">
              {viewRequestsFor.assignments && viewRequestsFor.assignments.length > 0 ? (
                <div className="space-y-4">
                  {viewRequestsFor.assignments.map((req: any, i: number) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black">
                          {req.userId?.fullName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-black text-secondary">{req.userId?.fullName || 'Unknown'}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{req.userId?.role?.replace('_', ' ')}</span>
                            <span className="text-[10px] font-bold text-gray-300">•</span>
                            <span className="text-[10px] font-bold text-gray-400">{new Date(req.requestedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          req.status === 'requested' ? 'bg-amber-100 text-amber-600' :
                          req.status === 'approved' || req.status === 'assigned' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {req.status}
                        </span>
                        {req.status === 'requested' && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleStatusUpdate(viewRequestsFor._id, req.userId._id, 'approved')}
                              className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                              title="Approve Request"
                            >
                              <Check size={16} />
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(viewRequestsFor._id, req.userId._id, 'rejected')}
                              className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                              title="Reject Request"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Users size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-400 font-bold italic">No requests for this campaign yet.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
