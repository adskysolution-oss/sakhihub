'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { ChevronLeft, FileText, Search, ExternalLink, X } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from 'sonner';

export default function AdminFormResponsesPage() {
  const params = useParams();
  const id = params.id;
  
  const [form, setForm] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedResponse, setSelectedResponse] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const [formRes, respRes] = await Promise.all([
        axios.get(`/api/admin/forms/${id}`),
        axios.get(`/api/admin/forms/${id}/responses`)
      ]);
      if (formRes.data.success) setForm(formRes.data.data);
      if (respRes.data.success) setResponses(respRes.data.data);
    } catch (err) {
      toast.error('Failed to load responses');
    } finally {
      setLoading(false);
    }
  };

  const getFieldValue = (responsesData: any, fieldId: string) => {
    const val = responsesData[fieldId];
    if (Array.isArray(val)) return val.join(', ');
    return val || '-';
  };

  // Find the first email or text field to use as a primary identifier in the table
  const getPrimaryIdentifierField = () => {
    if (!form || !form.steps) return null;
    for (const step of form.steps) {
      for (const field of step.fields) {
        if (field.type === 'email' || field.type === 'text') {
          return field;
        }
      }
    }
    return null;
  };

  const primaryField = getPrimaryIdentifierField();

  const filteredResponses = responses.filter(r => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return Object.values(r.responses).some(val => 
      String(val).toLowerCase().includes(searchLower)
    );
  });

  return (
    <DashboardLayout>
      <div className="mb-8">
        <Link href="/admin/forms" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary mb-6 transition-colors">
          <ChevronLeft size={16} /> Back to Forms
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-secondary line-clamp-1">{form?.title || 'Form Responses'}</h2>
            <p className="text-gray-500 font-medium mt-1">Review all submissions for this form.</p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="text-3xl font-black text-primary">{responses.length}</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-tight">Total<br/>Responses</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 mb-8">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search across all responses..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div></div>
      ) : responses.length === 0 ? (
        <div className="bg-white p-12 rounded-[24px] shadow-sm border border-gray-100 text-center">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Responses Yet</h3>
          <p className="text-gray-500 mb-6">This form hasn't received any submissions.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Date Submitted</th>
                  <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                    {primaryField ? primaryField.label : 'Identifier'}
                  </th>
                  <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Status</th>
                  <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredResponses.map((res) => (
                  <tr key={res._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-5 font-bold text-gray-900">
                      {new Date(res.createdAt).toLocaleString()}
                    </td>
                    <td className="p-5 font-medium text-gray-600 truncate max-w-[200px]">
                      {primaryField ? getFieldValue(res.responses, primaryField.fieldId) : res._id}
                    </td>
                    <td className="p-5">
                      <span className="text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full bg-blue-50 text-blue-600">
                        {res.status}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <button 
                        onClick={() => setSelectedResponse(res)}
                        className="text-primary font-bold text-sm hover:underline"
                      >
                        View Full
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Response Detail Modal */}
      {selectedResponse && form && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="px-8 py-6 flex justify-between items-center border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-2xl font-black text-secondary">Response Details</h2>
                <p className="text-sm font-medium text-gray-500">Submitted on {new Date(selectedResponse.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedResponse(null)} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2.5 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8 bg-gray-50/30">
              {form.steps.map((step: any, stepIndex: number) => (
                <div key={step.stepId} className="bg-white rounded-[24px] p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-black text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">{stepIndex + 1}</span>
                    {step.title}
                  </h3>
                  <div className="space-y-6">
                    {step.fields.map((field: any) => {
                      const value = selectedResponse.responses[field.fieldId];
                      return (
                        <div key={field.fieldId}>
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{field.label}</p>
                          {field.type === 'file' && value ? (
                            <a href={value} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-primary font-bold hover:underline bg-primary/5 px-4 py-2 rounded-xl">
                              <ExternalLink size={16} /> View Uploaded File
                            </a>
                          ) : field.type === 'checkbox' && Array.isArray(value) ? (
                            <div className="flex flex-wrap gap-2">
                              {value.map((v, i) => <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-bold">{v}</span>)}
                            </div>
                          ) : (
                            <p className="text-base font-medium text-gray-900 whitespace-pre-wrap">{value || '-'}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
