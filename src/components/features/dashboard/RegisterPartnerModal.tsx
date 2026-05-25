'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, UserPlus, Phone, Mail, 
  MapPin, Briefcase, ShieldCheck, 
  Sparkles, CheckCircle2, ChevronDown, User,
  Target, AlertCircle, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import PasswordField from '@/components/ui/PasswordField';
import { validatePassword } from '@/utils/validation';
import { usePincodeAutofill } from '@/hooks/usePincodeAutofill';

interface RegisterPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  role: 'vendor' | 'sub_vendor' | 'employee' | 'member';
  parentVendorId?: string;
  vendorCode?: string;
  subVendorCode?: string;
}

export default function RegisterPartnerModal({ 
  isOpen, onClose, onSuccess, role, 
  parentVendorId: initialParentId,
  vendorCode: initialVendorCode,
  subVendorCode: initialSubVendorCode
}: RegisterPartnerModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [vendors, setVendors] = useState<any[]>([]);
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    role: role,
    parentVendorId: initialParentId || '',
    vendorCode: initialVendorCode || '',
    subVendorCode: initialSubVendorCode || '',
    state: '',
    district: '',
    block: '',
    area: '',
    pincode: '',
    address: '',
    designation: '',
    aadhaarNumber: '',
    panNumber: '',
    businessName: '',
    vendorType: 'individual',
    campaignId: '',
    // Member specific
    age: '',
    maritalStatus: 'Unmarried',
    occupation: '',
    interests: [] as string[],
    membershipStatus: 'free',
  });

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFetching(true);
      setShowOtpStep(false);
      setOtp("");
      const fetchData = async () => {
        try {
          const promises: any[] = [axios.get('/api/admin/campaigns?status=active')];
          
          if (role === 'sub_vendor' && !initialParentId) {
            promises.push(axios.get('/api/admin/vendors?status=active'));
          }
          
          const [campRes, vendRes] = await Promise.all(promises);
          
          if (campRes.data.success) setCampaigns(campRes.data.data);
          if (vendRes?.data?.success) setVendors(vendRes.data.data);
        } catch (err) {
          console.error("Failed to fetch onboarding data", err);
        } finally {
          setFetching(false);
        }
      };
      fetchData();
      
      // Update role in form if prop changes
      setFormData(prev => ({ 
        ...prev, 
        role,
        password: '' // Reset password on open
      }));

      // Body scroll lock
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, role, initialParentId]);

  const { loading: pincodeLoading } = usePincodeAutofill(formData.pincode, (data) => {
    setFormData(prev => ({
      ...prev,
      state: data.state,
      district: data.district,
      block: data.block,
      area: data.area[0] || ''
    }));
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email) {
      setError("Email is required for verification");
      return;
    }

    const passValid = validatePassword(formData.password);
    if (!passValid.isValid) {
      setError(`Weak password: ${passValid.errors.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', formData);
      if (res.data.success) {
        if (res.data.data.requiresOtp) {
          setShowOtpStep(true);
        } else {
          onSuccess();
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.post('/api/auth/verify-otp', {
        email: formData.email,
        otp,
        purpose: 'Registration'
      });
      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const roleTitle = {
    'vendor': 'Master Vendor',
    'sub_vendor': 'Sub-Vendor Partner',
    'employee': 'Field Employee',
    'member': 'Woman Member'
  }[role];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-6 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-secondary/60 backdrop-blur-md" 
      />
      <motion.div 
        initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
        className="relative bg-white w-full max-w-2xl md:rounded-[40px] rounded-t-[32px] shadow-2xl flex flex-col h-full md:h-auto max-h-screen md:max-h-[90vh] overflow-hidden"
      >
        <div className="bg-gradient-to-r from-primary to-secondary p-6 md:p-10 text-white relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute right-6 top-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
          ><X size={18} /></button>
          
          <div className="flex gap-4 md:gap-6 items-center pr-10">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner shrink-0">
              <UserPlus size={24} className="md:hidden" />
              <UserPlus size={32} className="hidden md:block" />
            </div>
            <div>
              <h3 className="text-xl md:text-3xl font-black tracking-tight leading-tight">
                {showOtpStep ? "Verify Registration" : `Register ${roleTitle}`}
              </h3>
              <p className="text-white/70 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">
                {showOtpStep ? "Security Verification" : "Onboarding Flow"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
          <AnimatePresence mode="wait">
            {!showOtpStep ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <form id="partner-reg-form" onSubmit={handleSubmit} className="p-6 md:p-10">
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-3">
                      <ShieldAlert size={18} /> {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          required
                          type="text" 
                          value={formData.fullName}
                          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                          placeholder="Enter full name"
                          className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          required
                          type="tel" 
                          value={formData.mobile}
                          onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                          placeholder="10 digit mobile"
                          className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          required
                          type="email" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="Email (Required)"
                          className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assigned Campaign</label>
                      <div className="relative">
                        <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select 
                          value={formData.campaignId}
                          onChange={(e) => setFormData({...formData, campaignId: e.target.value})}
                          className="w-full pl-12 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none"
                        >
                          <option value="">Select Campaign (Optional)</option>
                          {campaigns.map(c => (
                            <option key={c._id} value={c._id}>{c.title}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                       <PasswordField
                         label="Secure Password"
                         value={formData.password}
                         onChange={(e) => setFormData({...formData, password: e.target.value})}
                         placeholder="Min 8 chars, 1 Upper, 1 Special"
                         required
                       />
                    </div>

                    {role !== 'vendor' && role !== 'sub_vendor' && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Aadhaar Number</label>
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                            <ShieldCheck size={18} />
                          </div>
                          <input 
                            type="text" 
                            maxLength={12}
                            value={formData.aadhaarNumber}
                            onChange={(e) => setFormData({...formData, aadhaarNumber: e.target.value})}
                            placeholder="12 digit Aadhaar"
                            className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                          />
                        </div>
                      </div>
                    )}

                    {role === 'vendor' && (
                      <div className="space-y-2 col-span-1 md:col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Vendor Entity Type</label>
                        <div className="relative">
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <select 
                            required
                            value={formData.vendorType}
                            onChange={(e) => setFormData({...formData, vendorType: e.target.value as any})}
                            className="w-full pl-12 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none"
                          >
                            <option value="individual">Individual Vendor</option>
                            <option value="company">Company Vendor</option>
                            <option value="ngo_trust">NGO / Trust Vendor</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                      </div>
                    )}

                    {(role === 'vendor' || role === 'sub_vendor') && (
                      <div className="space-y-2 col-span-1 md:col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Organization / NGO Name</label>
                        <div className="relative">
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input 
                            required
                            type="text" 
                            value={formData.businessName}
                            onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                            placeholder="Organization Name"
                            className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                          />
                        </div>
                      </div>
                    )}

                    {role === 'member' && (
                      <>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Age</label>
                          <input 
                            required
                            type="number" 
                            value={formData.age}
                            onChange={(e) => setFormData({...formData, age: e.target.value})}
                            placeholder="Member Age"
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Marital Status</label>
                          <select 
                            value={formData.maritalStatus}
                            onChange={(e) => setFormData({...formData, maritalStatus: e.target.value as any})}
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                          >
                            <option value="Married">Married</option>
                            <option value="Unmarried">Unmarried</option>
                          </select>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">State</label>
                      <input 
                        required
                        type="text" 
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                        placeholder="Enter State"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">District</label>
                      <input 
                        required
                        type="text" 
                        value={formData.district}
                        onChange={(e) => setFormData({...formData, district: e.target.value})}
                        placeholder="Enter District"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pincode</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          required
                          type="text" 
                          maxLength={6}
                          value={formData.pincode}
                          onChange={(e) => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '')})}
                          placeholder="6 digit pincode"
                          className="w-full pl-12 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                        />
                        {pincodeLoading && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Address</label>
                    <textarea 
                      required
                      rows={2}
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Residential / Office Address"
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                    />
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-8 md:p-12 flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <ShieldCheck size={40} className="text-primary" />
                </div>
                <h3 className="text-2xl font-black text-secondary mb-2">Verify OTP</h3>
                <p className="text-gray-500 font-bold mb-8">
                  A verification code has been sent to <br/>
                  <span className="text-primary">{formData.email}</span>
                </p>

                <form onSubmit={handleVerifyOtp} className="w-full space-y-6">
                  <input 
                    required
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full text-center text-3xl font-black tracking-[1em] py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary transition-all outline-none"
                  />
                  
                  {error && (
                    <div className="p-4 bg-red-50 text-red-500 rounded-xl text-xs font-bold border border-red-100">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setShowOtpStep(false)}
                      className="flex-1 py-4 border-2 border-gray-200 text-gray-500 font-black text-xs uppercase tracking-widest rounded-2xl"
                    >Back</button>
                    <button 
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      className="flex-[2] py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                      {loading ? "Verifying..." : "Complete Registration"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!showOtpStep && (
          <div className="p-6 md:p-10 bg-gray-50 border-t border-gray-100 shrink-0">
            <div className="flex flex-col md:flex-row gap-4">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl border-2 border-gray-200 text-gray-500 font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-100 transition-all order-2 md:order-1"
              >Cancel</button>
              <button 
                type="submit"
                form="partner-reg-form"
                disabled={loading}
                className="flex-[2] py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100 order-1 md:order-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Sparkles size={18} /> Send Verification Code</>
                )}
              </button>
            </div>
            <p className="mt-4 text-center text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
              Account will be created after OTP verification.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

