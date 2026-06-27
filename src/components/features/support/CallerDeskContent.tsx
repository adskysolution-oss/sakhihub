'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, User, ClipboardList, ChevronRight, HelpCircle, 
  Plus, Paperclip, RefreshCw, CheckCircle2, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import UserSummaryCard from './UserSummaryCard';
import PreviousCasesTable from './PreviousCasesTable';
import UserJourneyStepper from './UserJourneyStepper';
import CaseDetailsDrawer from './CaseDetailsDrawer';

export default function CallerDeskContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  // Selected User
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Cases History List for the selected user
  const [cases, setCases] = useState<any[]>([]);
  const [loadingCases, setLoadingCases] = useState(false);

  // UI state for showing form or success feedback
  const [showForm, setShowForm] = useState(false);
  const [forceShowForm, setForceShowForm] = useState(false);
  const [lastCreatedCase, setLastCreatedCase] = useState<any>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Case creation form state
  const [category, setCategory] = useState('Payment / Subscription');
  const [subCategory, setSubCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [creatingCase, setCreatingCase] = useState(false);

  // Dropdowns lists
  const [assigneesList, setAssigneesList] = useState<any[]>([]);
  const [currentExecutiveName, setCurrentExecutiveName] = useState('Support Executive');

  const categories = [
    'Payment / Subscription',
    'Onboarding & KYC',
    'Campaign Assignment',
    'Attendance & Leaves',
    'Technical Issues',
    'Other'
  ];

  // Conditional Subcategories based on Category selection
  const subCategoryOptions: Record<string, string[]> = {
    'Payment / Subscription': ['Double deduction', 'Subscription failure', 'Refund request', 'Other'],
    'Onboarding & KYC': ['Aadhaar verification error', 'PAN verification error', 'Bank details reject', 'Other'],
    'Campaign Assignment': ['Campaign not visible', 'Incorrect project assignment', 'Mapping delay', 'Other'],
    'Attendance & Leaves': ['Biometric mismatch', 'Leave sync error', 'Attendance correction', 'Other'],
    'Technical Issues': ['App crash', 'OTP login issue', 'White screen loading', 'Other'],
    'Other': ['General inquiry', 'Profile update', 'Other']
  };

  useEffect(() => {
    fetchAssignees();
    
    // Resolve current executive name from session
    const fetchExecName = async () => {
      try {
        const res = await axios.get('/api/auth/me');
        if (res.data.success) {
          setCurrentExecutiveName(res.data.data.fullName || 'Support Executive');
        }
      } catch (e) {
        console.error('Failed to fetch executive profile via API', e);
      }
    };
    fetchExecName();
  }, []);

  // Update default subcategory when category changes
  useEffect(() => {
    const opts = subCategoryOptions[category] || [];
    setSubCategory(opts[0] || 'Other');
  }, [category]);

  const fetchAssignees = async () => {
    try {
      const res = await axios.get('/api/admin/support-cases?getAssignees=true');
      if (res.data.success) {
        setAssigneesList(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load assignees', err);
    }
  };

  const handleUserSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setSearching(true);
    setSearched(true);
    try {
      const res = await axios.get(`/api/admin/support-cases/users/search?search=${encodeURIComponent(searchTerm)}`);
      if (res.data.success) {
        setSearchResults(res.data.data);
      }
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setSearching(false);
    }
  };

  const selectUser = async (user: any) => {
    setCurrentUser(user);
    setSearchResults([]);
    setSearchTerm('');
    setSearched(false);
    setShowForm(false);
    setForceShowForm(false);
    setLastCreatedCase(null);
    
    // Load this user's case history
    setLoadingCases(true);
    try {
      const res = await axios.get(`/api/admin/support-cases?userId=${user._id}`);
      if (res.data.success) {
        setCases(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load user cases', err);
    } finally {
      setLoadingCases(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result as string;
      try {
        setUploadingFile(true);
        const res = await axios.post('/api/upload', {
          image: base64String,
          folder: 'support',
          originalName: file.name
        });
        if (res.data.success) {
          setAttachmentUrl(res.data.data.url);
        } else {
          alert('Upload failed: ' + res.data.message);
        }
      } catch (err: any) {
        console.error(err);
        alert('Upload error: ' + (err.response?.data?.message || err.message));
      } finally {
        setUploadingFile(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setCreatingCase(true);
    try {
      const res = await axios.post('/api/admin/support-cases', {
        userId: currentUser._id,
        category,
        subCategory,
        subject,
        description,
        priority,
        assignedTo: assignedTo || undefined,
        attachment: attachmentUrl || undefined
      });

      if (res.data.success) {
        const newCaseObj = res.data.data;
        
        // Show immediate confirmation panel
        setLastCreatedCase(newCaseObj);
        setShowForm(false);
        setForceShowForm(false);

        // Reset form inputs
        setSubject('');
        setDescription('');
        setAttachmentUrl('');
        setAssignedTo('');
        
        // Refresh local cases history without full page reload
        const updatedCasesRes = await axios.get(`/api/admin/support-cases?userId=${currentUser._id}`);
        if (updatedCasesRes.data.success) {
          setCases(updatedCasesRes.data.data);
        }
      }
    } catch (err: any) {
      console.error(err);
      alert('Failed to log case: ' + (err.response?.data?.message || err.message));
    } finally {
      setCreatingCase(false);
    }
  };

  const handleCaseUpdated = (updatedCase: any) => {
    setCases(prev => prev.map(c => c._id === updatedCase._id ? updatedCase : c));
  };

  const getUserCode = (user: any) => {
    if (!user) return 'N/A';
    if (user.role === 'employee') return user.employeeId || 'N/A';
    if (user.role === 'vendor') return user.vendorCode || 'N/A';
    if (user.role === 'sub_vendor') return user.subVendorCode || 'N/A';
    return user.memberId || 'N/A';
  };

  // Check if an active open or in-progress case already exists
  const activeCase = cases.find(c => ['open', 'in_progress'].includes(c.status));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column: Caller Search & Caller Summary & Form */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        
        {/* Search */}
        <div className="bg-white p-6 rounded-[32px] border border-gray-105 shadow-soft">
          <h3 className="text-[10px] font-black text-secondary mb-4 uppercase tracking-widest">Lookup Caller</h3>
          <form onSubmit={handleUserSearch} className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search Name, Mobile, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:border-primary outline-none transition-all font-medium text-secondary text-xs"
              />
            </div>
            <button 
              type="submit" 
              disabled={searching}
              className="w-full py-3.5 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all disabled:opacity-50"
            >
              {searching ? 'Searching...' : 'Search User'}
            </button>
          </form>

          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 border-t border-gray-55 pt-4 flex flex-col gap-2.5 max-h-[250px] overflow-y-auto no-scrollbar"
              >
                {searchResults.map((user) => (
                  <div 
                    key={user._id}
                    onClick={() => selectUser(user)}
                    className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-primary/5 rounded-2xl cursor-pointer border border-transparent hover:border-primary/10 transition-all group"
                  >
                    <div className="w-8 h-8 bg-primary/5 text-primary rounded-xl flex items-center justify-center font-black text-xs uppercase">
                      {user.fullName.substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-secondary truncate">{user.fullName}</p>
                      <p className="text-[9px] font-bold text-gray-400">{user.mobile} | <span className="uppercase text-primary">{user.role}</span></p>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-primary transition-colors" />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          
          {searched && searchResults.length === 0 && !searching && (
            <p className="text-center text-xs font-bold text-gray-400 italic mt-4">No users found.</p>
          )}
        </div>

        {/* User Summary Display */}
        {currentUser && (
          <div className="flex flex-col gap-6">
            <UserSummaryCard user={currentUser} />
            
            {/* Action Area: Show stepper, then Either Success Confirmation / Action Button / Expanded Form */}
            <div className="flex flex-col gap-6">
              
              {/* Stepper for verification before case creation */}
              <UserJourneyStepper user={currentUser} />

              <AnimatePresence mode="wait">
                {/* 1. Success confirmation panel */}
                {lastCreatedCase ? (
                  <motion.div 
                    key="success-panel"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-green-50/50 p-6 rounded-[32px] border border-green-100 flex flex-col gap-4 text-center items-center"
                  >
                    <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-secondary uppercase tracking-widest">Support Case Logged</h4>
                      <p className="text-[10px] text-gray-400 font-bold mt-1">Provide the ID to the caller</p>
                    </div>

                    <div className="w-full flex flex-col gap-2.5 bg-white p-4 rounded-2xl border border-green-100/50 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Case ID</span>
                        <span className="font-black text-primary uppercase">{lastCreatedCase.caseId}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</span>
                        <span className="px-2 py-0.5 bg-red-50 text-red-500 rounded-full font-black text-[9px] uppercase tracking-wider">
                          {lastCreatedCase.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assigned To</span>
                        <span className="font-black text-secondary">
                          {lastCreatedCase.assignedTo?.fullName || 'Pending Assignment'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Created At</span>
                        <span className="font-black text-secondary">
                          {new Date(lastCreatedCase.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => setLastCreatedCase(null)}
                      className="w-full py-3 bg-secondary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                    >
                      Done / Close
                    </button>
                  </motion.div>

                ) : !showForm ? (
                  
                  // 2. Action Button to create a case (Optional, allows Executive to guide caller without logging case)
                  <motion.button 
                    key="action-button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setShowForm(true)}
                    className="w-full py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    <Plus size={16} /> Create New Support Case
                  </motion.button>

                ) : activeCase && !forceShowForm ? (
                  
                  // 3. Duplicate Prevention Alert Panel
                  <motion.div 
                    key="duplicate-alert"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-amber-50/50 p-6 rounded-[32px] border border-amber-100 flex flex-col gap-4 text-center items-center"
                  >
                    <div className="w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20">
                      <HelpCircle size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-secondary uppercase tracking-widest">Active Case Exists</h4>
                      <p className="text-[10px] text-gray-400 font-bold mt-1">This user already has an active support case.</p>
                    </div>

                    <div className="w-full flex flex-col gap-2.5 bg-white p-4 rounded-2xl border border-amber-100/50 text-xs text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Case ID</span>
                        <span className="font-black text-primary uppercase">{activeCase.caseId}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</span>
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-500 rounded-full font-black text-[9px] uppercase tracking-wider">
                          {activeCase.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assigned To</span>
                        <span className="font-black text-secondary">{activeCase.assignedTo?.fullName || 'Unassigned'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Created On</span>
                        <span className="font-black text-secondary">{new Date(activeCase.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="w-full flex flex-col gap-2">
                      <button 
                        onClick={() => { setSelectedCaseId(activeCase.caseId); setShowForm(false); }}
                        className="w-full py-3 bg-secondary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all"
                      >
                        View Existing Case
                      </button>
                      <button 
                        onClick={() => setForceShowForm(true)}
                        className="w-full py-3 bg-gray-50 border border-gray-200 text-secondary rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 active:scale-[0.99] transition-all"
                      >
                        Create New Case Anyway
                      </button>
                      <button 
                        onClick={() => { setShowForm(false); setForceShowForm(false); }}
                        className="w-full py-2.5 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-secondary transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>

                ) : (
                  
                  // 4. Expanded complaint logging form
                  <motion.div 
                    key="complaint-form"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-white p-6 rounded-[32px] border border-gray-105 shadow-soft"
                  >
                    <div className="flex justify-between items-center mb-5 border-b border-gray-50 pb-3">
                      <h3 className="text-sm font-black text-secondary flex items-center gap-2 uppercase tracking-widest text-xs">
                        <Plus className="text-primary" size={16} /> Log Support Ticket
                      </h3>
                      <button 
                        onClick={() => { setShowForm(false); setForceShowForm(false); }}
                        className="p-1 hover:bg-gray-55 text-gray-400 hover:text-secondary rounded-lg"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    <form onSubmit={handleCreateCase} className="flex flex-col gap-4">
                      
                      {/* Read-Only Caller Information */}
                      <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex flex-col gap-2">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1.5 mb-1">
                          Caller Information (Auto-Filled)
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div>
                            <span className="text-gray-400 block">Name</span>
                            <span className="font-bold text-secondary">{currentUser.fullName}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Mobile</span>
                            <span className="font-bold text-secondary">{currentUser.mobile}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">ID Code</span>
                            <span className="font-bold text-secondary uppercase">{getUserCode(currentUser)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Role</span>
                            <span className="font-bold text-primary uppercase">{currentUser.role}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">State</span>
                            <span className="font-bold text-secondary">{currentUser.state || '-'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">District</span>
                            <span className="font-bold text-secondary">{currentUser.district || '-'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Complaint Information */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Category</label>
                        <select 
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all font-medium text-secondary text-xs"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Sub Category</label>
                        <select 
                          value={subCategory}
                          onChange={(e) => setSubCategory(e.target.value)}
                          className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all font-medium text-secondary text-xs"
                        >
                          {(subCategoryOptions[category] || ['Other']).map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Priority</label>
                        <select 
                          value={priority}
                          onChange={(e) => setPriority(e.target.value as any)}
                          className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all font-medium text-secondary text-xs"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Subject</label>
                        <input 
                          type="text" 
                          required
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="Short summary of issue..."
                          className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all font-medium text-secondary text-xs"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Description</label>
                        <textarea 
                          required
                          rows={4}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Provide full details of caller's issue..."
                          className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all font-medium text-secondary text-xs resize-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Assign Case To</label>
                        <select 
                          value={assignedTo}
                          onChange={(e) => setAssignedTo(e.target.value)}
                          className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all font-medium text-secondary text-xs"
                        >
                          <option value="">Unassigned</option>
                          {assigneesList.map(assignee => (
                            <option key={assignee._id} value={assignee._id}>{assignee.fullName} ({assignee.role})</option>
                          ))}
                        </select>
                      </div>

                      {/* File Attachment */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Attachment</label>
                        <div className="relative flex items-center bg-gray-50 p-3.5 border border-dashed border-gray-200 rounded-xl">
                          <Paperclip className="text-gray-400 shrink-0 mr-3" size={16} />
                          <div className="flex-1 min-w-0">
                            {uploadingFile ? (
                              <span className="text-xs text-primary font-bold animate-pulse">Uploading...</span>
                            ) : attachmentUrl ? (
                              <span className="text-xs text-green-500 font-bold truncate block">File attached successfully</span>
                            ) : (
                              <span className="text-xs text-gray-400 font-medium">Add screenshot (Max 5MB)</span>
                            )}
                          </div>
                          <input 
                            type="file" 
                            onChange={handleFileChange}
                            accept="image/*,.pdf"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Support Information */}
                      <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex flex-col gap-2 text-[10px]">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1.5 mb-1">
                          Support Details
                        </span>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Created By</span>
                          <span className="font-bold text-secondary">{currentExecutiveName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Created Time</span>
                          <span className="font-bold text-secondary">{new Date().toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-2">
                        <button 
                          type="button"
                          onClick={() => { setShowForm(false); setForceShowForm(false); }}
                          className="flex-1 py-4 bg-gray-100 text-secondary rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-150 active:scale-[0.98] transition-all"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          disabled={creatingCase}
                          className="flex-1 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                        >
                          {creatingCase ? 'Creating...' : 'Save Case'}
                        </button>
                      </div>

                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Historical previous cases table */}
      <div className="lg:col-span-2">
        {currentUser ? (
          <PreviousCasesTable 
            cases={cases}
            loading={loadingCases}
            onSelectCase={(c) => {
              // Sliding Read-only detail drawer triggers for Executive inspection
              setSelectedCaseId(c.caseId);
            }}
          />
        ) : (
          <div className="bg-white p-12 text-center rounded-[40px] border border-dashed border-gray-200 min-h-[400px] flex flex-col justify-center items-center gap-4">
            <div className="w-16 h-16 bg-primary/5 text-primary rounded-full flex items-center justify-center">
              <User size={28} />
            </div>
            <h3 className="text-md font-black text-secondary">No Caller Selected</h3>
            <p className="text-xs text-gray-400 font-medium max-w-xs leading-relaxed">
              Use the lookup panel on the left to select a registered user and view their support ticket history logs.
            </p>
          </div>
        )}
      </div>

      {/* Drawer Overlay for Case Details */}
      {selectedCaseId && (
        <CaseDetailsDrawer
          caseId={selectedCaseId}
          onClose={() => setSelectedCaseId(null)}
          isAdmin={false} // Executive gets read-only view
          onCaseUpdated={handleCaseUpdated}
        />
      )}

    </div>
  );
}
