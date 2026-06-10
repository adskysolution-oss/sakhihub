'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import {
  FileText,
  Plus,
  Trash2,
  Edit3,
  Eye,
  ShieldAlert,
  Search,
  X,
  Sparkles,
  Save,
  Tag
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal / Drawer state for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preview State
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/communication/templates');
      if (res.data.success) {
        setTemplates(res.data.data.templates || []);
      }
    } catch (err) {
      toast.error('Failed to load email templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setName('');
    setSubject('');
    setContent('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: any) => {
    setEditingTemplate(t);
    setName(t.name);
    setSubject(t.subject);
    setContent(t.content);
    setDescription(t.description || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this email template? This cannot be undone.')) return;
    try {
      const res = await axios.delete(`/api/admin/communication/templates/${id}`);
      if (res.data.success) {
        toast.success('Template deleted successfully');
        fetchTemplates();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete template');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !subject || !content) {
      toast.error('Template Name, Subject line, and Content are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { name, subject, content, description };
      let res;
      if (editingTemplate) {
        res = await axios.put(`/api/admin/communication/templates/${editingTemplate._id}`, payload);
      } else {
        res = await axios.post('/api/admin/communication/templates', payload);
      }

      if (res.data.success) {
        toast.success(editingTemplate ? 'Template updated successfully' : 'New template saved successfully');
        setIsModalOpen(false);
        fetchTemplates();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMockPreviewContent = (htmlContent: string) => {
    let preview = htmlContent;
    const mockUser = {
      fullName: 'Sunita Sharma',
      email: 'sunita.sharma@example.com',
      mobile: '+91 98765 43210',
      employeeId: 'EMP202688',
      memberId: 'MEM887642',
      designation: 'District Coordinator',
      district: 'Indore',
      state: 'Madhya Pradesh',
      businessName: 'Sharma Self-Help Group (SHG)',
      joiningDate: new Date('2026-02-15').toLocaleDateString()
    };

    const tags: Record<string, string> = {
      '{{name}}': mockUser.fullName,
      '{{email}}': mockUser.email,
      '{{phone}}': mockUser.mobile,
      '{{employeeId}}': mockUser.employeeId,
      '{{memberId}}': mockUser.memberId,
      '{{designation}}': mockUser.designation,
      '{{district}}': mockUser.district,
      '{{state}}': mockUser.state,
      '{{vendorName}}': mockUser.businessName,
      '{{joiningDate}}': mockUser.joiningDate
    };

    for (const [tag, val] of Object.entries(tags)) {
      preview = preview.replace(new RegExp(tag, 'g'), val);
    }

    return preview;
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const insertMergeTag = (tag: string) => {
    const textarea = document.getElementById('modal-content-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newContent = text.substring(0, start) + tag + text.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 10);
  };

  const mergeVariables = [
    { label: 'Name', tag: '{{name}}' },
    { label: 'Email', tag: '{{email}}' },
    { label: 'Mobile', tag: '{{phone}}' },
    { label: 'Employee ID', tag: '{{employeeId}}' },
    { label: 'Member ID', tag: '{{memberId}}' },
    { label: 'Designation', tag: '{{designation}}' },
    { label: 'District', tag: '{{district}}' },
    { label: 'State', tag: '{{state}}' }
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black text-secondary">Email Templates</h2>
            <p className="text-gray-400 font-bold mt-1">Design and seed reusable email layouts for system and campaign dispatches.</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md shadow-primary/20"
          >
            <Plus size={16} /> New Template
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-soft">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates by name, subject, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f8f9fa] border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Templates Grid Layout */}
        {loading ? (
          <div className="text-center p-12 text-gray-400 italic font-semibold">Loading templates catalog...</div>
        ) : filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((t) => (
              <div
                key={t._id}
                className="bg-white rounded-[28px] border border-gray-100 shadow-soft p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group min-h-[220px]"
              >
                {t.isSystem && (
                  <div className="absolute top-0 right-0 bg-[#e2e8f0] text-gray-600 px-3 py-1 rounded-bl-xl text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                    <ShieldAlert size={10} /> System
                  </div>
                )}
                <div>
                  <h4 className="font-black text-secondary text-sm pr-12 truncate" title={t.name}>{t.name}</h4>
                  <p className="text-[10px] text-gray-400 font-bold mt-1 max-w-[240px] truncate">Subject: <span className="font-semibold text-secondary">"{t.subject}"</span></p>
                  <p className="text-xs text-gray-400 font-medium mt-3 line-clamp-3 leading-relaxed">
                    {t.description || 'No description provided.'}
                  </p>
                </div>

                <div className="flex gap-2 border-t border-gray-50 pt-4 mt-6">
                  <button
                    onClick={() => setPreviewTemplate(t)}
                    className="flex-1 py-2 text-secondary bg-[#f8f9fa] hover:bg-gray-100 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye size={12} /> Preview
                  </button>
                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="flex-1 py-2 text-primary bg-[#FFF5F8] hover:bg-[#FFE8EF] rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                  {!t.isSystem ? (
                    <button
                      onClick={() => handleDelete(t._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl border border-red-50 transition-colors"
                      title="Delete Template"
                    >
                      <Trash2 size={13} />
                    </button>
                  ) : (
                    <div className="p-2 text-gray-300 border border-gray-100 rounded-xl cursor-not-allowed" title="System templates cannot be deleted.">
                      <Trash2 size={13} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-white rounded-[28px] border border-gray-100 shadow-soft text-gray-400 font-semibold italic">
            No templates found matching your search.
          </div>
        )}

        {/* Custom Edit/Create Modal (Drawer Layout) */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex justify-end backdrop-blur-xs">
            <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col p-8 overflow-y-auto animate-slide-left">
              <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                <div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-primary">Template Designer</span>
                  <h3 className="text-lg font-black text-secondary mt-0.5">
                    {editingTemplate ? `Edit Template: ${editingTemplate.name}` : 'Create Custom Email Template'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex-1 flex flex-col gap-5 mt-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Template Name</label>
                  <input
                    type="text"
                    disabled={editingTemplate?.isSystem}
                    placeholder="e.g. Welcome Membership Renewal Layout"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-gray-100 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all mt-1.5 disabled:opacity-60"
                  />
                  {editingTemplate?.isSystem && (
                    <p className="text-[8px] text-amber-500 font-bold mt-1 flex items-center gap-1"><ShieldAlert size={10} /> Note: This is a system key and the unique template name cannot be changed.</p>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Default Subject Line</label>
                  <input
                    type="text"
                    placeholder="e.g. Welcome to SakhiHub, {{name}}!"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-gray-100 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all mt-1.5"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Description / Context</label>
                  <textarea
                    placeholder="Briefly state what this template is used for..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full bg-[#f8f9fa] border border-gray-100 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all mt-1.5 resize-none"
                  />
                </div>

                {/* Variable Selector */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Insert Merge Fields</label>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {mergeVariables.map(v => (
                      <button
                        key={v.tag}
                        type="button"
                        onClick={() => insertMergeTag(v.tag)}
                        className="px-2 py-1 bg-[#f8f9fa] border border-gray-200 rounded text-[9px] font-bold text-gray-500 hover:bg-primary/5 hover:text-primary transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Tag size={9} /> {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">HTML Template Body</label>
                  <textarea
                    id="modal-content-textarea"
                    placeholder="Write template body using raw HTML markup and variables..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full flex-1 p-4 bg-[#f8f9fa] border border-gray-150 rounded-xl text-xs font-semibold focus:outline-none mt-1.5 resize-none font-mono min-h-[200px]"
                  />
                </div>

                <div className="border-t border-gray-50 pt-4 flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3.5 bg-gray-50 text-secondary border border-gray-150 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={14} /> {isSubmitting ? 'Saving Changes...' : 'Save Template'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Live Preview Modal */}
        {previewTemplate && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="w-full max-w-3xl bg-white rounded-[32px] border border-gray-100 shadow-2xl flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-[#fafafa] rounded-t-[32px]">
                <div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-primary">Layout Rendering Mock Sandbox</span>
                  <h3 className="text-base font-black text-secondary mt-0.5">{previewTemplate.name}</h3>
                </div>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="p-1 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 border-b border-gray-50 bg-[#fafafa]">
                <p className="text-[10px] text-gray-400 font-bold">Mock Subject: <span className="font-bold text-secondary">"{getMockPreviewContent(previewTemplate.subject)}"</span></p>
              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-white max-h-[500px]">
                <div 
                  className="prose prose-sm max-w-none text-secondary"
                  dangerouslySetInnerHTML={{ __html: getMockPreviewContent(previewTemplate.content) }}
                />
              </div>

              <div className="p-5 border-t border-gray-50 flex justify-end bg-gray-50/50 rounded-b-[32px]">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="px-6 py-2.5 bg-secondary text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-secondary-light transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
