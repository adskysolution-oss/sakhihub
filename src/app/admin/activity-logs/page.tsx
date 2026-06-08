'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { Search, Clock, ShieldAlert, ShieldCheck, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async (query = '') => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/activity-logs${query ? `?search=${query}` : ''}`);
      if (res.data.success) {
        setLogs(res.data.data || []);
      }
    } catch (err: any) {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(searchQuery);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'operations_admin':
        return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'vendor':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'sub_vendor':
        return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'employee':
        return 'bg-teal-50 text-teal-600 border-teal-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black text-secondary">Operational Audit Logs</h2>
            <p className="text-gray-400 font-bold mt-1">Real-time compliance monitoring of all administrative actions.</p>
          </div>
          <button 
            onClick={() => fetchLogs(searchQuery)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-secondary border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
          >
            <RefreshCw size={16} /> Refresh Feed
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-soft">
          <div className="relative flex gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs by action key, admin name, target name, or IP address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f8f9fa] border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-gray-300"
              />
            </div>
            <button
              type="submit"
              className="bg-secondary text-white px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary-light transition-all"
            >
              Search
            </button>
          </div>
        </form>

        {/* Logs Table */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50 bg-[#fafafa]">
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Performed By</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Target</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-gray-400 font-semibold italic">
                      Loading audit logs...
                    </td>
                  </tr>
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log._id} className="border-b border-gray-50 hover:bg-[#fafafa]/50 transition-colors">
                      <td className="p-5 text-xs text-secondary font-bold">
                        <p className="flex items-center gap-1"><Clock size={12} className="text-gray-400" /> {new Date(log.timestamp).toLocaleDateString()}</p>
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{new Date(log.timestamp).toLocaleTimeString()}</p>
                      </td>
                      <td className="p-5">
                        {log.performedBy ? (
                          <div>
                            <p className="font-bold text-secondary text-xs">{log.performedBy.fullName}</p>
                            <span className={`inline-block border px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest mt-1 ${getRoleBadge(log.performedBy.role)}`}>
                              {log.performedBy.role.replace('_', ' ')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic font-bold">System Job</span>
                        )}
                      </td>
                      <td className="p-5">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          log.action.includes('reject') || log.action.includes('suspend')
                            ? 'bg-red-50 text-red-600 border-red-100'
                            : log.action.includes('create') || log.action.includes('approve') || log.action.includes('activate')
                            ? 'bg-green-50 text-green-600 border-green-100'
                            : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-5">
                        {log.targetUser ? (
                          <div>
                            <p className="font-bold text-secondary text-xs">{log.targetUser.fullName}</p>
                            <span className={`inline-block border px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest mt-1 ${getRoleBadge(log.targetUser.role)}`}>
                              {log.targetUser.role.replace('_', ' ')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs font-bold">—</span>
                        )}
                      </td>
                      <td className="p-5 text-xs text-gray-500 font-bold font-mono">
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-gray-400 font-semibold italic">
                      No matching activity logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
