'use client';

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Phone, MapPin, ShieldCheck,
  ArrowRight, ArrowLeft, Users, Briefcase, Sparkles,
  ClipboardList, BookOpen, Clock, AlertCircle, Mail, Check,
  CheckCircle, X
} from "lucide-react";
import { useRouter } from "next/navigation";
import PasswordField from "@/components/ui/PasswordField";
import { validatePassword } from "@/utils/validation";
import { usePincodeAutofill } from "@/hooks/usePincodeAutofill";
import { useLanguage } from "@/context/LanguageContext";

const designations = [
  "Block Employee",
  "District Coordinator",
  "Volunteer",
  "Delivery Partner",
  "Other"
];

export default function RegisterForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const steps = [
    { id: 1, name: t('auth.register.steps.role') },
    { id: 2, name: t('auth.register.steps.details') },
    { id: 3, name: t('auth.register.steps.location') },
    { id: 4, name: t('auth.register.steps.connect') },
    { id: 5, name: t('auth.register.steps.membership') },
    { id: 6, name: t('auth.register.steps.security') },
  ];

  const [formData, setFormData] = useState({
    role: "",
    fullName: "",
    mobile: "",
    email: "",
    designation: "",
    qualification: "",
    experience: "",
    state: "",
    district: "",
    block: "",
    area: "",
    pincode: "",
    address: "",
    password: "",
    confirmPassword: "",
    assignedEmployeeId: "",
    vendorCode: "",
    subVendorCode: "",
    campaignId: "",
    vendorType: "individual",
    membershipType: "free",
  });

  const [referralContext, setReferralContext] = useState<{ role: string, parent: string } | null>(null);
  const [referredEmployee, setReferredEmployee] = useState<any>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const targetRole = params.get('role');
    const vCode = params.get('vendor');
    const svCode = params.get('subvendor');
    const eCode = params.get('employee');
    const cId = params.get('campaign');

    if (targetRole || vCode || svCode || eCode || cId) {
      setFormData(prev => ({
        ...prev,
        role: targetRole || prev.role,
        vendorCode: vCode || prev.vendorCode,
        subVendorCode: svCode || prev.subVendorCode,
        campaignId: cId || prev.campaignId,
      }));

      const inviterCode = eCode || svCode || vCode;
      if (inviterCode) {
        // Fetch the details of the inviter by their code (can be Employee, Sub-Vendor, or Vendor)
        const resolveInviter = async () => {
          try {
            const res = await fetch(`/api/employees/nearby?employeeCode=${inviterCode}`);
            const result = await res.json();
            if (result.success && result.data) {
              setReferredEmployee(result.data);

              setFormData(prev => {
                const update: any = { ...prev };
                if (result.data.role === 'employee') {
                  update.assignedEmployeeId = result.data._id;
                } else if (result.data.role === 'sub_vendor') {
                  update.subVendorCode = result.data.subVendorCode;
                } else if (result.data.role === 'vendor') {
                  update.vendorCode = result.data.vendorCode;
                }
                return update;
              });
            }
          } catch (err) {
            console.error("Failed to resolve referred inviter", err);
          }
        };
        resolveInviter();
      }

      if (targetRole) {
        setStep(2); // Jump to Details step if role is pre-defined
        setReferralContext({
          role: targetRole.replace('_', ' '),
          parent: vCode || svCode || eCode || 'Admin'
        });
      }
    }
  }, []);

  const [nearbyEmployees, setNearbyEmployees] = useState<any[]>([]);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState<{ [key: string]: string }>({});

  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const [membershipConfig, setMembershipConfig] = useState<any>(null);
  const [configLoading, setConfigLoading] = useState(false);

  React.useEffect(() => {
    const fetchConfig = async () => {
      setConfigLoading(true);
      try {
        const res = await fetch('/api/public/membership-config');
        const data = await res.json();
        if (data.success && data.data) {
          setMembershipConfig(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch membership config:", err);
      } finally {
        setConfigLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const { loading: pincodeLoading } = usePincodeAutofill(formData.pincode, (data) => {
    setFormData(prev => ({
      ...prev,
      state: data.state,
      district: data.district,
      block: data.block,
      area: data.area[0] || ""
    }));
    fetchNearbyEmployees(formData.pincode, data.district, data.block);
  });

  const fetchNearbyEmployees = async (pincode: string, district: string, block: string) => {
    setDiscoveryLoading(true);
    try {
      const res = await fetch(`/api/employees/nearby?pincode=${pincode}&district=${district}&block=${block}`);
      const result = await res.json();
      if (result.success) {
        setNearbyEmployees(result.data);
      }
    } catch (err) {
      console.error("Nearby discovery failed", err);
    } finally {
      setDiscoveryLoading(false);
    }
  };

  const handleConnect = async (employeeId: string) => {
    setFormData(prev => ({ ...prev, assignedEmployeeId: employeeId }));
    setRequestStatus(prev => ({ ...prev, [employeeId]: 'selected' }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (step === 1 && !formData.role) return;
    setStep((prev) => {
      let next = prev + 1;
      if (next === 5 && formData.role !== 'member') next = 6;
      return Math.min(next, 6);
    });
  };
  const prevStep = () => {
    setStep((prev) => {
      let previous = prev - 1;
      if (previous === 5 && formData.role !== 'member') previous = 4;
      return Math.max(previous, 1);
    });
  };

  const visibleSteps = steps.filter(s => formData.role === 'member' || s.id !== 5);
  const currentStepIndex = visibleSteps.findIndex(s => s.id === step) !== -1 ? visibleSteps.findIndex(s => s.id === step) : 0;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email) {
      setError("Email is required for verification");
      return;
    }

    // Password Strength Validation
    const passwordValid = validatePassword(formData.password);
    // (Will need translatable errors later, skipping for now)
    if (!passwordValid.isValid) {
      setError(`Password is too weak: ${passwordValid.errors.join(', ')}`);
      return;
    }

    // Validation
    if (formData.mobile.length !== 10 || !/^\d{10}$/.test(formData.mobile)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Clean up empty strings to avoid Cast errors on backend
      const cleanData = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== "")
      );

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Registration failed");
      }

      if (result.data.requiresOtp) {
        setShowOtpStep(true);
        setResendTimer(60);
      } else {
        router.push('/login?registered=true');
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Something went wrong. Please try again.");
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
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp, purpose: 'Registration' })
      });
      const result = await res.json();
      if (result.success) {
        router.push('/login?registered=true');
      } else {
        throw new Error(result.message || "OTP Verification failed");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, purpose: 'Registration' })
      });
      const result = await res.json();
      if (result.success) {
        setResendTimer(60);
      } else {
        throw new Error(result.message || "Resend failed");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4 }
  };

  return (
    <div className="w-full max-w-[650px] px-2 md:px-0 mx-auto">
      <AnimatePresence mode="wait">
        {showOtpStep ? (
          <motion.div
            key="otp-step"
            {...fadeInUp}
            className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl shadow-primary/10 border border-primary/10"
          >
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={40} className="text-primary" />
              </div>
              <h2 className="text-3xl font-black text-secondary">{t('auth.register.form.verifyEmail')}</h2>
              <p className="text-gray-400 font-bold mt-2">
                {t('auth.register.form.codeSent')} <br />
                <span className="text-primary">{formData.email}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">{t('auth.register.form.enterCode')}</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="0 0 0 0 0 0"
                  className="w-full text-center text-4xl font-black tracking-[10px] md:tracking-[20px] py-6 rounded-3xl border-2 border-gray-100 bg-gray-50 focus:outline-none focus:border-primary focus:bg-white transition-all"
                  required
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-500 text-sm rounded-2xl font-bold flex items-center gap-3 border border-red-100">
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              <div className="flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="btn-primary w-full py-5 justify-center text-lg shadow-xl shadow-primary/20"
                >
                  {loading ? "Verifying..." : t('auth.register.form.verifyBtn')}
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading || resendTimer > 0}
                  className="text-sm font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-all disabled:opacity-50"
                >
                  {resendTimer > 0 ? `${t('auth.register.form.resendIn')} ${resendTimer}s` : t('auth.register.form.resendCode')}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <div key="register-steps" className="w-full">
            {/* Step Indicator */}
            <div className="flex justify-between mb-8 md:mb-12 relative px-2">
              <div className="absolute top-[16px] left-0 w-full h-[2px] bg-gray-100 z-0"></div>
              <div
                className="absolute top-[16px] left-0 h-[2px] bg-gradient-to-r from-primary to-secondary z-0 transition-all duration-500"
                style={{ width: `${(currentStepIndex / Math.max(visibleSteps.length - 1, 1)) * 100}%` }}
              ></div>

              {visibleSteps.map((s) => (
                <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-black transition-all duration-300 ${step >= s.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-300 border-2 border-gray-100'}`}>
                    {step > s.id ? <CheckCircle size={16} /> : s.id}
                  </div>
                  <span className={`text-[10px] md:text-xs font-black uppercase tracking-tighter md:tracking-widest ${step >= s.id ? 'text-secondary' : 'text-gray-300'}`}>
                    {s.name}
                  </span>
                </div>
              ))}
            </div>

            {referralContext && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-[24px] border border-primary/20 flex items-center gap-5"
              >
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-secondary uppercase tracking-tight">Joining as {referralContext.role}</h4>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1"> {t("auth.register.form.invitedBy")} <span className="text-primary">{referralContext.parent}</span></p>
                </div>
              </motion.div>
            )}

            <div className="mb-6 md:mb-10 text-center md:text-left">
              <h2 className="text-2xl md:text-4xl font-black text-secondary leading-tight">{steps[step - 1].name} Details</h2>
            </div>

            <form onSubmit={handleRegister}>
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" {...fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div
                      onClick={() => !referralContext && setFormData({ ...formData, role: "vendor" })}
                      className={`p-6 md:p-8 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-4 items-center text-center ${formData.role === "vendor" ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white hover:border-gray-200'} ${referralContext && formData.role !== 'vendor' ? 'opacity-40 grayscale pointer-events-none' : ''}`}
                    >
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><ShieldCheck size={28} /></div>
                      <div>
                        <h3 className="text-lg md:text-xl font-black text-secondary">{t("auth.register.form.vendor")}</h3>
                        <p className="text-xs md:text-sm text-gray-400">{t("auth.register.form.vendorDesc")}</p>
                      </div>
                    </div>
                    <div
                      onClick={() => !referralContext && setFormData({ ...formData, role: "sub_vendor" })}
                      className={`p-6 md:p-8 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-4 items-center text-center ${formData.role === "sub_vendor" ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white hover:border-gray-200'} ${referralContext && formData.role !== 'sub_vendor' ? 'opacity-40 grayscale pointer-events-none' : ''}`}
                    >
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary"><CheckCircle size={28} /></div>
                      <div>
                        <h3 className="text-lg md:text-xl font-black text-secondary">{t("auth.register.form.subVendor")}</h3>
                        <p className="text-xs md:text-sm text-gray-400">{t("auth.register.form.subVendorDesc")}</p>
                      </div>
                    </div>
                    <div
                      onClick={() => !referralContext && setFormData({ ...formData, role: "employee" })}
                      className={`p-6 md:p-8 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-4 items-center text-center ${formData.role === "employee" ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white hover:border-gray-200'} ${referralContext && formData.role !== 'employee' ? 'opacity-40 grayscale pointer-events-none' : ''}`}
                    >
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary"><Briefcase size={28} /></div>
                      <div>
                        <h3 className="text-lg md:text-xl font-black text-secondary">{t("auth.register.form.employee")}</h3>
                        <p className="text-xs md:text-sm text-gray-400">{t("auth.register.form.employeeDesc")}</p>
                      </div>
                    </div>
                    <div
                      onClick={() => !referralContext && setFormData({ ...formData, role: "member" })}
                      className={`p-6 md:p-8 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-4 items-center text-center ${formData.role === "member" ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white hover:border-gray-200'} ${referralContext && formData.role !== 'member' ? 'opacity-40 grayscale pointer-events-none' : ''}`}
                    >
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><Users size={28} /></div>
                      <div>
                        <h3 className="text-lg md:text-xl font-black text-secondary">{t("auth.register.form.member")}</h3>
                        <p className="text-xs md:text-sm text-gray-400">{t("auth.register.form.memberDesc")}</p>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <button type="button" disabled={!formData.role} onClick={nextStep} className="btn-primary w-full py-4 justify-center text-sm md:text-base">{t("auth.register.form.continue")} <ArrowRight size={20} /></button>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" {...fadeInUp} className="flex flex-col gap-4 md:gap-6">
                    {(formData.role === 'vendor' || formData.role === 'sub_vendor') && (
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-black text-gray-700">{t("auth.register.form.vendorType")}</label>
                        <div className="relative">
                          <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <select
                            name="vendorType"
                            value={formData.vendorType}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 md:py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-white font-bold"
                            required
                          >
                            <option value="individual">{t("auth.register.form.individualVendor")}</option>
                            <option value="company">{t("auth.register.form.companyVendor")}</option>
                            <option value="ngo_trust">{t("auth.register.form.ngoVendor")}</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-black text-gray-700">{t("auth.register.form.fullName")}</label>
                        <div className="relative">
                          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder={t("auth.register.form.fullName")} className="w-full pl-12 pr-4 py-3 md:py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20" required />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-black text-gray-700">{t("auth.register.form.mobile")}</label>
                        <div className="relative">
                          <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} placeholder={t("auth.register.form.mobile")} className="w-full pl-12 pr-4 py-3 md:py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20" required />
                        </div>
                      </div>
                    </div>

                    {formData.role === 'employee' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-black text-gray-700">{t("auth.register.form.applyFor")}</label>
                          <div className="relative">
                            <ClipboardList size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select name="designation" value={formData.designation} onChange={handleChange} className="w-full pl-12 pr-4 py-3 md:py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-white font-bold" required>
                              <option value="">{t("auth.register.form.selectDesignation")}</option>
                              {designations.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {formData.role === 'employee' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-black text-gray-700">{t("auth.register.form.qualification")}</label>
                          <div className="relative">
                            <BookOpen size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} placeholder="B.A, 12th, etc." className="w-full pl-12 pr-4 py-3 md:py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-black text-gray-700">{t("auth.register.form.experience")}</label>
                          <div className="relative">
                            <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" name="experience" value={formData.experience} onChange={handleChange} placeholder="Years/Details" className="w-full pl-12 pr-4 py-3 md:py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-black text-gray-700">{t("auth.register.form.email")}</label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" className="w-full pl-12 pr-4 py-3 md:py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20" required />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                      <button type="button" onClick={prevStep} className="btn-secondary w-full justify-center order-2 sm:order-1 py-4">{t("auth.register.form.back")}</button>
                      <button type="button" onClick={nextStep} className="btn-primary w-full justify-center order-1 sm:order-2 py-4">{t("auth.register.form.nextStep")}</button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step3" {...fadeInUp} className="flex flex-col gap-4 md:gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-black text-gray-700">{t("auth.register.form.pincode")}</label>
                      <div className="relative">
                        <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="6 Digit Pincode" maxLength={6} className="w-full pl-12 pr-4 py-3 md:py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 font-black text-lg" required />
                        {pincodeLoading && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-black text-gray-700">{t("auth.register.form.state")}</label>
                        <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder={t("auth.register.form.state")} className="w-full px-4 py-3 md:py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20" required />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-black text-gray-700">{t("auth.register.form.district")}</label>
                        <input type="text" name="district" value={formData.district} onChange={handleChange} placeholder={t("auth.register.form.district")} className="w-full px-4 py-3 md:py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20" required />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-black text-gray-700">{t("auth.register.form.block")}</label>
                        <input type="text" name="block" value={formData.block} onChange={handleChange} placeholder="Block Name" className="w-full px-4 py-3 md:py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20" required />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-black text-gray-700">{t("auth.register.form.area")}</label>
                        <input type="text" name="area" value={formData.area} onChange={handleChange} placeholder="Area Name" className="w-full px-4 py-3 md:py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20" required />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-black text-gray-700">{t("auth.register.form.address")}</label>
                      <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Village, Landmark, etc." rows={3} className="w-full px-4 py-3 md:py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20" required></textarea>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                      <button type="button" onClick={prevStep} className="btn-secondary w-full justify-center order-2 sm:order-1 py-4">{t("auth.register.form.back")}</button>
                      <button type="button" onClick={nextStep} className="btn-primary w-full justify-center order-1 sm:order-2 py-4">{formData.role === 'member' ? t('auth.register.form.findNearby') : t('auth.register.form.lastStep')}</button>
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div key="step4" {...fadeInUp} className="flex flex-col gap-6">
                    {referredEmployee ? (
                      <>
                        <div className="text-center">
                          <h3 className="text-xl md:text-2xl font-black text-secondary">{t("auth.register.form.connectionConfirmed")}</h3>
                          <p className="text-gray-400 text-sm mt-1">{t("auth.register.form.autoConnect")}</p>
                        </div>

                        <div className="p-6 rounded-3xl border-2 border-green-200 bg-green-50/50 flex justify-between items-center gap-4 shadow-md text-left">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
                              <Check size={24} strokeWidth={3} />
                            </div>
                            <div>
                              <h4 className="font-black text-secondary text-base leading-tight">{referredEmployee.fullName}</h4>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                                {referredEmployee.role === 'vendor' ? 'Inviting Vendor' : referredEmployee.role === 'sub_vendor' ? 'Inviting Sub-Vendor' : 'Inviting Hero'}: {referredEmployee.employeeId || referredEmployee.subVendorCode || referredEmployee.vendorCode}
                              </p>
                              <p className="text-xs text-green-600 font-black mt-0.5">
                                {referredEmployee.block || 'Regional'}, {referredEmployee.district || 'Partner'}
                              </p>
                            </div>
                          </div>
                          <span className="px-4 py-2 bg-green-100 text-green-700 rounded-xl text-xs font-black uppercase tracking-wider shrink-0">
                            Linked
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-center">
                          <h3 className="text-xl md:text-2xl font-black text-secondary">{formData.role === 'member' ? t('auth.register.form.connectLocal') : t('auth.register.form.verifyLocation')}</h3>
                          <p className="text-gray-400 text-sm mt-1">{formData.role === 'member' ? t('auth.register.form.chooseEmployee') : t('auth.register.form.confirmArea')}</p>
                        </div>

                        {formData.role === 'member' ? (
                          <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto px-2 pb-4 scrollbar-hide">
                            {discoveryLoading ? (
                              <div className="text-center py-12 flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-4 border-gray-100 border-t-primary rounded-full animate-spin"></div>
                                <p className="text-gray-400 font-bold">{t("auth.register.form.searching")}</p>
                              </div>
                            ) : nearbyEmployees.length > 0 ? (
                              nearbyEmployees.map((emp) => (
                                <div key={emp._id} className={`p-5 rounded-3xl border-2 transition-all flex justify-between items-center gap-4 ${requestStatus[emp._id] ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white'}`}>
                                  <div className="flex items-center gap-4 text-left">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                      <User size={24} />
                                    </div>
                                    <div>
                                      <h4 className="font-black text-secondary">{emp.fullName}</h4>
                                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">CODE: {emp.employeeId || 'N/A'}</p>
                                      <p className="text-xs text-primary font-black mt-0.5">{emp.block}, {emp.district}</p>
                                    </div>
                                  </div>
                                  <button type="button" onClick={() => handleConnect(emp._id)} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${requestStatus[emp._id] ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                    {requestStatus[emp._id] ? 'Selected' : 'Connect'}
                                  </button>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-12 bg-gray-50 rounded-3xl px-6">
                                <AlertCircle size={40} className="mx-auto text-gray-200 mb-4" />
                                <p className="text-gray-500 font-bold">{t("auth.register.form.noEmployees")}</p>
                                <button type="button" onClick={nextStep} className="text-primary font-black mt-4 underline">{t("auth.register.form.continueWithout")}</button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-gray-50 rounded-3xl px-6">
                            <CheckCircle size={48} className="mx-auto text-secondary mb-4 animate-bounce" />
                            <p className="text-gray-500 font-bold">{t("auth.register.form.yourArea")}</p>
                            <p className="text-xl md:text-2xl font-black text-primary mt-2">{formData.block}, {formData.district}</p>
                          </div>
                        )}
                      </>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button type="button" onClick={prevStep} className="btn-secondary w-full justify-center order-2 sm:order-1 py-4">{t("auth.register.form.back")}</button>
                      <button type="button" onClick={nextStep} className="btn-primary w-full justify-center order-1 sm:order-2 py-4">{t("auth.register.form.continue")}</button>
                    </div>
                  </motion.div>
                )}

                {step === 5 && formData.role === 'member' && (
                  <motion.div key="step5" {...fadeInUp} className="flex flex-col gap-6">
                    <div className="text-center mb-2">
                      <h3 className="text-xl md:text-2xl font-black text-secondary">{t("auth.register.form.chooseMembership")}</h3>
                      <p className="text-gray-400 text-sm mt-1">{t("auth.register.form.selectPlan")}</p>
                    </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <label className={`relative p-6 rounded-3xl border-2 cursor-pointer flex flex-col gap-3 transition-all text-left ${formData.membershipType === 'free' ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'}`}>
                            <input type="radio" name="membershipType" value="free" checked={formData.membershipType === 'free'} onChange={handleChange} className="sr-only" />
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-black uppercase tracking-widest">{t("auth.register.form.free")}</span>
                                <h4 className="font-black text-secondary text-lg mt-2">{t("auth.register.form.baseMember")}</h4>
                              </div>
                              <span className="text-xl font-black text-secondary">₹0</span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100/60">
                              <ul className="flex flex-col gap-2">
                                <li className="flex items-center gap-2 text-xs font-bold text-gray-500"><Check size={14} className="text-green-500" /> Basic Platform Access</li>
                                <li className="flex items-center gap-2 text-xs font-bold text-gray-500"><Check size={14} className="text-green-500" /> Community Events</li>
                                <li className="flex items-center gap-2 text-xs font-bold text-gray-300"><X size={14} className="text-gray-300" /> No Sanitary Pads Benefit</li>
                              </ul>
                            </div>
                          </label>

                          <label className={`relative p-6 rounded-3xl border-2 cursor-pointer flex flex-col gap-3 transition-all text-left ${formData.membershipType === 'paid' ? 'border-secondary bg-secondary/5 shadow-lg shadow-secondary/10' : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'}`}>
                            <input type="radio" name="membershipType" value="paid" checked={formData.membershipType === 'paid'} onChange={handleChange} className="sr-only" />
                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce">
                              <Sparkles size={14} />
                            </div>
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest">{t("auth.register.form.premium")}</span>
                                <h4 className="font-black text-secondary text-lg mt-2">{membershipConfig?.title || 'Paid Member'}</h4>
                              </div>
                              <span className="text-xl font-black text-primary">₹{membershipConfig?.feeAmount || 200}</span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100/60">
                              <ul className="flex flex-col gap-2">
                                <li className="flex items-center gap-2 text-xs font-bold text-gray-500"><Check size={14} className="text-green-500" /> Full Platform Access</li>
                                <li className="flex items-center gap-2 text-xs font-bold text-gray-500"><Check size={14} className="text-green-500" /> Premium ID Card</li>
                                <li className="flex items-start gap-2 text-xs font-black text-primary bg-primary/10 p-2 rounded-lg">
                                  <Sparkles size={14} className="shrink-0 mt-0.5" />
                                  <span>{membershipConfig?.benefitLabel || '1 Year Sanitary Pads Free'}</span>
                                </li>
                              </ul>
                            </div>
                          </label>
                        </div>
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                      <button type="button" onClick={prevStep} className="btn-secondary w-full justify-center order-2 sm:order-1 py-4">{t("auth.register.form.back")}</button>
                      <button type="button" onClick={nextStep} className="btn-primary w-full justify-center order-1 sm:order-2 py-4">{t("auth.register.form.continueSecurity")}</button>
                    </div>
                  </motion.div>
                )}

                {step === 6 && (
                  <motion.div key="step6" {...fadeInUp} className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                      <PasswordField
                        label="Password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="********"
                        required
                      />
                      <PasswordField
                        label="Confirm Password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="********"
                        required
                      />
                    </div>

                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{t("auth.register.form.passwordReq")}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { label: t('auth.register.form.char8'), check: formData.password.length >= 8 },
                          { label: t('auth.register.form.upper'), check: /[A-Z]/.test(formData.password) },
                          { label: t('auth.register.form.lower'), check: /[a-z]/.test(formData.password) },
                          { label: t('auth.register.form.number'), check: /[0-9]/.test(formData.password) },
                          { label: t('auth.register.form.special'), check: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) }
                        ].map((req, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.check ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                              <Check size={10} strokeWidth={4} />
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${req.check ? 'text-green-600' : 'text-gray-400'}`}>{req.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <input type="checkbox" id="terms" required className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary transition-all" />
                      <label htmlFor="terms" className="text-xs md:text-sm text-gray-500 leading-relaxed font-medium">{t("auth.register.form.agreeTerms")} <span className="text-secondary font-bold">terms and conditions</span> {t("auth.register.form.and")} <span className="text-secondary font-bold">privacy policy</span> of SakhiHub.</label>
                    </div>

                    {error && (
                      <div className="p-4 bg-red-50 text-red-500 text-xs md:text-sm rounded-2xl font-bold flex items-center gap-2 border border-red-100">
                        <AlertCircle size={16} /> {error}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                      <button type="button" onClick={prevStep} className="btn-secondary w-full justify-center order-2 sm:order-1 py-4">{t("auth.register.form.back")}</button>
                      <button type="submit" disabled={loading} className="btn-primary w-full justify-center order-1 sm:order-2 py-4 shadow-xl shadow-primary/20">
                        {loading ? "Registering..." : (formData.role === 'employee' ? "Register as Employee" : "Join Movement")} <Sparkles size={18} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
