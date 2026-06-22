'use client';

import React, { useState, useEffect } from 'react';
import { Search, User, Phone, Mail, ShieldAlert, Plus, RefreshCw, Eye, Edit3, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import PaginationControls from '@/components/shared/filters/PaginationControls';
import UserDetailModal from './UserDetailModal';

export default function UserManagementContent() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalCount, setTotalCount] = useState(0);

  // Modal control states
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');

  const canEditUser = (targetRole: string) => {
    if (currentUser?.role === 'super_admin') return true;
    if (['super_admin', 'operations_admin'].includes(targetRole)) return false;
    if (!currentUser?.permissions) return false;

    let updatePerm = '';
    if (targetRole === 'vendor') updatePerm = 'vendors.update';
    else if (targetRole === 'sub_vendor') updatePerm = 'sub_vendors.update';
    else if (targetRole === 'employee') updatePerm = 'employees.update';
    else if (targetRole === 'staff') updatePerm = 'staff.update';
    else if (targetRole === 'member') updatePerm = 'members.update';

    return currentUser.permissions.includes(updatePerm);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/admin/users?search=${search}&role=${role}&status=${status}&page=${page}&limit=${limit}`
      );
      if (res.data.success) {
        setUsers(res.data.data || []);
        setTotalCount(res.data.totalCount || 0);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch users list');
    } finally {
      setLoading(false);
    }
  };

  // Reset page number on filter changes
  useEffect(() => {
    setPage(1);
  }, [search, role, status]);

  // Debounced API call for search input
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 400);
    return () => clearTimeout(timer);
  }, [search, role, status, page, limit]);

  const openDetails = (id: string, viewMode: 'view' | 'edit') => {
    setSelectedUserId(id);
    setModalMode(viewMode);
    setShowDetailModal(true);
  };

  const getStatusBadge = (statusStr: string) => {
    const map: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-500 border border-gray-200',
      pending_registration: 'bg-gray-100 text-gray-500 border border-gray-200',
      documents_pending: 'bg-gray-100 text-gray-500 border border-gray-200',
      documents_uploaded: 'bg-blue-100 text-blue-600 border border-blue-200',
      under_review: 'bg-amber-100 text-amber-600 border border-amber-200',
      reupload_required: 'bg-orange-100 text-orange-600 border border-orange-200',
      approved: 'bg-green-100 text-green-600 border border-green-200',
      active: 'bg-green-100 text-green-600 border border-green-200',
      rejected: 'bg-red-100 text-red-600 border border-red-200',
      suspended: 'bg-gray-200 text-gray-600 border border-gray-300'
    };
    return map[statusStr] || 'bg-gray-100 text-gray-500 border border-gray-200';
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Title Header */}
      <div className="flex justify-between items-start flex-wrap gap-6">
        <div>
          <h2 className="text-3xl font-black text-secondary">All Users Registry</h2>
          <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">
            Query, inspect, and update user profiles across the entire system.
          </p>
        </div>
      </div>

      {/* Filter and Query Section */}
      <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-soft flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by full name, phone number, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#f8f9fa] border border-gray-100 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-gray-300"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3 w-full md:w-auto">
          {/* Role Dropdown */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-secondary outline-none focus:ring-4 focus:ring-primary/10 transition-all"
          >
            <option value="all">All Roles</option>
            <option value="member">Member</option>
            <option value="employee">Employee</option>
            <option value="sub_vendor">Sub-Vendor</option>
            <option value="vendor">Vendor</option>
            <option value="staff">Staff</option>
            <option value="operations_admin">Operations Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-secondary outline-none focus:ring-4 focus:ring-primary/10 transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="documents_uploaded">Docs Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="reupload_required">Reupload Req</option>
            <option value="approved">Approved</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* Manual Refresh */}
          <button
            onClick={fetchUsers}
            className="p-3 bg-gray-50 border border-gray-100 text-gray-400 hover:text-secondary rounded-xl hover:bg-gray-100 transition-all"
            title="Refresh Registry"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Users Registry List Table */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-50 bg-[#fafafa]">
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-[60px]">S.No.</th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">User Profile</th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Info</th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Registered</th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-gray-400 font-bold italic">
                    Querying registry database...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-gray-400 font-bold italic">
                    No matching users found in registry database.
                  </td>
                </tr>
              ) : (
                users.map((item, index) => (
                  <tr
                    key={item._id}
                    className="border-b border-gray-50 hover:bg-[#fafafa]/50 transition-colors"
                  >
                    <td className="p-5 text-xs font-bold text-gray-400">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-black text-sm uppercase">
                          {item.fullName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-secondary text-sm">{item.fullName}</p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                            ID: {item._id.slice(-6)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <p className="font-bold text-secondary text-xs flex items-center gap-1.5">
                        <Phone size={12} className="text-gray-400" /> {item.mobile}
                      </p>
                      {item.email && (
                        <p className="text-gray-400 font-bold text-xs mt-1.5 flex items-center gap-1.5">
                          <Mail size={12} className="text-gray-400" /> {item.email}
                        </p>
                      )}
                    </td>
                    <td className="p-5">
                      <span className="text-[10px] font-black text-secondary bg-gray-50 border border-gray-100 px-3 py-1 rounded-xl uppercase tracking-wider">
                        {item.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-5 text-xs font-bold text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openDetails(item._id, 'view')}
                          className="p-2 bg-gray-50 text-secondary hover:bg-secondary hover:text-white rounded-xl transition-all shadow-sm"
                          title="View Profile Details"
                        >
                          <Eye size={14} />
                        </button>
                         {canEditUser(item.role) && (
                           <button
                             onClick={() => openDetails(item._id, 'edit')}
                             className="p-2 bg-gray-50 text-primary hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm"
                             title="Edit User Profile"
                           >
                             <Edit3 size={14} />
                           </button>
                         )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <PaginationControls
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          totalCount={totalCount}
        />
      </div>

      {/* Render Profile Detail and Edit Drawer Modal */}
      {showDetailModal && selectedUserId && (
        <UserDetailModal
          userId={selectedUserId}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedUserId(null);
          }}
          onSuccess={fetchUsers}
          currentUser={currentUser}
          initialMode={modalMode}
        />
      )}
    </div>
  );
}
