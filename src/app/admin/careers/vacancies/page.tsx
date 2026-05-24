'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { Briefcase, MapPin, Search, Plus, Edit, Trash2, CheckCircle2, Clock, X } from "lucide-react";
import axios from "axios";
import { toast } from 'sonner';

export default function AdminVacanciesPage() {
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '', department: '', location: '', workType: '', salaryRange: '',
    description: '', responsibilities: '', requirements: '', eligibility: '',
    experience: '', benefits: '', status: 'Open', isFeatured: false, lastDate: '',
    requireAadhaar: false, requirePan: false, requirePhoto: false
  });

  useEffect(() => {
    fetchVacancies();
  }, []);

  const fetchVacancies = async () => {
    try {
      const res = await axios.get('/api/admin/careers/vacancies');
      if (res.data.success) setVacancies(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        responsibilities: formData.responsibilities.split('\n').filter(Boolean),
        requirements: formData.requirements.split('\n').filter(Boolean),
        benefits: formData.benefits.split('\n').filter(Boolean),
      };

      if (editingId) {
        await axios.put(`/api/admin/careers/vacancies/${editingId}`, payload);
      } else {
        await axios.post('/api/admin/careers/vacancies', payload);
      }
      setShowModal(false);
      fetchVacancies();
    } catch (err) {
      toast.error("Failed to save vacancy");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vacancy?")) return;
    try {
      await axios.delete(`/api/admin/careers/vacancies/${id}`);
      fetchVacancies();
    } catch (err) {
      toast.error("Failed to delete vacancy");
    }
  };

  const handleEdit = (vacancy: any) => {
    setFormData({
      title: vacancy.title,
      department: vacancy.department,
      location: vacancy.location,
      workType: vacancy.workType,
      salaryRange: vacancy.salaryRange,
      description: vacancy.description,
      responsibilities: vacancy.responsibilities?.join('\n') || '',
      requirements: vacancy.requirements?.join('\n') || '',
      eligibility: vacancy.eligibility || '',
      experience: vacancy.experience,
      benefits: vacancy.benefits?.join('\n') || '',
      status: vacancy.status,
      isFeatured: vacancy.isFeatured,
      requireAadhaar: vacancy.requireAadhaar || false,
      requirePan: vacancy.requirePan || false,
      requirePhoto: vacancy.requirePhoto || false,
      lastDate: vacancy.lastDate ? new Date(vacancy.lastDate).toISOString().split('T')[0] : ''
    });
    setEditingId(vacancy._id);
    setShowModal(true);
  };

  const filteredVacancies = vacancies.filter(v => 
    v.title.toLowerCase().includes(search.toLowerCase()) ||
    v.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-secondary">Vacancies CMS</h2>
          <p className="text-gray-500 font-medium mt-1">Manage public job postings for SakhiHub Careers.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({
              title: '', department: '', location: '', workType: '', salaryRange: '',
              description: '', responsibilities: '', requirements: '', eligibility: '',
              experience: '', benefits: '', status: 'Open', isFeatured: false, lastDate: '',
              requireAadhaar: false, requirePan: false, requirePhoto: false
            });
            setShowModal(true);
          }}
          className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus size={18} /> Add Vacancy
        </button>
      </div>

      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 mb-8">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search vacancies..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVacancies.map((vacancy) => (
            <div key={vacancy._id} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 relative">
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full ${vacancy.status === 'Open' ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
                  {vacancy.status}
                </span>
                {vacancy.isFeatured && <span className="text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full bg-amber-50 text-amber-600">Featured</span>}
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">{vacancy.title}</h3>
              <p className="text-sm font-bold text-primary mb-4">{vacancy.department}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <MapPin size={16} className="text-gray-400" /> {vacancy.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <Briefcase size={16} className="text-gray-400" /> {vacancy.workType}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button onClick={() => handleEdit(vacancy)} className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                  <Edit size={14} /> Edit
                </button>
                <button onClick={() => handleDelete(vacancy._id)} className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="px-8 py-6 flex justify-between items-center border-b border-gray-100 shrink-0">
              <h2 className="text-2xl font-black text-secondary">{editingId ? 'Edit Vacancy' : 'Create Vacancy'}</h2>
              <button 
                type="button" 
                onClick={() => setShowModal(false)} 
                className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2.5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body - Scrollable */}
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              <form id="vacancyForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Job Title *</label>
                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-5 py-3 rounded-2xl border border-gray-200 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Department *</label>
                    <input required type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-5 py-3 rounded-2xl border border-gray-200 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Location *</label>
                    <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-5 py-3 rounded-2xl border border-gray-200 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Work Type *</label>
                    <select required value={formData.workType} onChange={e => setFormData({...formData, workType: e.target.value})} className="w-full px-5 py-3 rounded-2xl border border-gray-200 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
                      <option value="">Select...</option>
                      <option value="Full Time">Full Time</option>
                      <option value="Part Time">Part Time</option>
                      <option value="Contract">Contract</option>
                      <option value="Field Work">Field Work</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Salary Range *</label>
                    <input required type="text" value={formData.salaryRange} onChange={e => setFormData({...formData, salaryRange: e.target.value})} className="w-full px-5 py-3 rounded-2xl border border-gray-200 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Experience *</label>
                    <input required type="text" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full px-5 py-3 rounded-2xl border border-gray-200 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Description *</label>
                  <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-5 py-3 rounded-2xl border border-gray-200 font-medium h-32 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"></textarea>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Responsibilities (One per line)</label>
                    <textarea value={formData.responsibilities} onChange={e => setFormData({...formData, responsibilities: e.target.value})} className="w-full px-5 py-3 rounded-2xl border border-gray-200 font-medium h-32 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"></textarea>
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Requirements (One per line)</label>
                    <textarea value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} className="w-full px-5 py-3 rounded-2xl border border-gray-200 font-medium h-32 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"></textarea>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Status</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-5 py-3 rounded-2xl border border-gray-200 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
                      <option value="Open">Open</option>
                      <option value="Closed">Closed</option>
                      <option value="Coming Soon">Coming Soon</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Last Date</label>
                    <input type="date" value={formData.lastDate} onChange={e => setFormData({...formData, lastDate: e.target.value})} className="w-full px-5 py-3 rounded-2xl border border-gray-200 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div className="flex flex-col gap-4 pt-6 md:col-span-3">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Additional Settings</p>
                    <div className="flex flex-wrap items-center gap-6">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${formData.isFeatured ? 'bg-primary border-primary' : 'border-gray-300 group-hover:border-primary'}`}>
                          {formData.isFeatured && <CheckCircle2 size={16} className="text-white" />}
                        </div>
                        <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} className="hidden" />
                        <span className="font-bold text-gray-700 select-none">Featured Vacancy</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${formData.requireAadhaar ? 'bg-pink-500 border-pink-500' : 'border-gray-300 group-hover:border-pink-500'}`}>
                          {formData.requireAadhaar && <CheckCircle2 size={16} className="text-white" />}
                        </div>
                        <input type="checkbox" checked={formData.requireAadhaar} onChange={e => setFormData({...formData, requireAadhaar: e.target.checked})} className="hidden" />
                        <span className="font-bold text-gray-700 select-none">Require Aadhaar Card</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${formData.requirePan ? 'bg-pink-500 border-pink-500' : 'border-gray-300 group-hover:border-pink-500'}`}>
                          {formData.requirePan && <CheckCircle2 size={16} className="text-white" />}
                        </div>
                        <input type="checkbox" checked={formData.requirePan} onChange={e => setFormData({...formData, requirePan: e.target.checked})} className="hidden" />
                        <span className="font-bold text-gray-700 select-none">Require PAN Card</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${formData.requirePhoto ? 'bg-pink-500 border-pink-500' : 'border-gray-300 group-hover:border-pink-500'}`}>
                          {formData.requirePhoto && <CheckCircle2 size={16} className="text-white" />}
                        </div>
                        <input type="checkbox" checked={formData.requirePhoto} onChange={e => setFormData({...formData, requirePhoto: e.target.checked})} className="hidden" />
                        <span className="font-bold text-gray-700 select-none">Require Passport Photo</span>
                      </label>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 flex gap-4 border-t border-gray-100 shrink-0 bg-gray-50/50 rounded-b-[32px]">
              <button 
                type="button" 
                onClick={() => setShowModal(false)} 
                className="px-8 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="vacancyForm" 
                className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest flex-1 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]"
              >
                Save Vacancy
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
