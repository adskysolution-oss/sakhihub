'use client';

import React, { useEffect, useState } from 'react';
import { IndianRupee, FileText, CheckCircle2, Download } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function PaymentReceiptCard() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (receipts.length === 0) {
    return null; // Don't show if no payments
  }

  return (
    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-black text-secondary flex items-center gap-2">
            <FileText className="text-primary" size={24} /> 
            Payment Receipts
          </h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
            Confirmed Transactions
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
        {receipts.map((receipt, i) => (
          <motion.div 
            key={receipt._id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 rounded-3xl border border-green-100 bg-green-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-green-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-500 shadow-sm border border-green-100 shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 className="font-black text-secondary text-sm capitalize">
                  {receipt.type === 'subscription' ? 'Platform Subscription' : 'Security Deposit'}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    ID: {receipt.cashfreeOrderId.replace('ADMIN_OVERRIDE_', 'MANUAL-')}
                  </span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    {new Date(receipt.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:gap-4 pl-16 sm:pl-0">
              <div className="text-left sm:text-right">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Amount</p>
                <p className="font-black text-secondary flex items-center gap-1 text-base">
                  {receipt.amount > 0 ? (
                    <>
                      <IndianRupee size={14} />
                      {receipt.amount}
                    </>
                  ) : (
                    <span className="text-green-600 bg-green-100 px-2 py-0.5 rounded-md text-xs">Manual Paid</span>
                  )}
                </p>
              </div>
              <button 
                onClick={() => window.print()}
                className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-400 flex items-center justify-center hover:text-primary hover:border-primary/30 transition-all shrink-0"
                title="Download Receipt"
              >
                <Download size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
