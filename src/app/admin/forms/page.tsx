'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { Plus, Edit, Trash2, List, Settings, Eye } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { toast } from 'sonner';

export default function AdminFormsPage() {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const res = await axios.get('/api/admin/forms');
      if (res.data.success) {
        setForms(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this form? This action cannot be undone.")) return;
    try {
      await axios.delete(`/api/admin/forms/${id}`);
      toast.success('Form deleted successfully');
      fetchForms();
    } catch (err) {
      toast.error('Failed to delete form');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-secondary">Dynamic Forms</h2>
          <p className="text-gray-500 font-medium mt-1">Create and manage dynamic data collection forms.</p>
        </div>
        <Link 
          href="/admin/forms/builder"
          className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary/90 flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Create Form
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div></div>
      ) : forms.length === 0 ? (
        <div className="bg-white p-12 rounded-[24px] shadow-sm border border-gray-100 text-center">
          <List size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Forms Found</h3>
          <p className="text-gray-500 mb-6">You haven't created any dynamic forms yet.</p>
          <Link href="/admin/forms/builder" className="text-primary font-bold hover:underline">
            Create your first form
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <div key={form._id} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 relative group flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full ${form.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                  {form.isActive ? 'Active' : 'Draft'}
                </span>
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2 line-clamp-1">{form.title}</h3>
              <p className="text-sm font-medium text-gray-500 mb-6 line-clamp-2 flex-grow">
                {form.description || 'No description provided'}
              </p>
              
              <div className="flex items-center justify-between text-xs font-bold text-gray-400 mb-6">
                <span>{form.steps?.length || 0} Steps</span>
                <span>/forms/{form.slug}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100 mt-auto">
                <Link href={`/admin/forms/${form._id}/responses`} className="bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors">
                  <List size={14} /> Responses
                </Link>
                <Link href={`/admin/forms/builder?id=${form._id}`} className="bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors">
                  <Edit size={14} /> Edit
                </Link>
                <Link target="_blank" href={`/forms/${form.slug}`} className="col-span-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors">
                  <Eye size={14} /> View Live Form
                </Link>
              </div>
              <button 
                onClick={() => handleDelete(form._id)} 
                className="absolute top-6 right-6 text-gray-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
