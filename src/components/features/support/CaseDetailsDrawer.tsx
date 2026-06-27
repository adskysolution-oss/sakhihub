'use client';

import React, { useEffect, useState } from 'react';
import { 
  X, ClipboardList, User, Clock, MessageSquare, Paperclip, 
  ShieldCheck, Lock, Send, RefreshCw, AlertTriangle 
} from 'lucide-react';
import axios from 'axios';
import UserSummaryCard from './UserSummaryCard';
import PreviousCasesTable from './PreviousCasesTable';
import UserJourneyStepper from './UserJourneyStepper';

interface CaseDetailsDrawerProps {
  caseId: string | null;
  onClose: () => void;
  isAdmin: boolean;
  onCaseUpdated: (updatedCase: any) => void;
}

export default function CaseDetailsDrawer({ caseId, onClose, isAdmin, onCaseUpdated }: CaseDetailsDrawerProps) {
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'summary' | 'timeline' | 'notes' | 'attachments' | 'resolution' | 'history'>('overview');

  // Notes
  const [notes, setNotes] = useState<any[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // User Previous Cases
  const [previousCases, setPreviousCases] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Resolution Form State
  const [caseStatus, setCaseStatus] = useState<string>('open');
  const [resolutionType, setResolutionType] = useState<string>('Resolved');
  const [resolutionRemarks, setResolutionRemarks] = useState<string>('');
  const [updatingCase, setUpdatingCase] = useState(false);

  // Fetch case details, notes, and history lazily on caseId change
  useEffect(() => {
    if (!caseId) {
      setCaseData(null);
      setNotes([]);
      setPreviousCases([]);
      return;
    }

    const fetchCaseDetails = async () => {
      setLoading(true);
      try {
        // Fetch all cases again to get populate references, or fetch a specific endpoint. 
        // In our API, GET /api/admin/support-cases accepts filters, so we fetch by search/ID.
        const res = await axios.get(`/api/admin/support-cases?search=${caseId}`);
        if (res.data.success && res.data.data.length > 0) {
          const fetchedCase = res.data.data[0];
          setCaseData(fetchedCase);
          setCaseStatus(fetchedCase.status);
          setResolutionType(fetchedCase.resolutionType || 'Resolved');
          setResolutionRemarks(fetchedCase.resolutionRemarks || '');

          // Fetch Notes and User History in parallel lazily
          fetchNotes(fetchedCase._id);
          if (fetchedCase.user?._id) {
            fetchHistory(fetchedCase.user._id);
          }
        }
      } catch (err) {
        console.error('Failed to load case details', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCaseDetails();
    setActiveTab('overview'); // Reset to overview tab
  }, [caseId]);

  const fetchNotes = async (id: string) => {
    setLoadingNotes(true);
    try {
      const res = await axios.get(`/api/admin/support-cases/notes?caseId=${id}`);
      if (res.data.success) {
        setNotes(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load notes', err);
    } finally {
      setLoadingNotes(false);
    }
  };

  const fetchHistory = async (userId: string) => {
    setLoadingHistory(true);
    try {
      const res = await axios.get(`/api/admin/support-cases?userId=${userId}`);
      if (res.data.success) {
        setPreviousCases(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleUpdateResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseData) return;

    setUpdatingCase(true);
    try {
      const res = await axios.patch('/api/admin/support-cases', {
        id: caseData._id,
        status: caseStatus,
        resolutionType: ['resolved', 'closed'].includes(caseStatus) ? resolutionType : undefined,
        resolutionRemarks: resolutionRemarks || undefined
      });

      if (res.data.success) {
        setCaseData(res.data.data);
        onCaseUpdated(res.data.data);
        alert('Case resolution saved successfully');
      }
    } catch (err: any) {
      console.error(err);
      alert('Failed to update case: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingCase(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseData || !newNote.trim()) return;

    setAddingNote(true);
    try {
      const res = await axios.post('/api/admin/support-cases/notes', {
        caseId: caseData._id,
        note: newNote.trim()
      });

      if (res.data.success) {
        setNotes(prev => [res.data.data, ...prev]);
        setNewNote('');
      }
    } catch (err: any) {
      console.error(err);
      alert('Failed to add note: ' + (err.response?.data?.message || err.message));
    } finally {
      setAddingNote(false);
    }
  };

  if (!caseId) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-[100] flex flex-col border-l border-gray-100 animate-slideOver">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
        <div>
          <span className="text-xs font-black text-primary">{caseData?.caseId || 'Loading...'}</span>
          <h3 className="text-lg font-black text-secondary leading-tight mt-0.5">{caseData?.subject || 'Support Ticket'}</h3>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-50 text-gray-400 hover:text-secondary rounded-xl transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col justify-center items-center gap-3">
          <RefreshCw size={36} className="animate-spin text-primary" />
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Loading details...</p>
        </div>
      ) : caseData ? (
        <>
          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-150 bg-[#fafafa] overflow-x-auto no-scrollbar shrink-0">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'summary', label: 'User Profile' },
              { key: 'timeline', label: 'Timeline' },
              { key: 'notes', label: 'Internal Notes' },
              { key: 'attachments', label: 'Attachments' },
              { key: 'resolution', label: 'Resolution' },
              { key: 'history', label: 'History' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-5 py-3.5 text-xs font-black uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
                  activeTab === tab.key 
                    ? 'border-primary text-primary bg-white font-bold' 
                    : 'border-transparent text-gray-400 hover:text-secondary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Container */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-6">
                <UserJourneyStepper user={caseData.user} />
                
                <div className="flex flex-col gap-2 bg-[#FFF5F8] p-5 rounded-3xl border border-primary/5">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">Description</span>
                  <p className="text-sm font-medium text-secondary leading-relaxed whitespace-pre-wrap">{caseData.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Category</span>
                    <span className="text-xs font-black text-secondary uppercase">
                      {caseData.category} {caseData.subCategory ? `(${caseData.subCategory})` : ''}
                    </span>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Priority</span>
                    <span className="text-xs font-black text-secondary uppercase">{caseData.priority}</span>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Filed By</span>
                    <span className="text-xs font-black text-secondary block truncate">{caseData.createdBy?.fullName}</span>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Assigned To</span>
                    <span className="text-xs font-black text-secondary block truncate">{caseData.assignedTo?.fullName || 'Unassigned'}</span>
                  </div>
                </div>


                {/* Related User Modules (Quick Navigation Links) */}
                <div className="border-t border-gray-100 pt-6 flex flex-col gap-3">
                  <h4 className="text-[10px] font-black text-secondary uppercase tracking-widest">
                    Quick Navigation Modules
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={isAdmin ? `/admin/users?search=${encodeURIComponent(caseData.user?.fullName || '')}` : `/portal/profile`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 rounded-xl text-[10px] font-bold tracking-wide active:scale-95 transition-all"
                    >
                      View User Profile ↗
                    </a>
                    <a
                      href={isAdmin ? `/admin/finance` : `/portal/offline-payments`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 rounded-xl text-[10px] font-bold tracking-wide active:scale-95 transition-all"
                    >
                      View Payment Details ↗
                    </a>
                    <a
                      href={isAdmin ? `/admin/users` : `/portal/documents`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 rounded-xl text-[10px] font-bold tracking-wide active:scale-95 transition-all"
                    >
                      View User Documents ↗
                    </a>
                    <a
                      href={`/portal/network`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 rounded-xl text-[10px] font-bold tracking-wide active:scale-95 transition-all"
                    >
                      View Team Hierarchy ↗
                    </a>
                    {isAdmin && (
                      <a
                        href={`/admin/activity-logs`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 rounded-xl text-[10px] font-bold tracking-wide active:scale-95 transition-all"
                      >
                        View Activity Logs ↗
                      </a>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* USER PROFILE SUMMARY TAB */}
            {activeTab === 'summary' && (
              <UserSummaryCard user={caseData.user} />
            )}

            {/* TIMELINE TAB */}
            {activeTab === 'timeline' && (
              <div className="flex flex-col gap-6 pl-4 border-l border-gray-100 py-2">
                <div className="relative flex flex-col gap-1">
                  <div className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Case Created</span>
                  <p className="text-xs font-bold text-secondary">Filed by {caseData.createdBy?.fullName}</p>
                  <p className="text-[9px] text-gray-300 font-bold">{new Date(caseData.createdAt).toLocaleString()}</p>
                </div>

                {caseData.status !== 'open' && (
                  <div className="relative flex flex-col gap-1">
                    <div className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 bg-blue-500 rounded-full border border-white" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status Transition</span>
                    <p className="text-xs font-bold text-secondary">Ticket updated to {caseData.status.replace('_', ' ')}</p>
                    <p className="text-[9px] text-gray-300 font-bold">{new Date(caseData.updatedAt).toLocaleString()}</p>
                  </div>
                )}

                {['resolved', 'closed'].includes(caseData.status) && (
                  <div className="relative flex flex-col gap-1">
                    <div className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Case Resolved</span>
                    <p className="text-xs font-bold text-secondary">Resolved by {caseData.resolvedBy?.fullName || 'System'}</p>
                    <p className="text-[9px] text-gray-300 font-bold">{caseData.resolvedAt ? new Date(caseData.resolvedAt).toLocaleString() : 'N/A'}</p>
                  </div>
                )}
              </div>
            )}

            {/* INTERNAL NOTES TAB */}
            {activeTab === 'notes' && (
              <div className="flex flex-col gap-6">
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input 
                    type="text" 
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Type internal case update..."
                    className="flex-1 px-4 py-3 text-xs rounded-xl border border-gray-200 focus:border-primary outline-none text-secondary"
                  />
                  <button 
                    type="submit" 
                    disabled={addingNote || !newNote.trim()}
                    className="px-4 bg-primary text-white rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Send size={14} />
                  </button>
                </form>

                {loadingNotes ? (
                  <p className="text-center text-xs text-gray-400 animate-pulse">Loading notes...</p>
                ) : notes.length === 0 ? (
                  <p className="text-center text-xs text-gray-300 italic py-10">No internal notes added.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {notes.map((note) => (
                      <div key={note._id} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                        <p className="text-xs font-medium text-secondary leading-relaxed">{note.note}</p>
                        <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 mt-2">
                          <span>{note.createdBy?.fullName}</span>
                          <span>{new Date(note.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ATTACHMENTS TAB */}
            {activeTab === 'attachments' && (
              <div className="flex flex-col gap-4">
                {caseData.attachment ? (
                  <div className="p-6 bg-gray-50 border border-gray-150 rounded-3xl flex flex-col items-center gap-4">
                    <Paperclip className="text-primary animate-pulse" size={32} />
                    <div className="text-center">
                      <p className="text-xs font-black text-secondary">Document Attachment</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-1">Uploaded document or screenshot logs</p>
                    </div>
                    <a 
                      href={caseData.attachment} 
                      target="_blank" 
                      rel="noreferrer"
                      className="px-6 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all"
                    >
                      View Document
                    </a>
                  </div>
                ) : (
                  <div className="text-center py-16 border border-dashed border-gray-200 rounded-3xl text-xs font-medium text-gray-400">
                    No attachments logged for this case.
                  </div>
                )}
              </div>
            )}

            {/* RESOLUTION ACTION TAB */}
            {activeTab === 'resolution' && (
              <div className="flex flex-col gap-6">
                {isAdmin ? (
                  <form onSubmit={handleUpdateResolution} className="flex flex-col gap-4">
                    <h4 className="text-xs font-black text-secondary uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-50 pb-3">
                      <ShieldCheck size={16} className="text-green-500" /> Resolution Action Panel
                    </h4>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Update Ticket Status</label>
                      <select 
                        value={caseStatus}
                        onChange={(e) => setCaseStatus(e.target.value)}
                        className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none transition-all font-medium text-secondary text-xs"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    {['resolved', 'closed'].includes(caseStatus) && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resolution Category</label>
                        <select 
                          value={resolutionType}
                          onChange={(e) => setResolutionType(e.target.value)}
                          className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none transition-all font-medium text-secondary text-xs"
                        >
                          <option value="Resolved">Resolved</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Duplicate">Duplicate</option>
                          <option value="Not Applicable">Not Applicable</option>
                        </select>
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Remarks / Closure Log</label>
                      <textarea 
                        rows={4}
                        value={resolutionRemarks}
                        onChange={(e) => setResolutionRemarks(e.target.value)}
                        placeholder="Detail remarks of ticket resolution or closure details..."
                        className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none transition-all font-medium text-secondary text-xs resize-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={updatingCase}
                      className="w-full py-4 bg-secondary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                    >
                      {updatingCase ? 'Saving Resolution...' : 'Save Resolution Remarks'}
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-col gap-4">
                    <h4 className="text-xs font-black text-secondary uppercase tracking-widest flex items-center gap-1.5">
                      <Lock size={14} className="text-gray-400" /> Resolution Log (Read Only)
                    </h4>
                    
                    {['resolved', 'closed'].includes(caseData.status) ? (
                      <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Resolution Type</span>
                          <span className="text-xs font-black text-secondary">{caseData.resolutionType || 'Resolved'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Remarks</span>
                          <p className="text-xs font-medium text-secondary italic leading-relaxed">"{caseData.resolutionRemarks || 'No remarks added.'}"</p>
                        </div>
                        <div className="text-[10px] font-bold text-gray-400 mt-1 flex flex-col">
                          <span>Resolved By: {caseData.resolvedBy?.fullName}</span>
                          <span>Time: {caseData.resolvedAt ? new Date(caseData.resolvedAt).toLocaleString() : 'N/A'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 bg-gray-50 text-center rounded-2xl border border-gray-100 text-xs font-bold text-gray-400 italic">
                        No resolution logs. Case is currently {caseData.status.replace('_', ' ')}.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* CALLER PREVIOUS TICKETS HISTORY TAB */}
            {activeTab === 'history' && (
              <PreviousCasesTable 
                cases={previousCases} 
                loading={loadingHistory}
                onSelectCase={(c) => {
                  setCaseData(c);
                  setCaseStatus(c.status);
                  setResolutionType(c.resolutionType || 'Resolved');
                  setResolutionRemarks(c.resolutionRemarks || '');
                  fetchNotes(c._id);
                }}
              />
            )}

          </div>
        </>
      ) : (
        <div className="flex-grow flex flex-col justify-center items-center p-12 text-center text-gray-400 font-semibold gap-3">
          <AlertTriangle size={36} className="text-gray-300" />
          <p>Ticket details failed to load.</p>
        </div>
      )}
    </div>
  );
}
