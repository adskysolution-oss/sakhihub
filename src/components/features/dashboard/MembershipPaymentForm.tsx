'use client';

import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, CreditCard, CheckCircle, ArrowLeft, User, Search,
  QrCode, Printer, Share2, Banknote, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Link from 'next/link';

export default function MembershipPaymentForm({ onCancel, onSuccess }: { onCancel: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Online'>('Cash');
  const [receipt, setReceipt] = useState<any>(null);

  const fetchInitialMembers = async () => {
    try {
      const res = await axios.get('/api/members');
      if (res.data.success) setSearchResults(res.data.data);
    } catch (err) {
      console.error("Failed to fetch initial members", err);
    }
  };

  useEffect(() => {
    fetchInitialMembers();
  }, []);

  const searchMember = async () => {
    try {
      const res = await axios.get(`/api/members?search=${searchTerm}`);
      if (res.data.success) setSearchResults(res.data.data);
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const handlePayment = async () => {
    if (!selectedMember) return;
    setLoading(true);
    try {
      const gId = typeof selectedMember.groupId === 'object' ? selectedMember.groupId._id : selectedMember.groupId;
      const res = await axios.post('/api/memberships', {
        memberId: selectedMember._id,
        groupId: gId,
        amount: 100,
        paymentMode
      });
      if (res.data.success) {
        setReceipt(res.data.data);
      }
    } catch (err) {
      console.error("Payment failed", err);
    } finally {
      setLoading(false);
    }
  };

  if (receipt) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-[500px] mx-auto w-full px-4"
      >
        <div className="bg-white rounded-[30px] p-8 md:p-10 shadow-2xl text-center border border-gray-50">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-secondary mb-2">Payment Successful!</h2>
          <p className="text-gray-500 mb-8 font-semibold">Digital receipt generated successfully.</p>
          
          <div className="bg-gray-50 p-6 md:p-8 rounded-3xl text-left mb-8 border-2 border-dashed border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Membership ID</span>
              <span className="font-bold text-secondary">{receipt.membershipId}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Member Name</span>
              <span className="font-bold text-secondary">{selectedMember?.name}</span>
            </div>
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
              <span className="text-gray-500 font-bold text-base">Amount Paid</span>
              <span className="font-black text-primary text-xl">₹100.00</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
             <button onClick={() => window.print()} className="btn-secondary py-3.5 rounded-2xl justify-center text-sm"><Printer size={18} /> Print</button>
             <Link href={`/member/receipt/${receipt._id}`} target="_blank" className="no-underline">
                <button className="btn-secondary py-3.5 rounded-2xl justify-center w-full text-sm"><Share2 size={18} /> View</button>
             </Link>
          </div>
          <button onClick={onSuccess} className="btn-primary w-full justify-center py-4 rounded-2xl shadow-xl shadow-primary/20">Done</button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-[700px] mx-auto w-full px-4">
      <button onClick={onCancel} className="flex items-center gap-2 bg-transparent border-none text-gray-500 cursor-pointer mb-8 font-bold hover:text-primary transition-colors">
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div className="bg-white p-6 sm:p-10 lg:p-12 rounded-[30px] md:rounded-[40px] shadow-2xl border border-gray-50">
        <div className="mb-10">
          <h2 className="text-2xl md:text-4xl font-black text-secondary leading-tight">Collect Membership Fee</h2>
          <p className="text-primary font-bold mt-2 uppercase tracking-widest text-xs">Process ₹100 fee for activation</p>
        </div>

        {!selectedMember ? (
          <div className="flex flex-col gap-6">
             <div className="relative">
                <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyUp={(e) => e.key === 'Enter' && searchMember()}
                  placeholder="Search Member Name or Mobile..." 
                  className="pl-14 pr-6 py-5 rounded-2xl border border-gray-100 bg-gray-50 w-full text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-inner" 
                />
             </div>
             <div className="flex flex-col gap-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{searchResults.length} Members Found</p>
                {searchResults.map(member => (
                  <div 
                    key={member._id} 
                    onClick={() => member.membershipStatus !== 'paid' && setSelectedMember(member)} 
                    className={`p-5 rounded-2xl border border-gray-50 flex justify-between items-center cursor-pointer transition-all hover:border-primary/20 hover:shadow-md ${member.membershipStatus === 'paid' ? 'bg-gray-50/50 grayscale opacity-60 cursor-not-allowed' : 'bg-white'}`}
                  >
                     <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${member.membershipStatus === 'paid' ? 'bg-gray-300' : 'bg-gradient-to-br from-primary to-secondary'}`}>
                          {member.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-secondary leading-tight">{member.name}</p>
                          <p className="text-xs text-gray-400 font-semibold mt-1">{member.mobile} • {member.village}</p>
                        </div>
                     </div>
                     <div>
                        {member.membershipStatus === 'paid' ? (
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full uppercase tracking-widest">PAID</span>
                        ) : (
                          <span className="text-[10px] font-bold text-primary bg-primary/5 px-4 py-2 rounded-full uppercase tracking-widest hover:bg-primary hover:text-white transition-colors">SELECT</span>
                        )}
                     </div>
                  </div>
                ))}
             </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="p-6 bg-primary/5 rounded-3xl flex items-center gap-4 border border-primary/10 relative group">
               <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-primary shadow-sm ring-4 ring-primary/5"><User size={24} /></div>
               <div>
                  <p className="font-black text-secondary text-xl leading-tight">{selectedMember.name}</p>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">Group: {selectedMember.groupId?.groupName || 'Not Assigned'}</p>
               </div>
               <button onClick={() => setSelectedMember(null)} className="ml-auto bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 p-2 rounded-xl transition-all border border-gray-100 shadow-sm cursor-pointer">Change</button>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 block ml-1">Select Payment Mode</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'Cash', icon: Banknote },
                  { id: 'UPI', icon: QrCode },
                  { id: 'Online', icon: CreditCard },
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setPaymentMode(mode.id as any)}
                    className={`py-6 px-2 rounded-3xl border-2 flex flex-col items-center gap-3 font-bold transition-all ${paymentMode === mode.id ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10' : 'border-gray-50 bg-gray-50/50 text-gray-400 hover:bg-white hover:border-gray-200'}`}
                  >
                    <mode.icon size={26} className={paymentMode === mode.id ? 'animate-pulse' : ''} />
                    <span className="text-xs">{mode.id}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white p-10 rounded-[40px] text-center border border-gray-100 shadow-inner relative overflow-hidden">
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 relative z-10">Amount to Collect</p>
               <h3 className="text-6xl md:text-7xl font-black text-secondary relative z-10">₹100</h3>
               <p className="text-xs font-bold text-green-600 bg-green-50 px-4 py-1.5 rounded-full inline-block mt-4 relative z-10">STANDARD FEE</p>
               <IndianRupee className="absolute -right-10 -bottom-10 w-40 h-40 text-gray-100/50 transform -rotate-12" />
            </div>

            <button onClick={handlePayment} disabled={loading} className="btn-primary w-full py-5 rounded-[24px] justify-center text-lg font-black shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
              {loading ? "Processing..." : `Confirm ₹100 ${paymentMode} Payment`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
