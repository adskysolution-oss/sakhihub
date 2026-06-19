'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { MapPin, Save, ChevronRight, Plus, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function DistrictCoordinatorsPage() {
  const [coordinators, setCoordinators] = useState<any[]>([]);
  const [selectedCoordinator, setSelectedCoordinator] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Scoping state
  const [assignedBlocks, setAssignedBlocks] = useState<string[]>([]);
  const [customBlock, setCustomBlock] = useState('');

  const fetchCoordinators = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/operations-admins');
      if (res.data.success) {
        // Filter to only District Coordinators (role employee)
        const dcs = (res.data.data || []).filter(
          (u: any) =>
            u.role === 'employee' &&
            ['District Coordinator', 'District Project Officer'].includes(u.designation || '')
        );
        setCoordinators(dcs);
        if (dcs.length > 0) {
          selectCoordinator(dcs[0]);
        }
      }
    } catch (err: any) {
      toast.error('Failed to load District Coordinators');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoordinators();
  }, []);

  const selectCoordinator = (dc: any) => {
    setSelectedCoordinator(dc);
    setAssignedBlocks(dc.assignedBlocks || []);
  };

  const handleSaveBlocks = async () => {
    if (!selectedCoordinator) return;
    setSaving(true);
    try {
      const res = await axios.post('/api/admin/assignments', {
        userId: selectedCoordinator._id,
        assignedScope: 'block',
        assignedStates: selectedCoordinator.assignedStates || [],
        assignedDistricts: selectedCoordinator.assignedDistricts || [],
        assignedBlocks,
        assignedRegions: []
      });
      if (res.data.success) {
        toast.success(`Block assignments for ${selectedCoordinator.fullName} updated successfully`);
        // Update local state
        setCoordinators(
          coordinators.map(c =>
            c._id === selectedCoordinator._id
              ? { ...c, assignedBlocks }
              : c
          )
        );
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update assignments');
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlock = () => {
    const formatted = customBlock.trim();
    if (!formatted) return;
    if (assignedBlocks.includes(formatted)) {
      toast.error('Block already added');
      return;
    }
    setAssignedBlocks([...assignedBlocks, formatted]);
    setCustomBlock('');
  };

  const handleRemoveBlock = (blockName: string) => {
    setAssignedBlocks(assignedBlocks.filter(b => b !== blockName));
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-black text-secondary">District Coordinators Management</h2>
          <p className="text-gray-400 font-bold mt-1">Assign blocks to District Coordinators to manage their coordination scope.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* List Column */}
          <div className="lg:col-span-4 bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-[#fafafa]">
              <h3 className="text-xs font-black text-secondary uppercase tracking-widest">Select Coordinator</h3>
            </div>
            <div className="flex flex-col max-h-[500px] overflow-y-auto">
              {loading ? (
                <p className="p-6 text-center text-gray-400 italic text-sm">Loading...</p>
              ) : coordinators.length > 0 ? (
                coordinators.map(dc => {
                  const isSelected = selectedCoordinator?._id === dc._id;
                  return (
                    <button
                      key={dc._id}
                      onClick={() => selectCoordinator(dc)}
                      className={`p-5 text-left border-b border-gray-50 flex items-center justify-between transition-colors ${
                        isSelected ? 'bg-primary/5 text-primary' : 'bg-transparent text-secondary hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                          isSelected ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {dc.fullName[0].toUpperCase()}
                        </div>
                        <div>
                          <p className={`text-xs font-black ${isSelected ? 'text-primary' : 'text-secondary'}`}>
                            {dc.fullName}
                          </p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5 tracking-wider">
                            {dc.designation || 'District Coordinator'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={14} className={isSelected ? 'text-primary' : 'text-gray-300'} />
                    </button>
                  );
                })
              ) : (
                <p className="p-6 text-center text-gray-400 italic text-sm">No District Coordinators found.</p>
              )}
            </div>
          </div>

          {/* Configuration Column */}
          <div className="lg:col-span-8 bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-50 bg-[#fafafa] flex justify-between items-center">
              <div>
                <h3 className="text-xs font-black text-secondary uppercase tracking-widest">
                  Configure Block Assignments
                </h3>
                {selectedCoordinator && (
                  <p className="text-[10px] text-primary font-black uppercase mt-1 tracking-wider">
                    Target: {selectedCoordinator.fullName} ({selectedCoordinator.designation})
                  </p>
                )}
              </div>
              <button
                disabled={!selectedCoordinator || saving}
                onClick={handleSaveBlocks}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                <Save size={14} /> {saving ? 'Saving...' : 'Save Blocks'}
              </button>
            </div>

            <div className="p-8 flex flex-col gap-6 max-h-[600px] overflow-y-auto">
              {selectedCoordinator ? (
                <div className="flex flex-col gap-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned Blocks</label>

                  {assignedBlocks.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {assignedBlocks.map(block => (
                        <span
                          key={block}
                          className="px-3.5 py-1.5 bg-secondary/10 border border-secondary/20 text-secondary font-bold text-xs rounded-xl flex items-center gap-1.5"
                        >
                          {block}
                          <button
                            type="button"
                            onClick={() => handleRemoveBlock(block)}
                            className="text-secondary hover:text-red-500"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-400 font-bold italic uppercase tracking-wider">
                      No specific blocks assigned yet.
                    </p>
                  )}

                  <div className="flex gap-2 items-center mt-2">
                    <input
                      type="text"
                      placeholder="Type block name to add (e.g. Khargone, Kasrawad)..."
                      value={customBlock}
                      onChange={(e) => setCustomBlock(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddBlock();
                      }}
                      className="bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleAddBlock}
                      className="p-3 bg-secondary text-white rounded-xl text-xs font-bold hover:bg-secondary-light"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-gray-400 font-semibold italic">
                  Select a coordinator to configure block assignments.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
