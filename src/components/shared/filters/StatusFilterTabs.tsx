import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface StatusFilterTabsProps {
  status: string;
  setStatus: (val: string) => void;
  counts: {
    status: Record<string, number>;
    payment: Record<string, number>;
  };
}

export const STATUS_FILTERS = ['all', 'pending', 'documents_uploaded', /* 'under_review', */ 'reupload_required', 'active', 'approved', 'rejected', 'paid', 'unpaid'];

export const LABEL_MAP: Record<string, string> = {
  all: 'All',
  pending: 'Pending',
  documents_uploaded: 'Docs Submitted',
  under_review: 'Review',
  reupload_required: 'Re-upload',
  active: 'Active',
  approved: 'Approved',
  rejected: 'Rejected',
  paid: 'Paid',
  unpaid: 'Unpaid'
};

export const COUNT_COLOR_MAP: Record<string, string> = {
  all: 'text-primary',
  pending: 'text-amber-500',
  documents_uploaded: 'text-blue-500',
  under_review: 'text-purple-500',
  reupload_required: 'text-orange-500',
  active: 'text-green-600',
  approved: 'text-emerald-600',
  rejected: 'text-red-500',
  paid: 'text-emerald-500',
  unpaid: 'text-red-400'
};

export default function StatusFilterTabs({ status, setStatus, counts }: StatusFilterTabsProps) {
  const { t } = useLanguage();

  return (
    <div className="flex gap-1.5 bg-gray-50 p-1.5 rounded-2xl overflow-x-auto no-scrollbar mb-8">
      {STATUS_FILTERS.map((s) => {
        let count = 0;
        if (s === 'paid') {
          count = counts.payment.paid || 0;
        } else if (s === 'unpaid') {
          count = counts.payment.unpaid || 0;
        } else {
          count = counts.status[s] || 0;
        }

        return (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
              status === s ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {t('status.' + s, LABEL_MAP[s] || s)} <span className={`ml-1 font-bold ${COUNT_COLOR_MAP[s] || 'text-gray-400'}`}>({count})</span>
          </button>
        );
      })}
    </div>
  );
}
