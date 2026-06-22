'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, User, Mail, Phone, MapPin, Landmark, Briefcase, 
  Calendar, ShieldCheck, Save, Loader2, CreditCard, ClipboardCheck, Edit3, Eye
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { usePincodeAutofill } from '@/hooks/usePincodeAutofill';
import { toast } from 'sonner';
import { getProxiedImageUrl } from '@/utils/imageUrl';

interface UserDetailModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: any;
  initialMode?: 'view' | 'edit';
}

export default function UserDetailModal({
  userId,
  isOpen,
  onClose,
  onSuccess,
  currentUser,
  initialMode = 'view'
}: UserDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'address' | 'bank'>('profile');
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const { loading: pincodeLoading } = usePincodeAutofill(formData.pincode, (data) => {
    setFormData((prev: any) => ({
      ...prev,
      state: data.state,
      district: data.district,
      block: data.block
    }));
  });

  const { loading: workPincodeLoading } = usePincodeAutofill(formData.workPincode, (data) => {
    setFormData((prev: any) => ({
      ...prev,
      workState: data.state,
      workDistrict: data.district,
      workBlock: data.block,
      workArea: data.area[0] || ''
    }));
  });

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/users/${userId}`);
      if (res.data.success) {
        setUserData(res.data.data);
        setFormData(res.data.data || {});
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch user details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      fetchUser();
      setMode(initialMode);
      setActiveTab('profile');
    }
  }, [isOpen, userId, initialMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev: any) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleNestedBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [name]: value
      }
    }));
  };

  const validateForm = () => {
    if (!formData.fullName || formData.fullName.trim() === '') {
      toast.error('Full Name is required');
      return false;
    }
    if (!formData.mobile || !/^\d{10}$/.test(formData.mobile)) {
      toast.error('Mobile number must be exactly 10 digits');
      return false;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Invalid email address format');
      return false;
    }
    if (formData.pincode && formData.pincode.length !== 6) {
      toast.error('Pincode must be 6 digits');
      return false;
    }
    if (formData.workPincode && formData.workPincode.length !== 6) {
      toast.error('Work pincode must be 6 digits');
      return false;
    }
    if (formData.aadhaarNumber && !/^\d{12}$/.test(formData.aadhaarNumber)) {
      toast.error('Aadhaar Number must be exactly 12 digits');
      return false;
    }
    if (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(formData.panNumber)) {
      toast.error('Invalid PAN Card number format');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      const res = await axios.patch(`/api/admin/users/${userId}`, formData);
      if (res.data.success) {
        toast.success('User profile updated successfully!');
        setUserData(res.data.data);
        setMode('view');
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update user profile');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  // Roles restriction checking
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isTargetAdmin = ['super_admin', 'operations_admin'].includes(userData?.role);
  
  let hasUpdatePermission = false;
  if (isSuperAdmin) {
    hasUpdatePermission = true;
  } else if (userData?.role) {
    let updatePerm = '';
    if (userData.role === 'vendor') updatePerm = 'vendors.update';
    else if (userData.role === 'sub_vendor') updatePerm = 'sub_vendors.update';
    else if (userData.role === 'employee') updatePerm = 'employees.update';
    else if (userData.role === 'staff') updatePerm = 'staff.update';
    else if (userData.role === 'member') updatePerm = 'members.update';

    if (updatePerm && Array.isArray(currentUser?.permissions)) {
      hasUpdatePermission = currentUser.permissions.includes(updatePerm);
    }
  }

  const canEdit = isSuperAdmin || (!isTargetAdmin && hasUpdatePermission);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden backdrop-blur-md bg-secondary/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-gray-100"
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-secondary-dark to-secondary p-8 text-white flex justify-between items-start shrink-0 relative">
          <div className="flex gap-6 items-center">
            <div className="w-20 h-20 rounded-[28px] bg-white flex items-center justify-center text-secondary text-3xl font-black shadow-lg border-2 border-white/20 overflow-hidden">
              {userData?.profileImage ? (
                <img src={getProxiedImageUrl(userData.profileImage)} alt={userData.fullName} className="w-full h-full object-cover" />
              ) : (
                userData?.fullName?.[0] || 'U'
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-black tracking-tight">{userData?.fullName || 'Loading...'}</h3>
                {userData && (
                  <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${userData.status === 'active' ? 'bg-green-400 text-secondary' : 'bg-amber-400 text-secondary'}`}>
                    {userData.status}
                  </span>
                )}
              </div>
              <p className="text-white/60 font-bold uppercase tracking-widest text-[9px] mt-1 flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-primary-light" />
                {userData?.role?.replace('_', ' ')} • {userData?.employeeId || userData?.vendorCode || userData?.subVendorCode || 'ID: N/A'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 items-center">
            {canEdit && mode === 'view' && (
              <button
                onClick={() => setMode('edit')}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all active:scale-95"
              >
                <Edit3 size={14} /> Edit Profile
              </button>
            )}
            {mode === 'edit' && (
              <button
                onClick={() => {
                  setMode('view');
                  setFormData(userData || {});
                }}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
              >
                <Eye size={14} /> View Mode
              </button>
            )}
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all ml-2"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 bg-gray-50 border-b border-gray-100 p-4 shrink-0 overflow-x-auto no-scrollbar">
          {(['profile', 'address', 'bank'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-secondary text-white shadow-md' : 'text-gray-400 hover:text-secondary hover:bg-gray-100'}`}
            >
              {tab === 'profile' && <User size={12} />}
              {tab === 'address' && <MapPin size={12} />}
              {tab === 'bank' && <Landmark size={12} />}
              {tab === 'profile' ? 'Profile Details' : tab === 'address' ? 'Location & Address' : 'Bank Accounts'}
            </button>
          ))}
        </div>

        {/* Scrollable Work Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-gray-400 font-bold animate-pulse uppercase tracking-wider text-[10px]">Retrieving secure records...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {activeTab === 'profile' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
                  {/* Section Title */}
                  <div className="col-span-1 md:col-span-2 border-b border-gray-100 pb-3 flex items-center gap-2 text-secondary">
                    <User size={16} className="text-primary" />
                    <span className="text-xs font-black uppercase tracking-wider">Demographic Profile Information</span>
                  </div>

                  {/* Inputs */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      disabled={mode === 'view' || !canEdit}
                      value={formData.fullName || ''}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 disabled:opacity-75 disabled:cursor-not-allowed rounded-2xl text-xs font-bold text-secondary outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Number</label>
                    <input
                      type="text"
                      name="mobile"
                      disabled={mode === 'view' || !canEdit}
                      value={formData.mobile || ''}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 disabled:opacity-75 disabled:cursor-not-allowed rounded-2xl text-xs font-bold text-secondary outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      disabled={mode === 'view' || !canEdit}
                      value={formData.email || ''}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 disabled:opacity-75 disabled:cursor-not-allowed rounded-2xl text-xs font-bold text-secondary outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Designation / Role Title</label>
                    <input
                      type="text"
                      name="designation"
                      disabled={mode === 'view' || !canEdit}
                      value={formData.designation || ''}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 disabled:opacity-75 disabled:cursor-not-allowed rounded-2xl text-xs font-bold text-secondary outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Gender</label>
                    <select
                      name="gender"
                      disabled={mode === 'view' || !canEdit}
                      value={formData.gender || ''}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 disabled:opacity-75 disabled:cursor-not-allowed rounded-2xl text-xs font-bold text-secondary outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      disabled={mode === 'view' || !canEdit}
                      value={formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : ''}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 disabled:opacity-75 disabled:cursor-not-allowed rounded-2xl text-xs font-bold text-secondary outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Qualifications</label>
                    <input
                      type="text"
                      name="qualification"
                      disabled={mode === 'view' || !canEdit}
                      value={formData.qualification || ''}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 disabled:opacity-75 disabled:cursor-not-allowed rounded-2xl text-xs font-bold text-secondary outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Work Experience</label>
                    <input
                      type="text"
                      name="experience"
                      disabled={mode === 'view' || !canEdit}
                      value={formData.experience || ''}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 disabled:opacity-75 disabled:cursor-not-allowed rounded-2xl text-xs font-bold text-secondary outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Aadhaar Card Number</label>
                    <input
                      type="text"
                      name="aadhaarNumber"
                      maxLength={12}
                      disabled={mode === 'view' || !canEdit}
                      value={formData.aadhaarNumber || ''}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 disabled:opacity-75 disabled:cursor-not-allowed rounded-2xl text-xs font-mono font-bold text-secondary outline-none"
                      placeholder="12 digit Aadhaar"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">PAN Card Number</label>
                    <input
                      type="text"
                      name="panNumber"
                      maxLength={10}
                      disabled={mode === 'view' || !canEdit}
                      value={formData.panNumber || ''}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 disabled:opacity-75 disabled:cursor-not-allowed rounded-2xl text-xs font-mono font-bold text-secondary outline-none"
                      placeholder="10 digit alphanumeric PAN"
                    />
                  </div>


                </div>
              )}

              {activeTab === 'address' && (
                <div className="space-y-12 animate-in fade-in duration-200">
                  {/* Permanent Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2 border-b border-gray-100 pb-3 flex items-center gap-2 text-secondary">
                      <MapPin size={16} className="text-primary" />
                      <span className="text-xs font-black uppercase tracking-wider">Permanent Location & Address</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Pincode</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="pincode"
                          maxLength={6}
                          disabled={mode === 'view' || !canEdit}
                          value={formData.pincode || ''}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                          className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 disabled:opacity-75 disabled:cursor-not-allowed rounded-2xl text-xs font-bold text-secondary outline-none"
                          placeholder="6 digit pincode"
                        />
                        {pincodeLoading && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">State</label>
                      <input
                        type="text"
                        name="state"
                        disabled={mode === 'view' || !canEdit}
                        value={formData.state || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 disabled:opacity-75 disabled:cursor-not-allowed rounded-2xl text-xs font-bold text-secondary outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">District</label>
                      <input
                        type="text"
                        name="district"
                        disabled={mode === 'view' || !canEdit}
                        value={formData.district || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 disabled:opacity-75 disabled:cursor-not-allowed rounded-2xl text-xs font-bold text-secondary outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Block</label>
                      <input
                        type="text"
                        name="block"
                        disabled={mode === 'view' || !canEdit}
                        value={formData.block || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 disabled:opacity-75 disabled:cursor-not-allowed rounded-2xl text-xs font-bold text-secondary outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Area / Village</label>
                      <input
                        type="text"
                        name="area"
                        disabled={mode === 'view' || !canEdit}
                        value={formData.area || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 disabled:opacity-75 disabled:cursor-not-allowed rounded-2xl text-xs font-bold text-secondary outline-none"
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Detailed Address</label>
                      <textarea
                        name="address"
                        rows={2}
                        disabled={mode === 'view' || !canEdit}
                        value={formData.address || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 disabled:opacity-75 disabled:cursor-not-allowed rounded-2xl text-xs font-bold text-secondary outline-none resize-none"
                      />
                    </div>
                  </div>

                  {/* Work Location */}
                  {['vendor', 'sub_vendor', 'employee'].includes(formData.role) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="col-span-1 md:col-span-2 border-b border-gray-100 pb-3 flex items-center gap-2 text-secondary">
                        <MapPin size={16} className="text-primary" />
                        <span className="text-xs font-black uppercase tracking-wider">Proposed Work Location Details</span>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Work Pincode</label>
                        <div className="relative">
                          <input
                            type="text"
                            name="workPincode"
                            maxLength={6}
                            disabled={mode === 'view' || !canEdit}
                            value={formData.workPincode || ''}
                            onChange={(e) => setFormData({ ...formData, workPincode: e.target.value.replace(/\D/g, '') })}
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 disabled:opacity-75 disabled:cursor-not-allowed rounded-2xl text-xs font-bold text-secondary outline-none"
                            placeholder="6 digit pincode"
                          />
                          {workPincodeLoading && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Work State</label>
                        <input
                          type="text"
                          name="workState"
                          disabled={mode === 'view' || !canEdit}
                          value={formData.workState || ''}
                          onChange={handleChange}
                          className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 disabled:opacity-75 disabled:cursor-not-allowed rounded-2xl text-xs font-bold text-secondary outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Work District</label>
                        <input
                          type="text"
                          name="workDistrict"
                          disabled={mode === 'view' || !canEdit}
                          value={formData.workDistrict || ''}
                          onChange={handleChange}
                          className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 disabled:opacity-75 disabled:cursor-not-allowed rounded-2xl text-xs font-bold text-secondary outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Work Block</label>
                        <input
                          type="text"
                          name="workBlock"
                          disabled={mode === 'view' || !canEdit}
                          value={formData.workBlock || ''}
                          onChange={handleChange}
                          className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 disabled:opacity-75 disabled:cursor-not-allowed rounded-2xl text-xs font-bold text-secondary outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Work Tehsil</label>
                        <input
                          type="text"
                          name="workTehsil"
                          disabled={mode === 'view' || !canEdit}
                          value={formData.workTehsil || ''}
                          onChange={handleChange}
                          className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 disabled:opacity-75 disabled:cursor-not-allowed rounded-2xl text-xs font-bold text-secondary outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Work Panchayat / Area</label>
                        <input
                          type="text"
                          name="workArea"
                          disabled={mode === 'view' || !canEdit}
                          value={formData.workArea || ''}
                          onChange={handleChange}
                          className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 disabled:opacity-75 disabled:cursor-not-allowed rounded-2xl text-xs font-bold text-secondary outline-none"
                        />
                      </div>

                      <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Work Detailed Address</label>
                        <textarea
                          name="workAddress"
                          rows={2}
                          disabled={mode === 'view' || !canEdit}
                          value={formData.workAddress || ''}
                          onChange={handleChange}
                          className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 disabled:opacity-75 disabled:cursor-not-allowed rounded-2xl text-xs font-bold text-secondary outline-none resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'bank' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
                  <div className="col-span-1 md:col-span-2 border-b border-gray-100 pb-3 flex items-center gap-2 text-secondary">
                    <Landmark size={16} className="text-primary" />
                    <span className="text-xs font-black uppercase tracking-wider">Settlement & Bank Details</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Bank Name</label>
                    <input
                      type="text"
                      name="bankName"
                      disabled={mode === 'view' || !canEdit}
                      value={formData.bankDetails?.bankName || ''}
                      onChange={handleNestedBankChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 disabled:opacity-75 disabled:cursor-not-allowed rounded-2xl text-xs font-bold text-secondary outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Holder Name</label>
                    <input
                      type="text"
                      name="accountHolderName"
                      disabled={mode === 'view' || !canEdit}
                      value={formData.bankDetails?.accountHolderName || ''}
                      onChange={handleNestedBankChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 disabled:opacity-75 disabled:cursor-not-allowed rounded-2xl text-xs font-bold text-secondary outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Number</label>
                    <input
                      type="text"
                      name="accountNumber"
                      disabled={mode === 'view' || !canEdit}
                      value={formData.bankDetails?.accountNumber || ''}
                      onChange={handleNestedBankChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 disabled:opacity-75 disabled:cursor-not-allowed rounded-2xl text-xs font-mono font-bold text-secondary outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">IFSC Code</label>
                    <input
                      type="text"
                      name="ifscCode"
                      disabled={mode === 'view' || !canEdit}
                      value={formData.bankDetails?.ifscCode || ''}
                      onChange={handleNestedBankChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 disabled:opacity-75 disabled:cursor-not-allowed rounded-2xl text-xs font-mono font-bold text-secondary outline-none"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Branch Name</label>
                    <input
                      type="text"
                      name="branchName"
                      disabled={mode === 'view' || !canEdit}
                      value={formData.bankDetails?.branchName || ''}
                      onChange={handleNestedBankChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 disabled:opacity-75 disabled:cursor-not-allowed rounded-2xl text-xs font-bold text-secondary outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Action Footer */}
              {mode === 'edit' && canEdit && (
                <div className="pt-8 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('view');
                      setFormData(userData || {});
                    }}
                    className="px-6 py-3 border border-gray-100 text-secondary bg-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Profile Changes
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
