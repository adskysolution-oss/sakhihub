'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import AbhaCardView from '@/components/shared/AbhaCardView';
import { 
  Heart, Search, User, Filter, 
  ExternalLink, Printer, X, Eye, 
  Calendar, Phone, ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function AdminAbhaPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCard, setSelectedCard] = useState<any>(null);

  // Fetch ABHA records from the backend API
  const fetchAbhaRecords = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/admin/abha?search=${search}&role=${roleFilter}&status=${statusFilter}`
      );
      if (res.data.success) {
        setCards(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load ABHA records:', err);
      toast.error('Failed to retrieve ABHA list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAbhaRecords();
    }, 400);
    return () => clearTimeout(timer);
  }, [search, roleFilter, statusFilter]);

  // Body Scroll Lock when modal is open
  useEffect(() => {
    if (selectedCard) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedCard]);

  const handlePrint = () => {
    // Open a print window or trigger print specifically for the card
    const printContent = document.getElementById('abha-physical-card');
    if (!printContent) return;

    window.print();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-700';
      case 'vendor':
        return 'bg-blue-100 text-blue-700';
      case 'sub_vendor':
        return 'bg-cyan-100 text-cyan-700';
      case 'employee':
        return 'bg-amber-100 text-amber-700';
      case 'member':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatRole = (role: string) => {
    return role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A';
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-start flex-wrap gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-secondary flex items-center gap-3">
              <Heart className="text-[#D91656] fill-[#D91656]" size={36} /> ABHA Registry
            </h1>
            <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">
              Manage and review users with verified ABDM Health IDs.
            </p>
          </div>
        </div>

        {/* Search & Filters Panel */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft">
          <div className="flex gap-4 mb-8 flex-wrap">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[300px]">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, mobile, ABHA number or address..." 
                className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-[#D91656]/10 transition-all"
              />
            </div>

            {/* Filter Selects */}
            <div className="flex gap-3 flex-wrap">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-[#D91656]/20 transition-all cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="vendor">Vendor</option>
                <option value="sub_vendor">Sub-Vendor</option>
                <option value="employee">Employee</option>
                <option value="member">Member</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-[#D91656]/20 transition-all cursor-pointer"
              >
                <option value="all">All Verification Statuses</option>
                <option value="linked">Linked Existing ABHA</option>
                <option value="created">Created New ABHA</option>
              </select>
            </div>
          </div>

          {/* Records Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr className="text-left border-b-2 border-gray-50">
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">User Profile</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">ABHA Details</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Linkage Status</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Verified At</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-20 text-center text-gray-400 font-bold italic">
                      Fetching ABHA database records...
                    </td>
                  </tr>
                ) : cards.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-20 text-center text-gray-400 font-bold italic">
                      No ABHA records found matching criteria.
                    </td>
                  </tr>
                ) : (
                  cards.map((card) => (
                    <tr 
                      key={card._id} 
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer group"
                      onClick={() => setSelectedCard(card)}
                    >
                      <td className="p-5">
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-black text-xl shadow-md overflow-hidden shrink-0">
                            {card.profilePayload.profilePhoto ? (
                              <img 
                                src={card.profilePayload.profilePhoto} 
                                alt={card.profilePayload.fullName} 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              card.profilePayload.fullName[0].toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-black text-secondary leading-tight">{card.profilePayload.fullName}</p>
                            <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1 mt-1">
                              <Phone size={10} /> {card.profilePayload.mobile}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-5">
                        <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider ${getRoleBadge(card.userId?.role)}`}>
                          {formatRole(card.userId?.role)}
                        </span>
                      </td>

                      <td className="p-5">
                        <div className="flex flex-col text-left">
                          <span className="font-black text-secondary text-sm tracking-wider">{card.abhaNumber}</span>
                          <span className="text-xs text-teal-600 font-bold mt-0.5 lowercase">{card.abhaAddress}</span>
                        </div>
                      </td>

                      <td className="p-5">
                        <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          card.status === 'created' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {card.status === 'created' ? 'Enrolled New' : 'Linked Existing'}
                        </span>
                      </td>

                      <td className="p-5">
                        <span className="text-xs text-gray-500 font-bold flex items-center gap-1.5">
                          <Calendar size={12} className="text-gray-400" />
                          {new Date(card.abhaVerifiedAt || card.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </td>

                      <td className="p-5" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => setSelectedCard(card)}
                          className="p-2.5 bg-secondary text-white rounded-xl shadow-lg hover:scale-105 hover:bg-secondary-light transition-all flex items-center gap-1.5 text-xs font-black uppercase tracking-wider"
                          title="View Card Details"
                        >
                          <Eye size={14} /> View Card
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal display for selected ABHA Card */}
        <AnimatePresence>
          {selectedCard && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 overflow-hidden">
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setSelectedCard(null)}
                className="absolute inset-0 bg-secondary/60 backdrop-blur-md" 
              />

              {/* Modal Container */}
              <motion.div 
                initial={{ scale: 0.9, y: 20, opacity: 0 }} 
                animate={{ scale: 1, y: 0, opacity: 1 }} 
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                className="relative bg-white w-full max-w-2xl rounded-t-[40px] md:rounded-[40px] overflow-hidden shadow-2xl z-10 p-8 md:p-12 flex flex-col max-h-[90vh]"
              >
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4 print:hidden">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={26} className="text-teal-600" />
                    <div>
                      <h2 className="text-xl font-black text-secondary">Official ABHA Record</h2>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                        Verified via ABDM Registry
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handlePrint}
                      className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                      title="Print Card"
                    >
                      <Printer size={18} />
                    </button>
                    <button 
                      onClick={() => setSelectedCard(null)}
                      className="p-3 bg-gray-50 text-gray-400 hover:text-secondary rounded-xl transition-all shadow-sm"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Modal Body - Scrollable */}
                <div className="overflow-y-auto flex-1 flex flex-col items-center justify-center py-6 custom-scrollbar">
                  <AbhaCardView card={selectedCard} />
                  
                  {/* Additional Metadata */}
                  <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-[550px] text-left text-xs bg-gray-50 p-5 rounded-2xl border border-gray-100 print:hidden font-bold text-gray-500">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-gray-400">SakhiHub User ID</p>
                      <p className="text-secondary mt-0.5 font-black uppercase tracking-wider">{selectedCard.userId?.fullName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-gray-400">Linked Account Role</p>
                      <p className="text-secondary mt-0.5 font-black">{formatRole(selectedCard.userId?.role)}</p>
                    </div>
                    <div className="col-span-2 border-t border-gray-200/60 pt-3">
                      <p className="text-[9px] uppercase tracking-widest text-gray-400">ABDM Transaction ID</p>
                      <p className="font-mono text-[10px] text-gray-700 mt-0.5 break-all">{selectedCard.transactionId || 'Direct Verification linkage'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}
