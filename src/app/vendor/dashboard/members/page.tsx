'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { User, Search, MapPin, Phone, Mail, IndianRupee, ShieldCheck } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

export default function VendorMembers() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get('/api/vendor/members');
        if (res.data.success) setMembers(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <header>
          <h1 className="text-3xl md:text-4xl font-black text-secondary">All Members</h1>
          <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">Complete list of registered sakhis across your network hierarchy</p>
        </header>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft">
          <div className="flex gap-4 mb-8">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search members by name or mobile..." 
                className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr className="text-left border-b-2 border-gray-50">
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Member Profile</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Village & Pincode</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Membership</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned Staff</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-bold italic">Retrieving member records...</td></tr>
                ) : members.length === 0 ? (
                  <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-bold italic">No members found.</td></tr>
                ) : (
                  members.map((member) => (
                    <tr key={member._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer group">
                      <td className="p-5">
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center font-black text-xl shadow-sm">
                            {member.name[0]}
                          </div>
                          <div>
                            <p className="font-black text-secondary leading-tight">{member.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold mt-1">{member.mobile}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-xs text-gray-500 font-bold">
                        <MapPin size={12} className="inline mr-1 text-primary" /> {member.village}, {member.pincode}
                      </td>
                      <td className="p-5">
                         <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${member.membershipStatus === 'paid' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                           {member.membershipStatus}
                         </span>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-secondary">{member.assignedEmployeeId?.fullName || 'Direct'}</span>
                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{member.assignedEmployeeId?.employeeId || ''}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${member.accountStatus === 'active' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                          {member.accountStatus}
                        </span>
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
