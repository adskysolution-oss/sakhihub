'use client';

import React, { useEffect, useState } from 'react';
import { IndianRupee, FileText, Download, X } from 'lucide-react';
import axios from 'axios';
import PaymentSlip from '@/components/shared/PaymentSlip';

export default function PaymentReceiptCard() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const res = await axios.get('/api/payment/receipts');
        if (res.data.success) {
          setReceipts(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch receipts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipts();
  }, []);

  if (loading || receipts.length === 0) {
    return null; // Don't show if no payments or loading
  }

  return (
    <>
      <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft">
        <h2 className="text-xl font-black text-secondary mb-6">Payment Receipts</h2>
        <div className="flex flex-col gap-3">
          {receipts.map((receipt, i) => (
            <button 
              key={receipt._id || i}
              onClick={() => setSelectedReceipt(receipt)}
              className="flex items-center justify-between p-5 bg-gray-50 hover:bg-secondary hover:text-white rounded-3xl transition-all group text-left"
              title="View Receipt"
            >
              <div className="flex items-center gap-4">
                <FileText size={20} className="text-primary group-hover:text-white shrink-0" />
                <div>
                  <span className="font-bold text-sm block">
                    {receipt.type === 'subscription' ? 'Platform Subscription' : 'Security Deposit'}
                  </span>
                  <span className="text-[10px] text-gray-400 group-hover:text-white/70 font-bold uppercase tracking-widest mt-0.5 block flex items-center gap-1">
                    {receipt.amount > 0 ? (
                      <><IndianRupee size={10} />{receipt.amount}</>
                    ) : (
                      'MANUAL PAID'
                    )}
                    <span className="mx-1">•</span>
                    {new Date(receipt.paidAt || receipt.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <Download size={18} className="opacity-40 group-hover:opacity-100 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Receipt Modal Overlay */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto print:p-0 print:bg-white print:relative print:z-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl p-6 md:p-10 my-8 overflow-y-auto max-h-[90vh] print:max-h-none print:my-0 print:p-0 print:shadow-none print:border-none">
            {/* Close Button - Hidden on Print */}
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-6 right-6 p-2 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-full transition-colors print:hidden"
              title="Close Receipt"
            >
              <X size={20} />
            </button>
            <div className="pt-4 print:pt-0">
              <PaymentSlip 
                type={selectedReceipt.type === 'deposit' ? 'deposit' : 'subscription'} 
                data={{
                  receiptNumber: selectedReceipt.cashfreeOrderId || 'N/A',
                  transactionId: selectedReceipt.cashfreePaymentId || selectedReceipt.cashfreeOrderId || 'N/A',
                  paymentDate: selectedReceipt.paidAt || selectedReceipt.createdAt,
                  paymentTime: selectedReceipt.paidAt 
                    ? new Date(selectedReceipt.paidAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) 
                    : new Date(selectedReceipt.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
                  paymentMode: selectedReceipt.paymentMethod || 'ONLINE',
                  amount: selectedReceipt.amount,
                  fullName: selectedReceipt.userId?.fullName || 'N/A',
                  mobileNumber: selectedReceipt.userId?.mobile || 'N/A',
                  role: selectedReceipt.role === 'vendor' ? 'Vendor' : selectedReceipt.role === 'sub_vendor' ? 'Sub-Vendor' : selectedReceipt.role === 'employee' ? 'Employee' : 'Member',
                  planType: selectedReceipt.type === 'subscription' 
                    ? (selectedReceipt.role === 'vendor' ? 'Premium Vendor Access' : selectedReceipt.role === 'sub_vendor' ? 'Sub-Vendor Account' : 'Employee Access') 
                    : undefined,
                  planDuration: selectedReceipt.type === 'subscription' ? 'Monthly Partner' : undefined,
                  depositPurpose: selectedReceipt.type === 'deposit' ? 'Refundable Onboarding Security Deposit' : undefined,
                  approvalStatus: 'Approved',
                  feeCollectedBy: 'System Auto-Verify',
                  verifiedBy: 'Cashfree API Verification',
                  verificationHash: selectedReceipt._id ? `SH-PAY-${selectedReceipt._id.toString().substring(0,8).toUpperCase()}` : undefined
                }} 
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
