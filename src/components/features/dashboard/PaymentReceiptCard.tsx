'use client';

import React, { useEffect, useState } from 'react';
import { IndianRupee, FileText, Download, X } from 'lucide-react';
import axios from 'axios';
import PaymentReceiptAction from '@/components/shared/PaymentReceiptAction';
import { useLanguage } from '@/context/LanguageContext';

export default function PaymentReceiptCard() {
  const { t } = useLanguage();
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
        <h2 className="text-xl font-black text-secondary mb-6">{t('onboarding.paymentReceipts', 'Payment Receipts')}</h2>
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
                    {receipt.type === 'subscription' ? t('onboarding.platformSubscription', 'Platform Subscription') : t('onboarding.securityDeposit', 'Security Deposit')}
                  </span>
                  <span className="text-[10px] text-gray-400 group-hover:text-white/70 font-bold uppercase tracking-widest mt-0.5 block flex items-center gap-1">
                    {receipt.amount > 0 ? (
                      <><IndianRupee size={10} />{receipt.amount}</>
                    ) : (
                      t('onboarding.manualPaid', 'MANUAL PAID')
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
        <PaymentReceiptAction
          isOpen={true}
          onClose={() => setSelectedReceipt(null)}
          paymentTransaction={selectedReceipt}
        />
      )}
    </>
  );
}
