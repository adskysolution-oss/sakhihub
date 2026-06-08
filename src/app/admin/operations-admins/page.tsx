'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { 
  Plus, Search, User, Mail, Phone, Briefcase, 
  Settings, Key, AlertTriangle, Shield, Check, X
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function OperationsAdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create / Edit modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    designation: 'Operations Admin',
    password: ''
  });

  // Password reset state
  const [resettingAdmin, setResettingAdmin] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/operations-admins');
      if (res.data.success) {
        setAdmins(res.data.data || []);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch operations admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAdmin) {
        const res = await axios.put(`/api/admin/operations-admins/${editingAdmin._id}`, formData);
        if (res.data.success) {
          toast.success('Operations Admin updated successfully');
          setShowCreateModal(false);
          setEditingAdmin(null);
          fetchAdmins();
        }
      } else {
        const res = await axios.post('/api/admin/operations-admins', formData);
        if (res.data.success) {
          toast.success('Operations Admin created successfully');
          setShowCreateModal(false);
          fetchAdmins();
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleToggleStatus = async (admin: any) => {
    const newStatus = admin.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await axios.put(`/api/admin/operations-admins/${admin._id}`, {
        action: 'toggle_status',
        status: newStatus
      });
      if (res.data.success) {
        toast.success(`Admin ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
        fetchAdmins();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      const res = await axios.put(`/api/admin/operations-admins/${resettingAdmin._id}`, {
        action: 'reset_password',
        password: newPassword
      });
      if (res.data.success) {
        toast.success('Password reset successfully');
        setResettingAdmin(null);
        setNewPassword('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const openEditModal = (admin: any) => {
    setEditingAdmin(admin);
    setFormData({
      fullName: admin.fullName,
      email: admin.email || '',
      mobile: admin.mobile,
      designation: admin.designation || 'Operations Admin',
      password: ''
    });
    setShowCreateModal(true);
  };

  const openCreateModal = () => {
    setEditingAdmin(null);
    setFormData({
      fullName: '',
      email: '',
      mobile: '',
      designation: 'Operations Admin',
      password: ''
    });
    setShowCreateModal(true);
  };

  const filteredAdmins = admins.filter(admin => 
    admin.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.mobile.includes(searchQuery) ||
    (admin.email && admin.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black text-secondary">Operations Admin Management</h2>
            <p className="text-gray-400 font-bold mt-1">Create, edit, suspend, and configure access for Sub Super Admins.</p>
          </div>
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
          >
            <Plus size={16} /> Create Operations Admin
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-soft">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, mobile number or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f8f9fa] border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Admins Table */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50 bg-[#fafafa]">
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Admin Name</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mobile & Email</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Designation</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Scope</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-gray-400 font-semibold italic">
                      Loading Operations Admins...
                    </td>
                  </tr>
                ) : filteredAdmins.length > 0 ? (
                  filteredAdmins.map((admin) => (
                    <tr key={admin._id} className="border-b border-gray-50 hover:bg-[#fafafa]/50 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm">
                            {admin.fullName[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-secondary text-sm">{admin.fullName}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">ID: {admin._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <p className="font-bold text-secondary text-xs flex items-center gap-1"><Phone size={12} className="text-gray-400" /> {admin.mobile}</p>
                        {admin.email && (
                          <p className="text-gray-400 font-bold text-xs mt-1 flex items-center gap-1"><Mail size={12} className="text-gray-400" /> {admin.email}</p>
                        )}
                      </td>
                      <td className="p-5">
                        <span className="text-xs font-bold text-secondary bg-gray-50 border border-gray-100 px-3 py-1 rounded-xl">
                          {admin.designation || 'Operations Admin'}
                        </span>
                      </td>
                      <td className="p-5">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          admin.status === 'active' 
                            ? 'bg-green-50 text-green-600 border-green-100' 
                            : 'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {admin.status}
                        </span>
                      </td>
                      <td className="p-5">
                        <span className="text-xs font-bold text-secondary">
                          {admin.assignedScope === 'all' ? 'All India' : `${admin.assignedStates?.length || 0} States / ${admin.assignedDistricts?.length || 0} Districts`}
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => openEditModal(admin)}
                            className="p-2 hover:bg-gray-50 border border-transparent hover:border-gray-100 rounded-xl transition-all"
                            title="Edit Admin"
                          >
                            <Settings size={16} className="text-secondary" />
                          </button>
                          <button 
                            onClick={() => setResettingAdmin(admin)}
                            className="p-2 hover:bg-amber-50 border border-transparent hover:border-amber-100 rounded-xl transition-all"
                            title="Reset Password"
                          >
                            <Key size={16} className="text-amber-500" />
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(admin)}
                            className={`p-2 rounded-xl border border-transparent transition-all ${
                              admin.status === 'active'
                                ? 'hover:bg-red-50 hover:border-red-100 text-red-500'
                                : 'hover:bg-green-50 hover:border-green-100 text-green-500'
                            }`}
                            title={admin.status === 'active' ? 'Suspend Admin' : 'Activate Admin'}
                          >
                            {admin.status === 'active' ? <X size={16} /> : <Check size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-gray-400 font-semibold italic">
                      No operations admins found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create / Edit Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-black text-secondary uppercase tracking-widest flex items-center gap-2">
                <Shield size={20} className="text-primary" />
                {editingAdmin ? 'Update Operations Admin' : 'New Operations Admin'}
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-secondary p-1">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateOrUpdate} className="p-8 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold placeholder:text-gray-300 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mobile Number</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold placeholder:text-gray-300 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address (Optional)</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@sakhihub.com"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold placeholder:text-gray-300 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Designation</label>
                <div className="relative">
                  <Briefcase size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="Operations Coordinator"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold placeholder:text-gray-300 focus:outline-none"
                  />
                </div>
              </div>
              {!editingAdmin && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Initial Password</label>
                  <div className="relative">
                    <Key size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="At least 6 characters"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold placeholder:text-gray-300 focus:outline-none"
                    />
                  </div>
                </div>
              )}
              <button 
                type="submit"
                className="w-full mt-4 bg-primary text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
              >
                {editingAdmin ? 'Save Changes' : 'Create Admin'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {resettingAdmin && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-100 bg-amber-50 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-amber-800 uppercase tracking-widest">Reset Password</h3>
                <p className="text-[10px] text-amber-700/80 font-bold mt-0.5">Target: {resettingAdmin.fullName}</p>
              </div>
            </div>
            <form onSubmit={handleResetPassword} className="p-8 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">New Password</label>
                <div className="relative">
                  <Key size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 char)"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button 
                  type="button" 
                  onClick={() => setResettingAdmin(null)}
                  className="flex-1 bg-gray-50 border border-gray-100 text-secondary py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-amber-500 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] shadow-lg shadow-amber-500/20"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
