'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  Printer, ArrowLeft, ShieldCheck, 
  MapPin, User, Calendar, IndianRupee, 
  FileText, CheckCircle2, Mail, Globe, Phone
} from 'lucide-react';
import { motion } from 'framer-motion';
import PaymentSlip from "@/components/shared/PaymentSlip";

export default function MemberReceiptPage() {
  const { id } = useParams();
  const router = useRouter();
  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const res = await axios.get(`/api/member/receipt/${id}`);
        if (res.data.success) setReceipt(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchReceipt();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-400 animate-pulse uppercase tracking-widest">Generating Receipt...</div>;
  if (!receipt) return <div className="min-h-screen flex items-center justify-center font-bold text-red-400">Receipt record not found.</div>;

  const payDate = receipt ? new Date(receipt.paymentDate) : new Date();
  const paymentTimeStr = receipt?.paymentTime || payDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const slipData = {
    receiptNumber: receipt?.receiptNumber || 'N/A',
    transactionId: receipt?.cashfreeOrderId || receipt?.membershipId || 'N/A',
    paymentDate: payDate,
    paymentTime: paymentTimeStr,
    paymentMode: receipt?.paymentMode || 'ONLINE',
    amount: receipt?.amount || 0,
    fullName: receipt.memberId?.name || 'N/A',
    mobileNumber: receipt.memberId?.mobile || 'N/A',
    villageArea: receipt.memberId?.village || 'N/A',
    assignedGroup: receipt.groupId?.groupName || 'Individual / Pending Allocation',
    role: 'Member',
    referredBy: receipt.memberId?.assignedEmployeeId ? {
      name: receipt.memberId.assignedEmployeeId.fullName,
      role: 'Employee'
    } : undefined,
    feeCollectedBy: receipt.employeeId?.fullName || 'System Admin',
    verifiedBy: 'SakhiHub Auto-Verify API',
    verificationHash: receipt._id ? `SH-MEM-${receipt._id.toString().substring(0,8).toUpperCase()}` : undefined
  };

  return (
    <div className="min-h-screen bg-[#FDFCFD] py-10 md:py-16 px-4 print:p-0 print:bg-white">
      {/* Navigation - Hidden on Print */}
      <div className="max-w-4xl mx-auto mb-8 print:hidden flex justify-between items-center">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-primary transition-all border-none bg-transparent cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        <PaymentSlip type="membership" data={slipData} />
      </div>
    </div>
  );
}
