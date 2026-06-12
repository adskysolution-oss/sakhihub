import React from 'react';
import { useLanguage } from "@/context/LanguageContext";

interface PaginationControlsProps {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalCount: number;
  limit: number;
  setLimit?: (limit: number) => void;
}

export default function PaginationControls({ page, setPage, totalCount, limit, setLimit }: PaginationControlsProps) {
  const { t } = useLanguage();
  if (totalCount === 0) return null;

  const startEntry = (page - 1) * limit + 1;
  const endEntry = Math.min(page * limit, totalCount);
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100 flex-wrap gap-4">
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
          {t('members.showingEntries', 'Showing {{start}} to {{end}} of {{total}} entries', { start: startEntry, end: endEntry, total: totalCount })}
        </span>
        {setLimit && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              {t('common.show', 'Show')}:
            </span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              {[10, 25, 50, 100].map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 border border-gray-100 rounded-xl text-xs font-black uppercase tracking-wider text-secondary disabled:opacity-50 hover:bg-gray-50 transition-all"
        >
          {t('members.previous', 'Previous')}
        </button>
        <button
          onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages || totalPages === 0}
          className="px-4 py-2 border border-gray-100 rounded-xl text-xs font-black uppercase tracking-wider text-secondary disabled:opacity-50 hover:bg-gray-50 transition-all"
        >
          {t('members.next', 'Next')}
        </button>
      </div>
    </div>
  );
}
