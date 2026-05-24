'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { Users, Search, Download, CheckCircle2, XCircle, FileText, ExternalLink, RefreshCw } from "lucide-react";
import axios from "axios";
import { toast } from 'sonner';

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [converting, setConverting] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    try {
      const url = statusFilter ? `/api/admin/careers/applications?status=${statusFilter}` : '/api/admin/careers/applications';
      const res = await axios.get(url);
      if (res.data.success) setApplications(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await axios.put(`/api/admin/careers/applications/${id}`, { status: newStatus });
      fetchApplications();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleRemarksChange = async (id: string, newRemarks: string) => {
    try {
      await axios.put(`/api/admin/careers/applications/${id}`, { adminRemarks: newRemarks });
      // Don't refetch immediately to avoid losing focus, just rely on local state update if needed,
      // but for simplicity we can just show a toast or nothing.
    } catch (err) {
      console.error("Failed to save remarks");
    }
  };

  const handleConvert = async (id: string) => {
    if (!confirm("Are you sure you want to convert this candidate into an Employee? This will create a user account and map their documents.")) return;
    
    setConverting(id);
    try {
      const res = await axios.post(`/api/admin/careers/applications/${id}/convert`);
      if (res.data.success) {
        toast.success("Candidate successfully converted to Employee! You can now generate their Offer Letter from the Employees module.");
        fetchApplications();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to convert candidate");
    } finally {
      setConverting(null);
    }
  };

  const filteredApps = applications.filter(a => 
    a.fullName.toLowerCase().includes(search.toLowerCase()) ||
    a.applicationId.toLowerCase().includes(search.toLowerCase()) ||
    a.mobile.includes(search)
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-secondary">Job Applications</h2>
          <p className="text-gray-500 font-medium mt-1">Review candidates and convert to employees.</p>
        </div>
        <div className="flex gap-4">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-6 py-3 rounded-2xl border border-gray-200 font-bold bg-white"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Under Review">Under Review</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 mb-8">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, ID, or mobile..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div></div>
      ) : (
        <div className="space-y-6">
          {filteredApps.map((app) => (
            <div key={app._id} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                
                {/* Info block */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-widest font-black bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                      {app.applicationId}
                    </span>
                    <span className={`text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full ${
                      app.status === 'Selected' ? 'bg-green-50 text-green-600' :
                      app.status === 'Rejected' ? 'bg-rose-50 text-rose-600' :
                      app.status === 'New' ? 'bg-blue-50 text-blue-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-black text-gray-900">{app.fullName}</h3>
                    <p className="text-sm font-bold text-primary mt-1">Applied For: {app.applyingFor}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm font-medium text-gray-600">
                    <div><strong>Mobile:</strong> {app.mobile}</div>
                    <div><strong>Email:</strong> {app.email}</div>
                    <div><strong>Experience:</strong> {app.experience}</div>
                    <div><strong>Qualification:</strong> {app.qualification}</div>
                    <div className="col-span-2"><strong>Location:</strong> {app.block}, {app.district}, {app.state}</div>
                  </div>
                </div>

                {/* Actions block */}
                <div className="w-full lg:w-72 space-y-4 flex flex-col justify-between">
                  <div className="flex gap-2">
                    {app.resumeUrl && (
                      <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                        <FileText size={14} /> Resume
                      </a>
                    )}
                    {app.aadhaarUrl && (
                      <a href={app.aadhaarUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                        <ExternalLink size={14} /> Aadhaar
                      </a>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <select 
                      value={app.status} 
                      onChange={(e) => handleStatusChange(app._id, e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-200 font-bold text-xs bg-white"
                      disabled={!!app.convertedUserId}
                    >
                      <option value="New">New</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Selected">Selected</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      defaultValue={app.adminRemarks || ''}
                      onBlur={(e) => handleRemarksChange(app._id, e.target.value)}
                      placeholder="Add remarks..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-primary font-medium"
                    />
                  </div>

                  {app.status === 'Selected' && !app.convertedUserId && (
                    <button 
                      onClick={() => handleConvert(app._id)}
                      disabled={converting === app._id}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                    >
                      {converting === app._id ? <RefreshCw className="animate-spin" size={16} /> : <Users size={16} />} 
                      Convert to Employee
                    </button>
                  )}

                  {app.convertedUserId && (
                    <div className="bg-green-50 text-green-700 border border-green-200 p-3 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} /> Converted to Employee
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {filteredApps.length === 0 && (
             <div className="text-center py-20 bg-white rounded-[32px] border border-gray-100">
               <Users size={64} className="mx-auto text-gray-200 mb-4" />
               <h3 className="text-xl font-black text-gray-400">No applications found.</h3>
             </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
