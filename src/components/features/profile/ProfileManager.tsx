'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Mail, MapPin, Phone, Camera, Save, Loader2, 
  Building2, Briefcase, Calendar, ShieldCheck, Map
} from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { usePincodeAutofill } from '@/hooks/usePincodeAutofill';

export default function ProfileManager() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { loading: pincodeLoading } = usePincodeAutofill(formData.pincode, (data) => {
    setFormData((prev: any) => ({
      ...prev,
      state: data.state,
      district: data.district,
      block: data.block
    }));
  });

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/user/profile');
      if (res.data.success) {
        setUser(res.data.data);
        setFormData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setFormData({ ...formData, profileImage: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });

      const res = await axios.patch('/api/user/profile', data);
      if (res.data.success) {
        setUser(res.data.data);
        alert('Profile updated successfully!');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[40px] shadow-2xl shadow-black/5 overflow-hidden border border-gray-50"
      >
        {/* Banner Decor */}
        <div className="h-40 bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10 relative">
          <div className="absolute inset-0 opacity-20 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, gray 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="px-8 pb-12 -mt-20 relative z-10">
          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-end gap-8">
              <div className="relative group">
                <div className="w-40 h-40 rounded-[40px] bg-white p-2 shadow-2xl border border-gray-100 overflow-hidden">
                  <img 
                    src={preview || user?.profileImage || `https://ui-avatars.com/api/?name=${user?.fullName}&background=random&size=200`} 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-[32px]"
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all group-hover:ring-4 ring-primary/20"
                >
                  <Camera size={20} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>

              <div className="flex-1 pb-4">
                <h2 className="text-4xl font-black text-secondary tracking-tight">{user?.fullName}</h2>
                <div className="flex flex-wrap gap-4 mt-2">
                  <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={14} /> {user?.role?.replace('_', ' ')}
                  </span>
                  <span className="px-4 py-1.5 bg-secondary/5 text-secondary rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={14} /> {user?.district || 'Location not set'}
                  </span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={saving}
                className="mb-4 px-10 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Save Changes
              </button>
            </div>

            {/* Form Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8 border-t border-gray-50">
              {/* Personal Information */}
              <section className="space-y-8">
                <h3 className="text-xl font-black text-secondary uppercase tracking-wider flex items-center gap-3">
                   <User size={20} className="text-primary" /> Personal Information
                </h3>
                
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      <input 
                        type="text" 
                        name="fullName" 
                        value={formData.fullName || ''} 
                        onChange={handleChange}
                        className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 ring-primary/10 focus:border-primary transition-all outline-none font-bold text-secondary"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Email Address (Read-only)</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      <input 
                        type="email" 
                        value={user?.email || ''} 
                        readOnly
                        className="w-full pl-12 pr-6 py-4 bg-gray-100/50 border border-gray-100 rounded-2xl font-bold text-gray-400 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      <input 
                        type="text" 
                        name="mobile"
                        value={formData.mobile || ''} 
                        onChange={handleChange}
                        className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 ring-primary/10 focus:border-primary transition-all outline-none font-bold text-secondary"
                        placeholder="10 digit mobile"
                      />
                    </div>
                  </div>

                  {(user?.role === 'vendor' || user?.role === 'sub_vendor') && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Business Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input 
                          type="text" 
                          name="businessName" 
                          value={formData.businessName || ''} 
                          onChange={handleChange}
                          className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 ring-primary/10 focus:border-primary transition-all outline-none font-bold text-secondary"
                          placeholder="Organization Name"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Address Information */}
              <section className="space-y-8">
                <h3 className="text-xl font-black text-secondary uppercase tracking-wider flex items-center gap-3">
                   <MapPin size={20} className="text-primary" /> Location & Address
                </h3>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">State</label>
                    <input 
                      type="text" 
                      name="state" 
                      value={formData.state || ''} 
                      onChange={handleChange}
                      className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 ring-primary/10 focus:border-primary transition-all outline-none font-bold text-secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">District</label>
                    <input 
                      type="text" 
                      name="district" 
                      value={formData.district || ''} 
                      onChange={handleChange}
                      className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 ring-primary/10 focus:border-primary transition-all outline-none font-bold text-secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Block</label>
                    <input 
                      type="text" 
                      name="block" 
                      value={formData.block || ''} 
                      onChange={handleChange}
                      className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 ring-primary/10 focus:border-primary transition-all outline-none font-bold text-secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Pincode</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      <input 
                        type="text" 
                        name="pincode" 
                        maxLength={6}
                        value={formData.pincode || ''} 
                        onChange={(e) => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '')})}
                        className="w-full pl-12 pr-10 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 ring-primary/10 focus:border-primary transition-all outline-none font-bold text-secondary"
                        placeholder="6 digit pincode"
                      />
                      {pincodeLoading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Detailed Address</label>
                    <textarea 
                      name="address" 
                      rows={3}
                      value={formData.address || ''} 
                      onChange={handleChange}
                      className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 ring-primary/10 focus:border-primary transition-all outline-none font-bold text-secondary resize-none"
                      placeholder="Street, Landmark, City..."
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Other Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50/50 p-8 rounded-[35px] border border-gray-100 grid grid-cols-2 gap-8">
                 <div className="space-y-1">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Joining Date</p>
                   <div className="flex items-center gap-2 font-black text-secondary">
                     <Calendar size={16} className="text-primary" /> {user?.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : 'N/A'}
                   </div>
                 </div>
                 <div className="space-y-1">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Designation</p>
                   <div className="flex items-center gap-2 font-black text-secondary">
                     <Briefcase size={16} className="text-primary" /> {user?.designation || 'Member'}
                   </div>
                 </div>
                 <div className="space-y-1">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">User ID</p>
                   <div className="flex items-center gap-2 font-black text-secondary uppercase">
                     <ShieldCheck size={16} className="text-primary" /> {user?.employeeId || user?.subVendorCode || user?.vendorCode || 'N/A'}
                   </div>
                 </div>
                 <div className="space-y-1">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">User Status</p>
                   <div className="flex items-center gap-2 font-black text-green-600 uppercase">
                     <span className="w-2 h-2 rounded-full bg-green-500"></span> {user?.status}
                   </div>
                 </div>
              </div>

              {/* Parent Info Section */}
              {user?.parentVendorId && (
                <div className="bg-primary/5 p-8 rounded-[35px] border border-primary/10 flex flex-col justify-center">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Reporting To (Parent Organization)</p>
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm border border-primary/10 font-black text-xl">
                      {user.parentVendorId.fullName?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-secondary">{user.parentVendorId.fullName}</h4>
                      <div className="flex gap-4 mt-1">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                          <Phone size={12} className="text-primary" /> {user.parentVendorId.mobile}
                        </span>
                        <span className="px-2 py-0.5 bg-white text-[9px] font-black uppercase tracking-widest text-primary border border-primary/10 rounded-full">
                          {user.parentVendorId.role?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
