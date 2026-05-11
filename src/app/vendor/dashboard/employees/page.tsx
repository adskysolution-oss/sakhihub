'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { Briefcase, Search, Plus, MapPin, Phone, Mail, ExternalLink, ShieldCheck, ClipboardList } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

export default function VendorEmployees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get('/api/vendor/employees');
        if (res.data.success) setEmployees(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <header className="flex justify-between items-start flex-wrap gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-secondary">Field Force</h1>
            <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">Manage all field employees operating within your network</p>
          </div>
          <button className="btn-primary py-4 px-8 shadow-xl shadow-primary/20">
            <Plus size={20} /> Add Field Staff
          </button>
        </header>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft">
          <div className="flex gap-4 mb-8">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name, ID or mobile..." 
                className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr className="text-left border-b-2 border-gray-50">
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Affiliation</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-bold italic">Gathering field force data...</td></tr>
                ) : employees.length === 0 ? (
                  <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-bold italic">No field staff found in your hierarchy.</td></tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer group">
                      <td className="p-5">
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-black text-xl shadow-sm">
                            {emp.fullName[0]}
                          </div>
                          <div>
                            <p className="font-black text-secondary leading-tight">{emp.fullName}</p>
                            <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">{emp.employeeId || 'ID Pending'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                         <div className="flex flex-col">
                           <span className="text-xs font-black text-secondary">{emp.subVendorCode ? 'Sub-Vendor Staff' : 'Direct Staff'}</span>
                           <span className="text-[9px] text-primary font-black uppercase tracking-widest">{emp.subVendorCode || 'Primary'}</span>
                         </div>
                      </td>
                      <td className="p-5 text-xs text-gray-500 font-bold">
                        <MapPin size={12} className="inline mr-1 text-primary" /> {emp.district}
                      </td>
                      <td className="p-5">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${emp.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex gap-2">
                          <button className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm">
                            <ClipboardList size={16} />
                          </button>
                          <button className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-secondary hover:text-white transition-all shadow-sm">
                            <ExternalLink size={16} />
                          </button>
                        </div>
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
