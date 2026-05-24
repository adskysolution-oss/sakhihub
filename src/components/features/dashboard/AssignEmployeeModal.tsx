'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, UserCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface AssignEmployeeModalProps {
  member: any;
  onClose: (assigned: boolean) => void;
}

export default function AssignEmployeeModal({ member, onClose }: AssignEmployeeModalProps) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(`/api/admin/employees?search=${search}`);
        if (res.data.success) setEmployees(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [search]);

  const handleAssign = async (employeeId: string) => {
    setAssigning(employeeId);
    try {
      const res = await axios.patch('/api/admin/members', { 
        id: member._id, 
        assignedEmployeeId: employeeId 
      });
      if (res.data.success) {
        onClose(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Assignment failed");
    } finally {
      setAssigning(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={() => onClose(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-2xl font-black text-secondary">Assign Employee</h3>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Pick field agent for {member.name}</p>
          </div>
          <button onClick={() => onClose(false)} className="p-2 hover:bg-white rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="relative mb-6">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, ID or mobile..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-3">
            {loading ? (
              <div className="py-20 text-center"><Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" /></div>
            ) : employees.length === 0 ? (
              <div className="py-20 text-center text-gray-400 font-bold">No employees found.</div>
            ) : (
              employees.map(emp => (
                <div key={emp._id} className="p-4 rounded-2xl border border-gray-50 hover:border-primary/20 hover:bg-primary/5 transition-all flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <UserCircle size={24} />
                    </div>
                    <div>
                      <p className="font-black text-secondary">{emp.fullName}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{emp.employeeId || 'No ID'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAssign(emp._id)}
                    disabled={!!assigning}
                    className="px-6 py-2 bg-secondary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-secondary/10 disabled:opacity-50"
                  >
                    {assigning === emp._id ? 'Assigning...' : 'Assign'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
