'use client';

import React from 'react';
import { Clock } from 'lucide-react';

interface PreviousCasesTableProps {
  cases: any[];
  loading: boolean;
  onSelectCase: (caseObj: any) => void;
}

export default function PreviousCasesTable({ cases, loading, onSelectCase }: PreviousCasesTableProps) {
  const totalCount = cases.length;
  const openCount = cases.filter(c => ['open', 'in_progress'].includes(c.status)).length;
  const resolvedCount = cases.filter(c => ['resolved', 'closed'].includes(c.status)).length;

  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-soft">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-sm font-black text-secondary">Support History</h3>
          <p className="text-[10px] text-gray-400 font-bold mt-0.5">Caller previous history logs</p>
        </div>

        {/* Status Counts */}
        <div className="flex gap-2">
          <div className="px-3 py-1.5 bg-gray-50 rounded-xl text-center border border-gray-100 min-w-[50px]">
            <span className="block text-xs font-black text-secondary">{totalCount}</span>
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Total</span>
          </div>
          <div className="px-3 py-1.5 bg-amber-50 rounded-xl text-center border border-amber-100 text-amber-600 min-w-[50px]">
            <span className="block text-xs font-black">{openCount}</span>
            <span className="text-[8px] font-bold uppercase tracking-wider">Open</span>
          </div>
          <div className="px-3 py-1.5 bg-green-50 rounded-xl text-center border border-green-100 text-green-600 min-w-[50px]">
            <span className="block text-xs font-black">{resolvedCount}</span>
            <span className="text-[8px] font-bold uppercase tracking-wider">Resolved</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs font-bold text-gray-400 animate-pulse">
          Loading history...
        </div>
      ) : cases.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-gray-150 rounded-2xl text-xs text-gray-400 font-medium">
          No previous cases filed.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                <th className="pb-3 pl-2">Case ID</th>
                <th className="pb-3">Subject</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Created</th>
                <th className="pb-3">Resolved</th>
                <th className="pb-3 pr-2 text-right">Resolved By</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr 
                  key={c._id}
                  onClick={() => onSelectCase(c)}
                  className="border-b border-gray-50/50 hover:bg-gray-50/40 text-xs font-medium text-secondary cursor-pointer transition-colors"
                >
                  <td className="py-3 pl-2 text-primary font-black">{c.caseId}</td>
                  <td className="py-3 max-w-[150px] truncate">{c.subject}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                      c.status === 'open' ? 'bg-red-50 text-red-500 border-red-100' :
                      c.status === 'in_progress' ? 'bg-amber-50 text-amber-500 border-amber-100' :
                      'bg-green-50 text-green-500 border-green-100'
                    }`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 text-gray-400 text-[10px]">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 text-gray-400 text-[10px]">{c.resolvedAt ? new Date(c.resolvedAt).toLocaleDateString() : '-'}</td>
                  <td className="py-3 pr-2 text-right font-bold text-gray-500">{c.resolvedBy?.fullName || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
