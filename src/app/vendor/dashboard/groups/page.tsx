'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { Layout, Search, Users, MapPin, ExternalLink, ShieldCheck } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

export default function VendorGroups() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get('/api/vendor/groups');
        if (res.data.success) setGroups(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <header>
          <h1 className="text-3xl md:text-4xl font-black text-secondary">Sakhi Groups</h1>
          <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">Overview of all community groups formed across your network</p>
        </header>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft">
          <div className="flex gap-4 mb-8">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by group name or location..." 
                className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr className="text-left border-b-2 border-gray-50">
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Group Name</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Village / Block</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Members</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned Staff</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-bold italic">Scanning community groups...</td></tr>
                ) : groups.length === 0 ? (
                  <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-bold italic">No groups found in your network.</td></tr>
                ) : (
                  groups.map((group) => (
                    <tr key={group._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer group">
                      <td className="p-5">
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xl shadow-sm">
                            {group.groupName[0]}
                          </div>
                          <p className="font-black text-secondary leading-tight">{group.groupName}</p>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                          <MapPin size={12} className="text-primary" /> {group.village}, {group.block}
                        </div>
                      </td>
                      <td className="p-5">
                         <div className="flex items-center gap-2">
                           <Users size={14} className="text-gray-300" />
                           <span className="text-sm font-black text-secondary">{group.members?.length || 0}</span>
                         </div>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-secondary">{group.assignedEmployeeId?.fullName || 'Unassigned'}</span>
                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{group.assignedEmployeeId?.employeeId || ''}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <button className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-secondary hover:text-white transition-all shadow-sm">
                          <ExternalLink size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
