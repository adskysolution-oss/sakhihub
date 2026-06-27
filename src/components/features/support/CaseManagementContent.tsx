'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, RefreshCw, ChevronLeft, ChevronRight, Filter, 
  Layers, CheckCircle, Clock, AlertCircle, X, SlidersHorizontal, Calendar
} from 'lucide-react';
import axios from 'axios';
import CaseDetailsDrawer from './CaseDetailsDrawer';

export default function CaseManagementContent() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Status filter (tied to server-side query to stay fast, just like in original)
  const [statusFilter, setStatusFilter] = useState('all');

  // Client-side advanced filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Dropdown lists populated dynamically
  const [assigneesList, setAssigneesList] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Check permissions
    const checkUserRole = async () => {
      try {
        const res = await axios.get('/api/auth/me');
        if (res.data.success) {
          const userObj = res.data.data;
          const isUserAdmin = ['super_admin', 'admin'].includes(userObj.role) || 
                              (userObj.permissions || []).includes('support.update_case');
          setIsAdmin(isUserAdmin);
        }
      } catch (e) {
        console.error('Failed to parse user role/permissions via API', e);
      }
    };
    checkUserRole();

    fetchAssignees();
  }, []);

  // Fetch cases on mount, statusFilter, or keyword search
  useEffect(() => {
    fetchCases();
  }, [statusFilter, searchTerm]);

  const fetchAssignees = async () => {
    try {
      const res = await axios.get('/api/admin/support-cases?getAssignees=true');
      if (res.data.success) {
        setAssigneesList(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load assignees', err);
    }
  };

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/support-cases?status=${statusFilter}&search=${searchTerm}`);
      if (res.data.success) {
        setCases(res.data.data);
        setCurrentPage(1); // Reset page on query change
      }
    } catch (err) {
      console.error('Failed to fetch cases', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setCategoryFilter('all');
    setPriorityFilter('all');
    setAssigneeFilter('all');
    setStateFilter('all');
    setDistrictFilter('all');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    setStatusFilter('all');
  };

  // Dynamically derive States and Districts from loaded cases to populate filter options
  const statesList = useMemo(() => {
    const states = new Set<string>();
    cases.forEach(c => {
      if (c.user?.state) states.add(c.user.state);
    });
    return Array.from(states).sort();
  }, [cases]);

  const districtsList = useMemo(() => {
    const districts = new Set<string>();
    cases.forEach(c => {
      if (c.user?.district) districts.add(c.user.district);
    });
    return Array.from(districts).sort();
  }, [cases]);

  // Compute Client-side Advanced Filters & Search
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      // 1. Category Filter
      if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;

      // 2. Priority Filter
      if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false;

      // 3. Assignee Filter
      if (assigneeFilter !== 'all') {
        if (assigneeFilter === 'unassigned') {
          if (c.assignedTo) return false;
        } else if (!c.assignedTo || c.assignedTo._id !== assigneeFilter) {
          return false;
        }
      }

      // 4. State Filter
      if (stateFilter !== 'all' && c.user?.state !== stateFilter) return false;

      // 5. District Filter
      if (districtFilter !== 'all' && c.user?.district !== districtFilter) return false;

      // 6. Date Range Filter
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (new Date(c.createdAt) < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (new Date(c.createdAt) > end) return false;
      }

      return true;
    });
  }, [cases, categoryFilter, priorityFilter, assigneeFilter, stateFilter, districtFilter, startDate, endDate]);

  // Pagination Calculation
  const paginatedCases = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCases.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCases, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredCases.length / itemsPerPage));

  // Analytics Stats calculated from full fetched database records
  const stats = useMemo(() => {
    let total = cases.length;
    let open = 0;
    let inProgress = 0;
    let resolvedToday = 0;
    let closed = 0;

    const todayStr = new Date().toDateString();

    cases.forEach(c => {
      if (c.status === 'open') open++;
      else if (c.status === 'in_progress') inProgress++;
      else if (c.status === 'closed') closed++;
      else if (c.status === 'resolved') {
        // Count resolved today
        if (c.resolvedAt && new Date(c.resolvedAt).toDateString() === todayStr) {
          resolvedToday++;
        }
      }
    });

    return { total, open, inProgress, resolvedToday, closed };
  }, [cases]);

  const handleCaseUpdated = (updatedCase: any) => {
    setCases(prev => prev.map(c => c._id === updatedCase._id ? updatedCase : c));
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* 1. Statistics Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* Total Cases */}
        <div className="bg-white p-5 rounded-[24px] border border-gray-105 shadow-soft flex items-center gap-4">
          <div className="p-3.5 bg-gray-50 rounded-xl text-gray-500 border border-gray-100">
            <Layers size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Cases</span>
            <span className="text-xl font-black text-secondary leading-none">{stats.total}</span>
          </div>
        </div>

        {/* Open Cases */}
        <div className="bg-white p-5 rounded-[24px] border border-gray-105 shadow-soft flex items-center gap-4">
          <div className="p-3.5 bg-red-50 text-red-500 rounded-xl border border-red-100">
            <AlertCircle size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Open</span>
            <span className="text-xl font-black text-red-500 leading-none">{stats.open}</span>
          </div>
        </div>

        {/* In Progress Cases */}
        <div className="bg-white p-5 rounded-[24px] border border-gray-105 shadow-soft flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-500 rounded-xl border border-amber-100">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">In Progress</span>
            <span className="text-xl font-black text-amber-500 leading-none">{stats.inProgress}</span>
          </div>
        </div>

        {/* Resolved Today */}
        <div className="bg-white p-5 rounded-[24px] border border-gray-105 shadow-soft flex items-center gap-4">
          <div className="p-3.5 bg-green-50 text-green-500 rounded-xl border border-green-100">
            <CheckCircle size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Resolved Today</span>
            <span className="text-xl font-black text-green-500 leading-none">{stats.resolvedToday}</span>
          </div>
        </div>

        {/* Closed Cases */}
        <div className="bg-white p-5 rounded-[24px] border border-gray-105 shadow-soft flex items-center gap-4 col-span-2 md:col-span-1">
          <div className="p-3.5 bg-gray-100 text-gray-500 rounded-xl border border-gray-150">
            <CheckCircle size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Closed</span>
            <span className="text-xl font-black text-secondary leading-none">{stats.closed}</span>
          </div>
        </div>

      </div>

      {/* 2. Filters & Advanced Search Control Bar */}
      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-soft flex flex-col gap-5">
        
        {/* Main Search and Status Toggle */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
          
          {/* Search Term */}
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search Case ID, Subject, or Description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-primary outline-none transition-all font-medium text-secondary text-xs"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-secondary"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100 shrink-0 overflow-x-auto no-scrollbar w-full lg:w-auto">
            {['all', 'open', 'in_progress', 'resolved', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex-1 lg:flex-initial px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  statusFilter === status 
                    ? 'bg-primary text-white shadow-md shadow-primary/15 font-bold' 
                    : 'text-gray-400 hover:text-secondary'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>

        </div>

        {/* Advanced Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-gray-50">
          
          {/* Category */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-secondary outline-none focus:border-primary transition-all"
            >
              <option value="all">All Categories</option>
              <option value="Payment / Subscription">Payment / Subscription</option>
              <option value="Onboarding & KYC">Onboarding & KYC</option>
              <option value="Campaign Assignment">Campaign Assignment</option>
              <option value="Attendance & Leaves">Attendance & Leaves</option>
              <option value="Technical Issues">Technical Issues</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-secondary outline-none focus:border-primary transition-all"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Assignee */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Assignee</label>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-secondary outline-none focus:border-primary transition-all"
            >
              <option value="all">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {assigneesList.map(item => (
                <option key={item._id} value={item._id}>{item.fullName}</option>
              ))}
            </select>
          </div>

          {/* State */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">State</label>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-secondary outline-none focus:border-primary transition-all"
            >
              <option value="all">All States</option>
              {statesList.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* District */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">District</label>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-secondary outline-none focus:border-primary transition-all"
            >
              <option value="all">All Districts</option>
              {districtsList.map(dst => (
                <option key={dst} value={dst}>{dst}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Date Filters and Reset Button */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-4 border-t border-gray-50">
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Start Date */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Calendar size={10} /> Date Range From
              </label>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-secondary outline-none focus:border-primary transition-all"
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Calendar size={10} /> Date Range To
              </label>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-secondary outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Reset Filters Trigger */}
          <button
            onClick={resetFilters}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-gray-100 text-xs font-black text-secondary uppercase tracking-widest active:scale-95 transition-all"
          >
            <SlidersHorizontal size={14} /> Reset Filters
          </button>

        </div>

      </div>

      {/* 3. Dense Table Panel */}
      <div className="bg-white rounded-[32px] border border-gray-105 shadow-soft overflow-hidden">
        
        {loading ? (
          <div className="py-32 text-center text-gray-400 font-bold flex flex-col justify-center items-center gap-3">
            <RefreshCw size={24} className="animate-spin text-primary" />
            <p className="text-xs uppercase tracking-widest">Fetching Cases...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="py-24 text-center text-gray-400 font-medium flex flex-col justify-center items-center gap-4">
            <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center border border-gray-100">
              <Filter size={24} />
            </div>
            <div>
              <h4 className="text-sm font-black text-secondary">No matching cases found</h4>
              <p className="text-xs text-gray-400 font-bold mt-1">Adjust search query or filter controls</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            
            {/* Table Wrap */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="py-4 pl-6 pr-4">Case ID</th>
                    <th className="py-4 px-4">Subject</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Priority</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4">State</th>
                    <th className="py-4 px-4">District</th>
                    <th className="py-4 px-4">Created Date</th>
                    <th className="py-4 pl-4 pr-6 text-right">Assignee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedCases.map((c) => (
                    <tr 
                      key={c._id}
                      onClick={() => setSelectedCaseId(c.caseId)}
                      className="hover:bg-gray-50/50 cursor-pointer text-xs font-semibold text-secondary transition-colors"
                    >
                      <td className="py-4 pl-6 pr-4 font-black text-primary">{c.caseId}</td>
                      <td className="py-4 px-4 max-w-[200px] truncate">
                        <span className="block font-black leading-tight truncate">{c.subject}</span>
                        <span className="block text-[10px] text-gray-400 font-bold mt-0.5">{c.user?.fullName}</span>
                      </td>
                      <td className="py-4 px-4 text-gray-500">{c.category}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          c.priority === 'high' ? 'bg-red-50 text-red-500 border-red-100' :
                          c.priority === 'medium' ? 'bg-amber-50 text-amber-500 border-amber-100' :
                          'bg-green-50 text-green-500 border-green-100'
                        }`}>
                          {c.priority}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          c.status === 'open' ? 'bg-red-50 text-red-500 border-red-100' :
                          c.status === 'in_progress' ? 'bg-amber-50 text-amber-500 border-amber-100' :
                          'bg-green-50 text-green-500 border-green-100'
                        }`}>
                          {c.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-500">{c.user?.state || '-'}</td>
                      <td className="py-4 px-4 text-gray-500">{c.user?.district || '-'}</td>
                      <td className="py-4 px-4 text-gray-400 text-[10px] font-bold">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 pl-4 pr-6 text-right font-black text-gray-500">
                        {c.assignedTo?.fullName || <span className="text-gray-300 font-bold">Unassigned</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-50 bg-[#fafafa]">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Showing {Math.min(filteredCases.length, (currentPage - 1) * itemsPerPage + 1)}-
                {Math.min(filteredCases.length, currentPage * itemsPerPage)} of {filteredCases.length} cases
              </span>

              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="p-2 border border-gray-200 rounded-xl hover:bg-white text-gray-500 active:scale-95 transition-all disabled:opacity-50"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="p-2 border border-gray-200 rounded-xl hover:bg-white text-gray-500 active:scale-95 transition-all disabled:opacity-50"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* 4. Sliding CaseDetailsDrawer Panel */}
      {selectedCaseId && (
        <CaseDetailsDrawer
          caseId={selectedCaseId}
          onClose={() => setSelectedCaseId(null)}
          isAdmin={isAdmin}
          onCaseUpdated={handleCaseUpdated}
        />
      )}

    </div>
  );
}
