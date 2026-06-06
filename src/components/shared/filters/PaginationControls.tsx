import React from 'react';

interface PaginationControlsProps {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalCount: number;
  limit: number;
}

export default function PaginationControls({ page, setPage, totalCount, limit }: PaginationControlsProps) {
  if (totalCount === 0) return null;

  const startEntry = (page - 1) * limit + 1;
  const endEntry = Math.min(page * limit, totalCount);
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100 flex-wrap gap-4">
      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
        Showing {startEntry} to {endEntry} of {totalCount} entries
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 border border-gray-100 rounded-xl text-xs font-black uppercase tracking-wider text-secondary disabled:opacity-50 hover:bg-gray-50 transition-all"
        >
          Previous
        </button>
        <button
          onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages || totalPages === 0}
          className="px-4 py-2 border border-gray-100 rounded-xl text-xs font-black uppercase tracking-wider text-secondary disabled:opacity-50 hover:bg-gray-50 transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
}
