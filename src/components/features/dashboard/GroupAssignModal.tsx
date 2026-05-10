'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, ChevronDown, CheckCircle2, AlertCircle, MapPin, Search } from 'lucide-react';
import axios from 'axios';

interface GroupAssignModalProps {
  member: any;
  onClose: (assigned?: boolean) => void;
}

export default function GroupAssignModal({ member, onClose }: GroupAssignModalProps) {
  const [groups, setGroups] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [assigning, setAssigning] = React.useState(false);
  const [selectedGroupId, setSelectedGroupId] = React.useState("");
  const [error, setError] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/groups');
        if (res.data.success) {
          setGroups(res.data.data);
        }
      } catch (err: any) {
        setError("Failed to load groups. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const handleAssign = async () => {
    if (!selectedGroupId) return;
    setAssigning(true);
    setError("");
    try {
      const res = await axios.patch(`/api/member/${member._id}/group-assign`, { groupId: selectedGroupId });
      if (res.data.success) {
        onClose(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to assign group. Please try again.");
    } finally {
      setAssigning(false);
    }
  };

  const filteredGroups = groups.filter(g => 
    g.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.village.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-secondary/40 backdrop-blur-md flex items-center justify-center z-[1100] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-[500px] rounded-[40px] shadow-2xl overflow-hidden relative border border-white/20"
      >
        {/* Close Button */}
        <button
          onClick={() => onClose()}
          className="absolute right-6 top-6 w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center transition-all z-10"
        >
          <X size={20} className="text-gray-400" />
        </button>

        <div className="p-8 md:p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
              <Users size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-secondary">Assign Group</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">FOR {member.name}</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-2xl text-xs font-bold flex items-center gap-3 border border-red-100">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="flex flex-col gap-6">
            {/* Search Box */}
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder="Search group name or village..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-semibold transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Select Available Group</label>
              <div className="relative group">
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  disabled={loading}
                  className="w-full pl-4 pr-12 py-5 rounded-[24px] border-2 border-gray-100 bg-gray-50 focus:outline-none focus:border-primary focus:bg-white transition-all appearance-none font-bold text-secondary text-sm cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  <option value="">{loading ? "Loading groups..." : "Choose a group from list..."}</option>
                  {filteredGroups.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.groupName} ({g.village})
                    </option>
                  ))}
                </select>
                <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none" />
              </div>
              {!loading && filteredGroups.length === 0 && (
                <p className="text-[10px] text-amber-500 font-bold italic mt-2 pl-2 flex items-center gap-1">
                   <AlertCircle size={12} /> No matching groups found in your area.
                </p>
              )}
            </div>

            {selectedGroupId && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-5 bg-primary/5 rounded-3xl border border-primary/10 flex items-start gap-4"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected Group Location</p>
                  <p className="text-sm font-bold text-secondary mt-1">
                    {groups.find(g => g._id === selectedGroupId)?.village}, {groups.find(g => g._id === selectedGroupId)?.block}
                  </p>
                </div>
              </motion.div>
            )}

            <div className="mt-4 flex flex-col gap-3">
              <button
                onClick={handleAssign}
                disabled={!selectedGroupId || assigning || loading}
                className="btn-primary w-full py-5 justify-center text-sm shadow-2xl shadow-primary/25 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {assigning ? "Assigning Member..." : "Confirm Assignment"}
                {!assigning && <CheckCircle2 size={18} className="ml-2" />}
              </button>
              <button
                onClick={() => onClose()}
                className="w-full py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-secondary transition-colors"
              >
                Cancel and Go Back
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
