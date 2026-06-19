'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { MapPin, Save, User, ChevronRight, Plus, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const MAJOR_STATES = [
  'Andhra Pradesh',
  'Bihar',
  'Delhi',
  'Gujarat',
  'Haryana',
  'Karnataka',
  'Madhya Pradesh',
  'Maharashtra',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Uttar Pradesh'
];

export default function AssignmentsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<any | null>(null);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [saving, setSaving] = useState(false);

  // Assignment states
  const [scope, setScope] = useState<'all' | 'regional'>('all');
  const [assignedStates, setAssignedStates] = useState<string[]>([]);
  const [assignedDistricts, setAssignedDistricts] = useState<string[]>([]);
  
  // Custom input states
  const [customState, setCustomState] = useState('');
  const [customDistrict, setCustomDistrict] = useState('');

  const fetchAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const res = await axios.get('/api/admin/operations-admins');
      if (res.data.success) {
        const data = res.data.data || [];
        setAdmins(data);
        if (data.length > 0) {
          selectAdmin(data[0]);
        }
      }
    } catch (err: any) {
      toast.error('Failed to load operations admins');
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const selectAdmin = (admin: any) => {
    setSelectedAdmin(admin);
    setScope(admin.assignedScope || 'all');
    setAssignedStates(admin.assignedStates || []);
    setAssignedDistricts(admin.assignedDistricts || []);
  };

  const handleSaveAssignments = async () => {
    if (!selectedAdmin) return;
    setSaving(true);
    try {
      const res = await axios.post('/api/admin/assignments', {
        userId: selectedAdmin._id,
        assignedScope: scope,
        assignedStates,
        assignedDistricts,
        assignedRegions: [] // reserved
      });
      if (res.data.success) {
        toast.success(`Regional assignments for ${selectedAdmin.fullName} updated successfully`);
        // Update local admin state
        setAdmins(admins.map(a => a._id === selectedAdmin._id ? { 
          ...a, 
          assignedScope: scope,
          assignedStates,
          assignedDistricts
        } : a));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update assignments');
    } finally {
      setSaving(false);
    }
  };

  const handleAddState = (stateName: string) => {
    const formatted = stateName.trim();
    if (!formatted) return;
    if (assignedStates.includes(formatted)) {
      toast.error('State already added');
      return;
    }
    setAssignedStates([...assignedStates, formatted]);
  };

  const handleRemoveState = (stateName: string) => {
    setAssignedStates(assignedStates.filter(s => s !== stateName));
  };

  const handleAddDistrict = () => {
    const formatted = customDistrict.trim();
    if (!formatted) return;
    if (assignedDistricts.includes(formatted)) {
      toast.error('District already added');
      return;
    }
    setAssignedDistricts([...assignedDistricts, formatted]);
    setCustomDistrict('');
  };

  const handleRemoveDistrict = (districtName: string) => {
    setAssignedDistricts(assignedDistricts.filter(d => d !== districtName));
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-black text-secondary">Regional Scoping & Assignments</h2>
          <p className="text-gray-400 font-bold mt-1">Assign states, districts, and regions to restrict operations data boundaries.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Admin List Column */}
          <div className="lg:col-span-4 bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-[#fafafa]">
              <h3 className="text-xs font-black text-secondary uppercase tracking-widest">Select Administrator</h3>
            </div>
            <div className="flex flex-col max-h-[500px] overflow-y-auto">
              {loadingAdmins ? (
                <p className="p-6 text-center text-gray-400 italic text-sm">Loading...</p>
              ) : admins.length > 0 ? (
                admins.map(admin => {
                  const isSelected = selectedAdmin?._id === admin._id;
                  return (
                    <button
                      key={admin._id}
                      onClick={() => selectAdmin(admin)}
                      className={`p-5 text-left border-b border-gray-50 flex items-center justify-between transition-colors ${
                        isSelected ? 'bg-primary/5 text-primary' : 'bg-transparent text-secondary hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                          isSelected ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {admin.fullName[0].toUpperCase()}
                        </div>
                        <div>
                          <p className={`text-xs font-black ${isSelected ? 'text-primary' : 'text-secondary'} flex items-center gap-1.5`}>
                            {admin.fullName}
                            {admin.role === 'employee' && (
                              <span className="px-1.5 py-0.5 text-[8px] bg-amber-100 text-amber-700 rounded font-black uppercase tracking-wider">
                                DC
                              </span>
                            )}
                          </p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5 tracking-wider">
                            Scope: {admin.assignedScope === 'all' ? 'All India' : 'Regional'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={14} className={isSelected ? 'text-primary' : 'text-gray-300'} />
                    </button>
                  );
                })
              ) : (
                <p className="p-6 text-center text-gray-400 italic text-sm">No operations admins found.</p>
              )}
            </div>
          </div>

          {/* Assignments Selection Column */}
          <div className="lg:col-span-8 bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-50 bg-[#fafafa] flex justify-between items-center">
              <div>
                <h3 className="text-xs font-black text-secondary uppercase tracking-widest">
                  Configure Territory Scope
                </h3>
                {selectedAdmin && (
                  <p className="text-[10px] text-primary font-black uppercase mt-1 tracking-wider">
                    Target: {selectedAdmin.fullName}
                  </p>
                )}
              </div>
              <button
                disabled={!selectedAdmin || saving}
                onClick={handleSaveAssignments}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                <Save size={14} /> {saving ? 'Saving...' : 'Save Territory'}
              </button>
            </div>

            <div className="p-8 flex flex-col gap-6 max-h-[600px] overflow-y-auto">
              {selectedAdmin ? (
                <>
                  {/* Scope Selector */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scope Mode</label>
                    <div className="grid grid-cols-2 gap-4 mt-1">
                      <div
                        onClick={() => setScope('all')}
                        className={`p-5 rounded-2xl border-2 cursor-pointer text-center transition-all ${
                          scope === 'all'
                            ? 'border-primary bg-primary/5 text-primary font-bold'
                            : 'border-gray-100 bg-white text-secondary hover:border-gray-200'
                        }`}
                      >
                        <MapPin size={24} className="mx-auto mb-2" />
                        <h4 className="text-xs font-black uppercase tracking-wider">All India</h4>
                        <p className="text-[9px] text-gray-400 font-bold mt-1">Has access to all districts and states</p>
                      </div>
                      <div
                        onClick={() => setScope('regional')}
                        className={`p-5 rounded-2xl border-2 cursor-pointer text-center transition-all ${
                          scope === 'regional'
                            ? 'border-primary bg-primary/5 text-primary font-bold'
                            : 'border-gray-100 bg-white text-secondary hover:border-gray-200'
                        }`}
                      >
                        <MapPin size={24} className="mx-auto mb-2 text-primary" />
                        <h4 className="text-xs font-black uppercase tracking-wider">Regional Scope</h4>
                        <p className="text-[9px] text-gray-400 font-bold mt-1">Restricted to specified regions</p>
                      </div>
                    </div>
                  </div>

                  {scope === 'regional' && (
                    <>
                      {/* States selector */}
                      <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assign States</label>
                        
                        {/* Major States Quick Select list */}
                        <div className="flex flex-wrap gap-2">
                          {MAJOR_STATES.map(state => {
                            const isAssigned = assignedStates.includes(state);
                            return (
                              <button
                                key={state}
                                type="button"
                                onClick={() => isAssigned ? handleRemoveState(state) : handleAddState(state)}
                                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                                  isAssigned 
                                    ? 'bg-primary/10 border-primary/20 text-primary' 
                                    : 'bg-white border-gray-100 text-secondary hover:border-gray-200'
                                }`}
                              >
                                {state}
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom State Add input */}
                        <div className="flex gap-2 items-center mt-2">
                          <input
                            type="text"
                            placeholder="Add another state name..."
                            value={customState}
                            onChange={(e) => setCustomState(e.target.value)}
                            className="bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              handleAddState(customState);
                              setCustomState('');
                            }}
                            className="p-3 bg-secondary text-white rounded-xl text-xs font-bold hover:bg-secondary-light"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Districts selector */}
                      <div className="flex flex-col gap-3 border-t border-gray-50 pt-6">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assign Districts</label>
                        
                        {/* Selected Districts badges */}
                        {assignedDistricts.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {assignedDistricts.map(district => (
                              <span
                                key={district}
                                className="px-3.5 py-1.5 bg-secondary/10 border border-secondary/20 text-secondary font-bold text-xs rounded-xl flex items-center gap-1.5"
                              >
                                {district}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDistrict(district)}
                                  className="text-secondary hover:text-red-500"
                                >
                                  <X size={12} />
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-gray-400 font-bold italic uppercase tracking-wider">No specific districts assigned. (Access governed by assigned states)</p>
                        )}

                        <div className="flex gap-2 items-center mt-1">
                          <input
                            type="text"
                            placeholder="Type district name to add (e.g. Bhopal, Indore, Kurnool)..."
                            value={customDistrict}
                            onChange={(e) => setCustomDistrict(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddDistrict(); }}
                            className="bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none flex-1"
                          />
                          <button
                            type="button"
                            onClick={handleAddDistrict}
                            className="p-3 bg-secondary text-white rounded-xl text-xs font-bold hover:bg-secondary-light"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center py-20 text-gray-400 font-semibold italic">
                  Select an administrator to configure territory scope mapping.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
