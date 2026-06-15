'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import {
  ArrowLeft,
  Mail,
  Send,
  Calendar,
  Eye,
  Settings,
  Code,
  Tag,
  Users,
  AlertCircle,
  Plus,
  Trash2,
  FileText,
  Bold,
  Italic,
  Link as LinkIcon,
  Image as ImageIcon,
  Play,
  Grid,
  Sparkles
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { STATUS_FILTERS, LABEL_MAP } from '@/components/shared/filters/StatusFilterTabs';

export default function NewCampaignPage() {
  const router = useRouter();

  // Basic Details
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Audience Rules State
  const [condition, setCondition] = useState<'AND' | 'OR'>('AND');
  const [rules, setRules] = useState<any[]>([
    { field: 'role', operator: 'equals', value: 'member' } // default rule
  ]);

  // Counting and Previews
  const [recipientCount, setRecipientCount] = useState<number>(0);
  const [previewUsers, setPreviewUsers] = useState<any[]>([]);
  const [isCounting, setIsCounting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Send Options
  const [sendType, setSendType] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduledDate, setScheduledDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Testing
  const [testEmail, setTestEmail] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  // Tab: Editor vs Preview
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  // Fetch templates and run initial count
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await axios.get('/api/admin/communication/templates?limit=100');
        if (res.data.success) {
          setTemplates(res.data.data.templates || []);
        }
      } catch (err) {
        console.error('Failed to load templates', err);
      }
    };
    fetchTemplates();
  }, []);

  // Recalculate audience size when rules change
  useEffect(() => {
    const fetchAudienceMetrics = async () => {
      if (rules.length === 0) {
        setRecipientCount(0);
        setPreviewUsers([]);
        setDebugInfo(null);
        return;
      }
      setIsCounting(true);
      try {
        const filters = { condition, rules };
        const [countRes, previewRes] = await Promise.all([
          axios.post('/api/admin/communication/audience/count', { filters }),
          axios.post('/api/admin/communication/audience/preview', { filters })
        ]);

        if (countRes.data.success) {
          setRecipientCount(countRes.data.data.count);
          setDebugInfo(countRes.data.data.debug || null);
        }
        if (previewRes.data.success) {
          setPreviewUsers(previewRes.data.data.preview || []);
        }
      } catch (err) {
        console.error('Failed to update audience count', err);
      } finally {
        setIsCounting(false);
      }
    };

    const timer = setTimeout(fetchAudienceMetrics, 600); // debounce
    return () => clearTimeout(timer);
  }, [condition, rules]);

  // Load a template
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedTemplate(id);
    if (!id) return;

    const t = templates.find(temp => temp._id === id);
    if (t) {
      setSubject(t.subject);
      setContent(t.content);
      toast.success(`Loaded template: ${t.name}`);
    }
  };

  // Audience Rules Controls
  const addRule = () => {
    setRules([...rules, { field: 'role', operator: 'equals', value: 'member' }]);
  };

  const updateRule = (index: number, updates: any) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], ...updates };
    setRules(newRules);
  };

  const deleteRule = (index: number) => {
    const newRules = rules.filter((_, idx) => idx !== index);
    setRules(newRules);
  };

  // Text Selection Insertion helpers
  const insertMergeTag = (tag: string) => {
    const textarea = document.getElementById('campaign-content') as HTMLTextAreaElement;
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

  const formatText = (before: string, after: string = '') => {
    const textarea = document.getElementById('campaign-content') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const text = textarea.value;
    const replacement = before + (selectedText || 'text') + after;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + (selectedText || 'text').length);
    }, 10);
  };

  // Test send
  const sendTestEmail = async () => {
    if (!content) {
      toast.error('Cannot send a test of an empty campaign body.');
      return;
    }
    if (!testEmail) {
      toast.error('Please specify a recipient email to receive the test copy.');
      return;
    }
    setIsTesting(true);
    try {
      // Create a temporary draft first if no ID
      const res = await axios.post('/api/admin/communication/campaigns', {
        name: name || `Test Draft - ${Date.now()}`,
        subject: subject || 'Test Email',
        content,
        status: 'draft'
      });

      if (res.data.success) {
        const campaignId = res.data.data._id;
        const testRes = await axios.post(`/api/admin/communication/campaigns/${campaignId}/test`, {
          testEmail
        });
        if (testRes.data.success) {
          toast.success(`Test email sent successfully to ${testEmail}!`);
        }
        // Cleanup draft
        await axios.delete(`/api/admin/communication/campaigns/${campaignId}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to dispatch test email.');
    } finally {
      setIsTesting(false);
    }
  };

  // Dispatch campaign
  const handleLaunchCampaign = async () => {
    if (!name.trim()) return toast.error('Campaign Name is required');
    if (!subject.trim()) return toast.error('Email Subject is required');
    if (!content.trim()) return toast.error('Email Body content is required');
    if (recipientCount === 0 && sendType === 'immediate') {
      return toast.error('Cannot dispatch a campaign to 0 recipients.');
    }
    if (sendType === 'scheduled' && !scheduledDate) {
      return toast.error('Please specify a schedule execution time.');
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name,
        subject,
        content,
        filters: { condition, rules },
        recipientCount,
        status: sendType === 'scheduled' ? 'scheduled' : 'sending',
        scheduledAt: sendType === 'scheduled' ? (() => {
          if (!scheduledDate) return undefined;
          const d = new Date(scheduledDate);
          const offset = -d.getTimezoneOffset();
          const sign = offset >= 0 ? '+' : '-';
          const pad = (n: number) => String(Math.floor(Math.abs(n))).padStart(2, '0');
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00${sign}${pad(offset / 60)}:${pad(offset % 60)}`;
        })() : undefined
      };

      const res = await axios.post('/api/admin/communication/campaigns', payload);
      if (res.data.success) {
        toast.success(
          sendType === 'scheduled' 
            ? 'Campaign scheduled successfully!' 
            : 'Campaign queued for bulk mailing!'
        );
        router.push('/admin/communication/campaigns');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit campaign.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock template variable replacements for Preview Panel
  const getMockPreviewContent = () => {
    let preview = content;
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

    return preview || '<p class="text-gray-400 italic">Type content to see live HTML render preview here...</p>';
  };

  const mergeVariables = [
    { label: 'Name', tag: '{{name}}' },
    { label: 'Email', tag: '{{email}}' },
    { label: 'Mobile', tag: '{{phone}}' },
    { label: 'Employee ID', tag: '{{employeeId}}' },
    { label: 'Member ID', tag: '{{memberId}}' },
    { label: 'Designation', tag: '{{designation}}' },
    { label: 'District', tag: '{{district}}' },
    { label: 'State', tag: '{{state}}' },
    { label: 'Vendor Name', tag: '{{vendorName}}' },
    { label: 'Joining Date', tag: '{{joiningDate}}' }
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Back navigation & Title */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/communication/campaigns"
            className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-500 shadow-sm hover:scale-105 transition-all shrink-0"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="text-2xl font-black text-secondary">Create New Campaign</h2>
            <p className="text-xs text-gray-400 font-bold mt-0.5">Design a customized newsletter or notification run and select your audience filters.</p>
          </div>
        </div>

        {/* Master Designer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Form Area (Left side - 2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Template loader & Campaign Name */}
            <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-soft flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Campaign Name</label>
                  <input
                    type="text"
                    placeholder="e.g. June Monthly Membership Renewal Notice"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-gray-100 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all mt-1.5 placeholder:text-gray-300"
                  />
                </div>
                <div className="w-full md:w-[220px]">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Load Email Template</label>
                  <select
                    value={selectedTemplate}
                    onChange={handleTemplateChange}
                    className="w-full bg-[#f8f9fa] border border-gray-100 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all mt-1.5"
                  >
                    <option value="">-- Start Blank --</option>
                    {templates.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Email Subject Line</label>
                <input
                  type="text"
                  placeholder="e.g. Important: Your Membership is Expiring Soon, {{name}}!"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-gray-100 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all mt-1.5 placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Email Composer & Live Preview Tabs */}
            <div className="bg-white rounded-[28px] border border-gray-100 shadow-soft overflow-hidden flex flex-col min-h-[500px]">
              <div className="p-4 border-b border-gray-50 bg-[#fafafa] flex justify-between items-center flex-wrap gap-2">
                
                {/* Formatting Toolbar */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => formatText('<strong>', '</strong>')}
                    title="Bold"
                    className="p-2 hover:bg-gray-200/50 rounded-lg text-gray-600 transition-colors"
                  >
                    <Bold size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('<em>', '</em>')}
                    title="Italic"
                    className="p-2 hover:bg-gray-200/50 rounded-lg text-gray-600 transition-colors"
                  >
                    <Italic size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('<a href="https://example.com" class="text-primary hover:underline">', '</a>')}
                    title="Insert Link"
                    className="p-2 hover:bg-gray-200/50 rounded-lg text-gray-600 transition-colors"
                  >
                    <LinkIcon size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('<img src="https://images.unsplash.com/photo-1542435503-956c469947f6?w=600" alt="Banner" class="rounded-xl max-w-full my-4" />', '')}
                    title="Insert Image Placeholder"
                    className="p-2 hover:bg-gray-200/50 rounded-lg text-gray-600 transition-colors"
                  >
                    <ImageIcon size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('<a href="https://sakhihub.com" style="display: inline-block; padding: 12px 24px; background-color: #ff2768; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 12px 0;">Button Text', '</a>')}
                    title="Insert Call-To-Action Button"
                    className="p-2 hover:bg-gray-200/50 rounded-lg text-gray-600 transition-colors"
                  >
                    <Play size={13} className="fill-gray-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('\n<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">\n  <thead>\n    <tr style="background-color: #f8f9fa; border-bottom: 2px solid #eee;">\n      <th style="padding: 12px; text-align: left; font-size: 12px; color: #666;">Header 1</th>\n      <th style="padding: 12px; text-align: left; font-size: 12px; color: #666;">Header 2</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr style="border-bottom: 1px solid #eee;">\n      <td style="padding: 12px; font-size: 14px;">Data 1</td>\n      <td style="padding: 12px; font-size: 14px;">Data 2</td>\n    </tr>\n  </tbody>\n</table>\n', '')}
                    title="Insert Table"
                    className="p-2 hover:bg-gray-200/50 rounded-lg text-gray-600 transition-colors"
                  >
                    <Grid size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('<div style="padding: 20px; background-color: #f9f9f9; border-left: 4px solid #ff2768; border-radius: 8px; margin: 16px 0;">\n  <h4 style="margin: 0 0 8px 0; color: #1a202c;">Callout Title</h4>\n  <p style="margin: 0; color: #4a5568; font-size: 14px;">Add your callout text here...</p>\n</div>', '')}
                    title="Insert Custom HTML Callout Block"
                    className="p-2 hover:bg-gray-200/50 rounded-lg text-gray-600 transition-colors"
                  >
                    <Sparkles size={15} />
                  </button>
                </div>

                {/* Switcher Tab */}
                <div className="flex bg-[#e2e8f0]/40 p-0.5 rounded-lg border border-[#e2e8f0]/80">
                  <button
                    type="button"
                    onClick={() => setActiveTab('edit')}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'edit' ? 'bg-white text-secondary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Code size={13} /> HTML Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'preview' ? 'bg-white text-secondary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Eye size={13} /> Live Preview
                  </button>
                </div>
              </div>

              {/* Tag Injector Panel */}
              <div className="px-4 py-2 border-b border-gray-50 flex items-center gap-1.5 flex-wrap bg-gray-50/50">
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 mr-2 flex items-center gap-1">
                  <Tag size={10} /> Click tags to insert:
                </span>
                {mergeVariables.map(v => (
                  <button
                    key={v.tag}
                    type="button"
                    onClick={() => insertMergeTag(v.tag)}
                    className="px-2 py-1 bg-white hover:bg-primary/5 hover:text-primary border border-gray-200 rounded text-[9px] font-bold text-gray-500 transition-all cursor-pointer shadow-2xs"
                  >
                    {v.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 flex flex-col">
                {activeTab === 'edit' ? (
                  <textarea
                    id="campaign-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your email body in HTML. You can use standard formatting buttons above or click merge tag bubbles to inject dynamic variable values..."
                    className="w-full flex-1 p-6 text-xs font-semibold focus:outline-none placeholder:text-gray-300 resize-none font-mono min-h-[380px] leading-relaxed"
                  />
                ) : (
                  <div className="p-8 overflow-y-auto max-h-[500px] min-h-[380px] bg-white border border-[#eee] m-4 rounded-[20px] shadow-inner">
                    {/* Rendered HTML inside shadow container */}
                    <div 
                      className="prose prose-sm max-w-none text-secondary"
                      dangerouslySetInnerHTML={{ __html: getMockPreviewContent() }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Test Send Card */}
            <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-soft flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-black text-secondary">Send a Quick Test</h3>
                <p className="text-xs text-gray-400 font-bold mt-0.5">Send a test dispatch of this email template containing mock variable values to verify formatting.</p>
              </div>
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="Enter test email address..."
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="flex-1 bg-[#f8f9fa] border border-gray-100 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-gray-300"
                />
                <button
                  type="button"
                  disabled={isTesting}
                  onClick={sendTestEmail}
                  className="px-6 py-3 bg-secondary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-sm shrink-0 flex items-center gap-2"
                >
                  {isTesting ? 'Sending Test...' : 'Send Test'}
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Audience Builder (Right side - 1 col) */}
          <div className="flex flex-col gap-6">
            
            {/* Audience builder card */}
            <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-soft flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <h3 className="text-sm font-black text-secondary flex items-center gap-2">
                  <Users size={16} className="text-primary" /> Audience Segment
                </h3>
                <div className="flex bg-[#e2e8f0]/40 p-0.5 rounded-lg border border-[#e2e8f0]/80">
                  <button
                    type="button"
                    onClick={() => setCondition('AND')}
                    className={`px-2 py-1 text-[9px] font-black rounded ${condition === 'AND' ? 'bg-white text-secondary' : 'text-gray-400'}`}
                  >
                    AND
                  </button>
                  <button
                    type="button"
                    onClick={() => setCondition('OR')}
                    className={`px-2 py-1 text-[9px] font-black rounded ${condition === 'OR' ? 'bg-white text-secondary' : 'text-gray-400'}`}
                  >
                    OR
                  </button>
                </div>
              </div>

              {/* Dynamic Rules List */}
              <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
                {rules.map((rule, idx) => (
                  <div key={idx} className="p-3 bg-[#f8f9fa] rounded-xl border border-gray-50 flex flex-col gap-2 relative group">
                    <button
                      type="button"
                      onClick={() => deleteRule(idx)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={13} />
                    </button>
                    
                    {/* Field Selection */}
                    <div>
                      <label className="text-[8px] font-black uppercase tracking-wider text-gray-400">Filter Field</label>
                      <select
                        value={rule.field}
                        onChange={(e) => updateRule(idx, { field: e.target.value, value: '' })}
                        className="w-full bg-white border border-gray-150 rounded-lg py-1.5 px-2 text-[10px] font-semibold focus:outline-none"
                      >
                        <option value="role">User Type (Role)</option>
                        <option value="status">Verification Status (User)</option>
                        <option value="paymentStatus">Payment Status</option>
                        <option value="verificationStatus">Aadhaar/Identity Verified</option>
                        <option value="designation">Designation Key</option>
                        <option value="state">Location: State</option>
                        <option value="district">Location: District</option>
                        <option value="block">Location: Block</option>
                        <option value="area">Location: Area/Village</option>
                        <option value="registrationDate">Registration Date Range</option>
                        <option value="securityDeposit">Security Deposit Status</option>
                      </select>
                    </div>

                    {/* Value Field rendering based on selection */}
                    <div>
                      <label className="text-[8px] font-black uppercase tracking-wider text-gray-400">Value</label>
                      {rule.field === 'role' && (
                        <select
                          value={rule.value}
                          onChange={(e) => updateRule(idx, { value: e.target.value })}
                          className="w-full bg-white border border-gray-150 rounded-lg py-1.5 px-2 text-[10px] font-semibold focus:outline-none"
                        >
                          <option value="">-- Choose Role --</option>
                          <option value="vendor">Vendor</option>
                          <option value="sub_vendor">Sub Vendor</option>
                          <option value="employee">Employee</option>
                          <option value="member">Member</option>
                        </select>
                      )}

                      {rule.field === 'status' && (
                        <select
                          value={rule.value}
                          onChange={(e) => updateRule(idx, { value: e.target.value })}
                          className="w-full bg-white border border-gray-150 rounded-lg py-1.5 px-2 text-[10px] font-semibold focus:outline-none"
                        >
                          <option value="">-- Choose Status --</option>
                          {STATUS_FILTERS.filter(s => s !== 'all').map(s => (
                            <option key={s} value={s}>{LABEL_MAP[s] || s}</option>
                          ))}
                        </select>
                      )}

                      {rule.field === 'paymentStatus' && (
                        <select
                          value={rule.value}
                          onChange={(e) => updateRule(idx, { value: e.target.value })}
                          className="w-full bg-white border border-gray-150 rounded-lg py-1.5 px-2 text-[10px] font-semibold focus:outline-none"
                        >
                          <option value="">-- Choose Payment --</option>
                          <option value="paid">Paid (completed)</option>
                          <option value="unpaid">Unpaid (pending)</option>
                        </select>
                      )}

                      {rule.field === 'verificationStatus' && (
                        <select
                          value={rule.value}
                          onChange={(e) => updateRule(idx, { value: e.target.value })}
                          className="w-full bg-white border border-gray-150 rounded-lg py-1.5 px-2 text-[10px] font-semibold focus:outline-none"
                        >
                          <option value="">-- Choose Verification --</option>
                          <option value="verified">Verified</option>
                          <option value="unverified">Unverified</option>
                        </select>
                      )}

                      {rule.field === 'securityDeposit' && (
                        <select
                          value={rule.value}
                          onChange={(e) => updateRule(idx, { value: e.target.value })}
                          className="w-full bg-white border border-gray-150 rounded-lg py-1.5 px-2 text-[10px] font-semibold focus:outline-none"
                        >
                          <option value="">-- Choose Deposit Status --</option>
                          <option value="paid">Deposit Paid</option>
                          <option value="pending">Deposit Pending</option>
                          <option value="eligible">Refund Eligible</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      )}

                      {['designation', 'state', 'district', 'block', 'area'].includes(rule.field) && (
                        <input
                          type="text"
                          placeholder={`Enter ${rule.field}...`}
                          value={rule.value}
                          onChange={(e) => updateRule(idx, { value: e.target.value })}
                          className="w-full bg-white border border-gray-150 rounded-lg py-1.5 px-2 text-[10px] font-semibold focus:outline-none"
                        />
                      )}

                      {rule.field === 'registrationDate' && (
                        <div className="flex flex-col gap-1.5 mt-1">
                          <input
                            type="date"
                            placeholder="Start Date"
                            value={rule.value?.start || ''}
                            onChange={(e) => updateRule(idx, { value: { ...rule.value, start: e.target.value } })}
                            className="w-full bg-white border border-gray-150 rounded-lg py-1 px-1.5 text-[9px] focus:outline-none"
                          />
                          <input
                            type="date"
                            placeholder="End Date"
                            value={rule.value?.end || ''}
                            onChange={(e) => updateRule(idx, { value: { ...rule.value, end: e.target.value } })}
                            className="w-full bg-white border border-gray-150 rounded-lg py-1 px-1.5 text-[9px] focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addRule}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-white border border-dashed border-gray-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-colors cursor-pointer"
              >
                <Plus size={12} /> Add Query Rule
              </button>

              {/* Recipient Calculator output */}
              <div className="mt-4 p-4 bg-primary/5 border border-primary/10 rounded-2xl flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Recipients Found</span>
                  {isCounting ? (
                    <span className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin shrink-0"></span>
                  ) : (
                    <span className="text-lg font-black text-primary">{recipientCount.toLocaleString()}</span>
                  )}
                </div>
                
                {/* Recipients list sample preview */}
                {previewUsers.length > 0 && (
                  <div className="mt-2 border-t border-primary/10 pt-2 flex flex-col gap-1.5">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Audience Sample:</span>
                    <div className="flex flex-col gap-1">
                      {previewUsers.map((u, i) => (
                        <div key={i} className="flex justify-between items-center text-[9px] font-semibold text-secondary truncate">
                          <span>{u.fullName}</span>
                          <span className="text-[8px] text-gray-400 font-mono italic">{u.email}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Admin Query Debug Panel */}
                {debugInfo && (
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col gap-3">
                    <span className="text-[10px] font-black text-secondary uppercase tracking-widest border-b border-gray-200 pb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Admin Query Debug Panel
                    </span>
                    <div className="flex flex-col gap-1.5 text-[10px]">
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-400">Matched Collection:</span>
                        <span className="font-black text-secondary">{debugInfo.matchedCollection}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-400">Total Raw Records:</span>
                        <span className="font-black text-secondary">{debugInfo.rawCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-400">Unique Recipients:</span>
                        <span className="font-black text-secondary">{debugInfo.uniqueRecipients}</span>
                      </div>
                      <div className="mt-1 flex flex-col gap-1">
                        <span className="font-bold text-gray-400">Generated Mongo Query:</span>
                        <pre className="p-2 bg-[#1e1e1e] text-green-400 rounded-lg text-[8px] font-mono overflow-x-auto max-h-[150px] whitespace-pre-wrap leading-tight">
                          {JSON.stringify(debugInfo.generatedQuery, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Campaign deployment schedule box */}
            <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-soft flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-black text-secondary">Schedule Deployment</h3>
                <p className="text-xs text-gray-400 font-bold mt-0.5">Choose to queue the campaign for immediate mailing or schedule for a future date/time.</p>
              </div>

              <div className="flex gap-4">
                <label className="flex-1 flex items-center gap-2 p-3 bg-[#f8f9fa] border border-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="radio"
                    name="sendType"
                    checked={sendType === 'immediate'}
                    onChange={() => setSendType('immediate')}
                    className="accent-primary"
                  />
                  <div>
                    <p className="text-[10px] font-black text-secondary uppercase tracking-wider">Send Immediately</p>
                    <p className="text-[9px] text-gray-400 font-medium">Add to dispatcher queue now</p>
                  </div>
                </label>

                <label className="flex-1 flex items-center gap-2 p-3 bg-[#f8f9fa] border border-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="radio"
                    name="sendType"
                    checked={sendType === 'scheduled'}
                    onChange={() => setSendType('scheduled')}
                    className="accent-primary"
                  />
                  <div>
                    <p className="text-[10px] font-black text-secondary uppercase tracking-wider">Schedule Later</p>
                    <p className="text-[9px] text-gray-400 font-medium">Define launch date & time</p>
                  </div>
                </label>
              </div>

              {sendType === 'scheduled' && (
                <div className="mt-2">
                  <label className="text-[9px] font-black uppercase tracking-wider text-gray-400">Launch Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-gray-100 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all mt-1.5"
                  />
                </div>
              )}

              {/* Submit Buttons */}
              <div className="border-t border-gray-50 pt-4 mt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleLaunchCampaign}
                  className="w-full py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-102 hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Send size={15} /> {isSubmitting ? 'Processing Submission...' : sendType === 'scheduled' ? 'Schedule Campaign' : 'Launch Campaign Bulk'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
