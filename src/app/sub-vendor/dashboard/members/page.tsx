'use client';

import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { User, Search, MapPin, Phone } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink } from "lucide-react";
import ChildProfileView from "@/components/features/dashboard/ChildProfileView";
import { useLanguage } from "@/context/LanguageContext";

const getStatusBadge = (status: string) => {
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-gray-100 text-gray-500' },
    documents_uploaded: { label: 'Docs Submitted', className: 'bg-blue-100 text-blue-600' },
    under_review: { label: 'Under Review', className: 'bg-amber-100 text-amber-600' },
    reupload_required: { label: 'Re-upload', className: 'bg-red-100 text-red-600' },
    approved: { label: 'Approved', className: 'bg-green-100 text-green-600' },
    active: { label: 'Active', className: 'bg-green-100 text-green-600' },
    rejected: { label: 'Rejected', className: 'bg-red-100 text-red-600' },
    suspended: { label: 'Suspended', className: 'bg-gray-200 text-gray-600' },
  };
  return map[status] || { label: status, className: 'bg-gray-100 text-gray-500' };
};

export default function SubVendorMembers() {
  const { t } = useLanguage();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const isFirstMount = useRef(true);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/sub-vendor/members?search=${search}`);
      if (res.data.success) setMembers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      fetchMembers();
      return;
    }
    if (search === "") {
      fetchMembers();
      return;
    }
    const delayDebounce = setTimeout(() => {
      fetchMembers();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <header>
          <h1 className="text-3xl md:text-4xl font-black text-secondary">Community Members</h1>
          <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">Direct members recruited within your regional network</p>
        </header>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft">
          <div className="flex gap-4 mb-8">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or mobile..." 
                className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr className="text-left border-b-2 border-gray-50">
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Member</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Membership</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned Staff</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-bold italic">Loading member records...</td></tr>
                ) : members.length === 0 ? (
                  <tr><td colSpan={6} className="p-20 text-center text-gray-400 font-bold italic">No members found.</td></tr>
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
                         <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${member.membershipStatus?.toLowerCase() === 'paid' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                           {t('status.' + member.membershipStatus?.toLowerCase(), member.membershipStatus)}
                         </span>
                      </td>
                      <td className="p-5 text-xs font-black text-secondary">
                        {member.assignedEmployeeId?.fullName || 'Direct'}
                      </td>
                      <td className="p-5">
                        {(() => {
                          const badge = getStatusBadge(member.accountStatus);
                          return (
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${badge.className}`}>
                              {t('status.' + member.accountStatus, badge.label)}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="p-5">
                        <button 
                          onClick={() => setSelectedChildId(member._id)}
                          className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-secondary hover:text-white transition-all shadow-sm flex items-center justify-center w-fit"
                          title="View Details"
                        >
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

        {/* Child Profile Modal */}
        <AnimatePresence>
          {selectedChildId && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-secondary/80 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="w-full max-w-5xl max-h-[90vh] overflow-hidden"
              >
                <ChildProfileView 
                  childId={selectedChildId}
                  onClose={() => setSelectedChildId(null)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
