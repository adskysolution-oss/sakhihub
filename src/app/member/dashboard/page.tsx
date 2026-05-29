'use client';

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";
import {
  User, Phone, MapPin, ShieldCheck, CreditCard,
  Clock, CheckCircle, AlertCircle, Download,
  MessageSquare, Users, Home, Calendar, Briefcase,
  ExternalLink, Sparkles, Heart, FileText, Bell,
  QrCode, Printer, Check, X, ArrowRight, ShieldAlert,
  ChevronRight, Sparkle
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from 'sonner';
import { useLanguage } from "@/context/LanguageContext";

export default function MemberDashboardPage() {
  const { t } = useLanguage();

  return (
    <Suspense fallback={
      <DashboardLayout>
        <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ color: '#666', fontWeight: '600' }}>{t('dashboardMember.loadingDashboard', 'Loading your Member Dashboard...')}</p>
        </div>
        <style jsx>{` @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } `}</style>
      </DashboardLayout>
    }>
      <MemberDashboardContent />
    </Suspense>
  );
}

function MemberDashboardContent() {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cashfree, setCashfree] = useState<any>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [payingOnline, setPayingOnline] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  // Load Cashfree SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => {
      setScriptLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Initialize Cashfree dynamically
  useEffect(() => {
    if (scriptLoaded && data && (window as any).Cashfree && !cashfree) {
      const mode = 'production';
      console.log('Initializing Cashfree for Member in mode:', mode);
      setCashfree((window as any).Cashfree({ mode }));
    }
  }, [scriptLoaded, data, cashfree]);

  // Handle Cashfree verification callback
  const handleVerifyCallback = async () => {
    const orderId = searchParams.get('order_id');
    if (orderId && !verifyingPayment) {
      setVerifyingPayment(true);
      try {
        await axios.post('/api/payment/verify', { orderId });
        router.replace('/member/dashboard');
        toast.success(t('dashboardMember.paymentVerified', "Payment verified successfully! Welcome to SakhiHub paid membership."));
      } catch (error) {
        console.error('Verification failed', error);
        toast.error(t('dashboardMember.paymentFailed', "Payment verification failed. Please contact admin if amount was deducted."));
      } finally {
        setVerifyingPayment(false);
        fetchData();
      }
    }
  };

  useEffect(() => {
    handleVerifyCallback();
  }, [searchParams]);

  const handleInitiateOnlinePayment = async () => {
    setPayingOnline(true);
    try {
      const res = await axios.post('/api/payment/create-order', { type: 'subscription' });
      if (res.data.success && res.data.data.paymentSessionId) {
        if (cashfree) {
          cashfree.checkout({
            paymentSessionId: res.data.data.paymentSessionId,
            redirectTarget: "_self"
          });
        } else {
          const mode = 'production';
          if ((window as any).Cashfree) {
            const cf = (window as any).Cashfree({ mode });
            setCashfree(cf);
            cf.checkout({
              paymentSessionId: res.data.data.paymentSessionId,
              redirectTarget: "_self"
            });
          } else {
            toast.error(t('dashboardMember.paymentLoading', 'Payment gateway is still loading. Please wait a moment.'));
            setPayingOnline(false);
          }
        }
      } else {
        toast.error(res.data.message || t('dashboardMember.paymentInitiationFailed', 'Failed to initiate payment'));
        setPayingOnline(false);
      }
    } catch (error: any) {
      console.error('Payment initiation failed:', error);
      toast.error(error.response?.data?.message || t('dashboardMember.paymentInitiationFailed', 'Failed to initiate payment'));
      setPayingOnline(false);
    }
  };

  // Campaign participation states
  const [campaigns, setCampaigns] = useState<{ assigned: any[]; requested: any[]; available: any[] }>({
    assigned: [],
    requested: [],
    available: []
  });
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [joiningCampaignId, setJoiningCampaignId] = useState<string>("");

  // Modals & triggers
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileMobile, setProfileMobile] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profileVillage, setProfileVillage] = useState("");
  const [profileBlock, setProfileBlock] = useState("");
  const [profileDistrict, setProfileDistrict] = useState("");
  const [profilePincode, setProfilePincode] = useState("");
  const [profileOccupation, setProfileOccupation] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  const [nearbyEmployees, setNearbyEmployees] = useState<any[]>([]);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string>("");

  // Manual direct connection states
  const [manualCode, setManualCode] = useState("");
  const [manualSearching, setManualSearching] = useState(false);
  const [manualError, setManualError] = useState("");

  const handleManualConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    setManualSearching(true);
    setManualError("");
    try {
      const resLookup = await axios.get(`/api/employees/nearby?employeeCode=${manualCode.trim()}`);
      if (resLookup.data.success && resLookup.data.data.length > 0) {
        const emp = resLookup.data.data[0];
        const resConnect = await axios.post('/api/member/request', {
          employeeId: emp._id,
          pincode: emp.pincode || data?.fieldRecord?.pincode || "000000"
        });
        if (resConnect.data.success) {
          toast.success(t('dashboardMember.connectionSent', `Successfully sent connection request to {{name}}!`, { name: emp.fullName }));
          setManualCode("");
          await fetchData();
        }
      } else {
        setManualError(t('dashboardMember.employeeNotFound', "Employee Code not found or not active. Please check the code."));
      }
    } catch (err: any) {
      console.error(err);
      setManualError(err.response?.data?.message || t('dashboardMember.manualConnectionFailed', "Failed to send manual connection request."));
    } finally {
      setManualSearching(false);
    }
  };

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/member/dashboard');
      if (res.data.success) {
        const dashboardData = res.data.data;
        setData(dashboardData);
        
        // Pre-fill profile editing fields
        if (dashboardData.profile) {
          setProfileMobile(dashboardData.profile.mobile || "");
          setProfileAddress(dashboardData.profile.address || "");
        }
        if (dashboardData.fieldRecord) {
          setProfileVillage(dashboardData.fieldRecord.village || "");
          setProfileBlock(dashboardData.fieldRecord.block || "");
          setProfileDistrict(dashboardData.fieldRecord.district || "");
          setProfilePincode(dashboardData.fieldRecord.pincode || "");
          setProfileOccupation(dashboardData.fieldRecord.occupation || "");
        }

        if (dashboardData.fieldRecord?.pincode) {
          fetchNearbyEmployees(dashboardData.fieldRecord.pincode);
        }
      }
    } catch (err: any) {
      setError(t('dashboardMember.dashboardLoadFailed', "Failed to load dashboard data"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    setCampaignLoading(true);
    try {
      const res = await axios.get('/api/member/campaigns');
      if (res.data.success) {
        setCampaigns(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load campaigns", err);
    } finally {
      setCampaignLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Load campaigns only when assigned hierarchy exists
  useEffect(() => {
    if (data?.fieldRecord?.assignedEmployeeId || data?.profile?.parentVendorId) {
      fetchCampaigns();
    }
  }, [data]);

  const fetchNearbyEmployees = async (pincode: string) => {
    setDiscoveryLoading(true);
    try {
      const res = await fetch(`/api/employees/nearby?pincode=${pincode}`);
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
    setRequestStatus(employeeId);
    try {
      const res = await axios.post('/api/member/request', {
        employeeId,
        pincode: data.fieldRecord.pincode
      });
      if (res.data.success) {
        await fetchData();
      }
    } catch (err) {
      console.error("Connect failed", err);
    } finally {
      setRequestStatus("");
    }
  };

  const handleResponseRequest = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await axios.patch('/api/member/request', { id, status });
      if (res.data.success) {
        await fetchData();
      }
    } catch (err) {
      console.error("Response failed", err);
    }
  };

  const handleJoinCampaign = async (campaignId: string) => {
    setJoiningCampaignId(campaignId);
    try {
      const res = await axios.post('/api/member/campaigns', { campaignId });
      if (res.data.success) {
        toast.success(t('dashboardMember.joinCampaignSuccess', "Your request to join the campaign was submitted successfully!"));
        await fetchCampaigns();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || t('dashboardMember.joinCampaignFailed', "Failed to join campaign"));
    } finally {
      setJoiningCampaignId("");
    }
  };

  const handleSubmitSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupportLoading(true);
    try {
      const res = await axios.post('/api/public/support', {
        name: data?.profile?.fullName || "Member",
        email: data?.profile?.email || "member@sakhihub.com",
        subject: supportSubject,
        message: supportMessage,
        userRole: "member",
        submittedBy: data?.profile?._id
      });
      if (res.data.success) {
        setSupportSuccess(true);
        setSupportSubject("");
        setSupportMessage("");
        setTimeout(() => {
          setSupportSuccess(false);
          setShowSupportModal(false);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      toast.error(t('dashboardMember.supportFailed', "Failed to submit support ticket."));
    } finally {
      setSupportLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await axios.patch('/api/member/profile', {
        mobile: profileMobile,
        address: profileAddress,
        village: profileVillage,
        block: profileBlock,
        district: profileDistrict,
        pincode: profilePincode,
        occupation: profileOccupation
      });
      if (res.data.success) {
        toast.success(t('dashboardMember.profileUpdated', "Your profile has been updated successfully!"));
        setShowProfileModal(false);
        await fetchData();
      }
    } catch (err) {
      console.error(err);
      toast.error(t('dashboardMember.profileUpdateFailed', "Failed to update profile details."));
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePrintCard = () => {
    window.print();
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ color: '#666', fontWeight: '600' }}>{t('dashboardMember.loadingDashboard', 'Loading your Member Dashboard...')}</p>
        </div>
        <style jsx>{` @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } `}</style>
      </DashboardLayout>
    );
  }

  const { profile, fieldRecord, membership, pendingRequests, membershipFee = 100 } = data || {};
  
  const isFreeMember = profile?.membershipType === 'free';
  const isPaidVerified = profile?.membershipType === 'paid' && (profile?.accessStatus === 'unlocked' || membership?.paymentStatus === 'Paid' || fieldRecord?.membershipStatus === 'paid');
  const isPaidPending = profile?.membershipType === 'paid' && !isPaidVerified;
  const isPremiumLocked = !isPaidVerified;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto flex flex-col gap-8 p-3 sm:p-6 lg:p-10 print:p-0">

        {/* PRINT TARGET: Digital ID Card container */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #printable-membership-card, #printable-membership-card * {
              visibility: visible !important;
            }
            #printable-membership-card {
              position: fixed !important;
              left: 50% !important;
              top: 50% !important;
              transform: translate(-50%, -50%) scale(1.5) !important;
              width: 350px !important;
              height: 500px !important;
              box-shadow: none !important;
              border: 2px solid #ccc !important;
              border-radius: 24px !important;
              z-index: 99999 !important;
            }
            .print-hide {
              display: none !important;
            }
          }
        `}</style>

        {/* Connection Requests from Employees */}
        {pendingRequests?.length > 0 && pendingRequests.some((r: any) => r.requestedBy === 'employee') && (
          <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 md:p-10 bg-gradient-to-br from-primary to-secondary rounded-[35px] text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl shadow-primary/30 print-hide"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center shrink-0">
                <Users size={32} />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold leading-tight">{t('dashboardMember.connectionRequestTitle', 'Connection Request Received')}</h2>
                <p className="mt-2 opacity-90 text-sm md:text-base">
                  {t('dashboardMember.connectionRequestDesc', 'A SakhiHub Hero ({{name}}) wants to connect with you.', { name: pendingRequests.find((r: any) => r.requestedBy === 'employee').employeeId?.fullName })}
                </p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={() => handleResponseRequest(pendingRequests.find((r: any) => r.requestedBy === 'employee')._id, 'rejected')}
                className="flex-1 md:flex-none py-4 px-6 rounded-2xl bg-white/10 hover:bg-white/20 font-semibold transition-all"
              >
                {t('dashboardMember.rejectBtn', 'Reject')}
              </button>
              <button
                onClick={() => handleResponseRequest(pendingRequests.find((r: any) => r.requestedBy === 'employee')._id, 'approved')}
                className="flex-1 md:flex-none py-4 px-8 rounded-2xl bg-white text-primary font-bold shadow-xl shadow-black/10 hover:scale-105 transition-all"
              >
                {t('dashboardMember.approveConnectBtn', 'Approve & Connect')}
              </button>
            </div>
          </motion.section>
        )}

        {/* Header / Welcome Section */}
        <section className="relative p-6 sm:p-10 lg:p-14 bg-gradient-to-br from-primary to-secondary-dark rounded-[30px] md:rounded-[40px] text-white overflow-hidden shadow-2xl shadow-primary/20 print-hide">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase">
                {t('dashboardMember.portalTag', 'MEMBER PORTAL')}
              </span>
              {isFreeMember ? (
                <span className="flex items-center gap-2 px-4 py-1.5 bg-blue-400/20 backdrop-blur-md rounded-full text-[10px] md:text-xs font-bold text-blue-300">
                  <User size={14} /> {t('dashboardMember.freeMemberTag', 'FREE MEMBER')}
                </span>
              ) : isPaidVerified ? (
                <span className="flex items-center gap-2 px-4 py-1.5 bg-green-400/20 backdrop-blur-md rounded-full text-[10px] md:text-xs font-bold text-green-300">
                  <ShieldCheck size={14} /> {t('dashboardMember.premiumMemberTag', 'PREMIUM MEMBER')}
                </span>
              ) : (
                <span className="flex items-center gap-2 px-4 py-1.5 bg-amber-400/20 backdrop-blur-md rounded-full text-[10px] md:text-xs font-bold text-amber-300">
                  <Clock size={14} /> {t('dashboardMember.pendingPaymentTag', 'PENDING PAYMENT')}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black mb-4 leading-tight">
              {t('dashboardMember.welcomeBack', 'Welcome Back,')} <br className="sm:hidden" /> {profile?.fullName.split(' ')[0]}! <Sparkles className="inline ml-2 text-amber-300" />
            </h1>
            <p className="text-sm md:text-lg opacity-85 max-w-2xl leading-relaxed">
              {t('dashboardMember.welcomeDesc', "We're glad to have you in the SakhiHub community. Manage your membership, print your card, view your group, and join campaigns.")}
            </p>
          </div>
          <Heart className="absolute -right-20 -bottom-20 w-80 h-80 opacity-10 text-white transform -rotate-12" />
        </section>

        {/* Summary Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 print-hide">
          
          <div className="p-6 bg-white rounded-[32px] border border-gray-100 flex items-center gap-5 shadow-soft hover:border-primary/30 transition-all group">
            <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
              <CreditCard size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">{t('dashboardMember.statusLabel', 'Membership Status')}</p>
              <h3 className={`text-lg font-black mt-0.5 truncate ${isPaidVerified ? 'text-green-600' : isFreeMember ? 'text-blue-600' : 'text-amber-600'}`}>
                {isPaidVerified ? t('dashboardMember.statusActivePremium', 'Active (Premium)') : isFreeMember ? t('dashboardMember.statusActiveFree', 'Active (Free)') : t('dashboardMember.statusPending', 'Pending Payment')}
              </h3>
            </div>
          </div>

          <div className="p-6 bg-white rounded-[32px] border border-gray-100 flex items-center gap-5 shadow-soft hover:border-primary/30 transition-all group">
            <div className="w-14 h-14 bg-secondary/5 rounded-2xl flex items-center justify-center text-secondary group-hover:scale-110 transition-transform shrink-0">
              <Users size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">{t('dashboardMember.groupLabel', 'Your Community Group')}</p>
              <h3 className="text-lg font-black text-secondary mt-0.5 truncate">
                {fieldRecord?.groupId?.groupName || t('dashboardMember.notAssigned', 'Not Assigned')}
              </h3>
            </div>
          </div>

          <div className="p-6 bg-white rounded-[32px] border border-gray-100 flex items-center gap-5 shadow-soft hover:border-primary/30 transition-all group">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform shrink-0">
              <MapPin size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">{t('dashboardMember.villageLabel', 'Regional Village')}</p>
              <h3 className="text-lg font-black text-secondary mt-0.5 truncate">
                {fieldRecord?.village || profile?.area || t('dashboardMember.globalMember', 'Global Member')}
              </h3>
            </div>
          </div>

        </section>

        {/* Connection Discovery (if unassigned) */}
        {fieldRecord?.connectionStatus === 'unassigned' && (
          <section className="p-6 sm:p-10 bg-primary/5 rounded-[40px] border-2 border-dashed border-primary/30 text-center print-hide">
            <Users size={50} className="mx-auto text-primary mb-6 animate-pulse" />
            <h2 className="text-2xl font-black text-secondary leading-tight">{t('dashboardMember.connectLocalTitle', 'Connect with Local Sakhi')}</h2>
            <p className="text-gray-500 mt-3 mb-10 max-w-lg mx-auto leading-relaxed">{t('dashboardMember.connectLocalDesc', 'Find and connect with an active field employee in your area to get your membership verified and join a community group.')}</p>
            <div className="grid gap-4 max-w-2xl mx-auto">
              {discoveryLoading ? (
                <div className="py-10 flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-gray-100 border-t-primary rounded-full animate-spin"></div>
                  <p className="text-gray-400 font-bold">{t('dashboardMember.searchingHeroes', 'Searching nearby Heroes...')}</p>
                </div>
              ) : nearbyEmployees.length > 0 ? (
                nearbyEmployees.map((emp) => (
                  <div key={emp._id} className="p-4 sm:p-5 bg-white rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-gray-100 shadow-sm hover:shadow-md transition-all text-left">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-primary font-black text-xl shrink-0">
                        {emp.fullName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-secondary leading-tight">{emp.fullName}</h4>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{emp.area || t('dashboardMember.field', 'Field')}, {emp.block || t('dashboardMember.local', 'Local')}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleConnect(emp._id)}
                      disabled={requestStatus === emp._id}
                      className="btn-primary w-full sm:w-auto py-3 px-8 text-xs font-black uppercase tracking-wider"
                    >
                      {requestStatus === emp._id ? t('dashboardMember.connecting', 'Connecting...') : t('dashboardMember.connect', 'Connect')}
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-12 bg-white/50 rounded-3xl border border-gray-100 px-6">
                  <AlertCircle size={40} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-400 font-bold italic">
                    {t('dashboardMember.noEmployeesFound', 'No active employees found in your pincode ({{pincode}}) yet.', { pincode: fieldRecord?.pincode || 'N/A' })}
                  </p>
                </div>
              )}
            </div>

            {/* Manual Connection Input Form */}
            <div className="mt-12 pt-8 border-t border-gray-200/50 max-w-xl mx-auto text-left">
              <h4 className="text-sm font-black text-secondary flex items-center gap-2 mb-2">
                <Sparkle size={16} className="text-primary animate-pulse" /> {t('dashboardMember.manualConnectTitle', 'Connect Manually by Employee Code')}
              </h4>
              <p className="text-xs text-gray-400 font-bold mb-4 uppercase tracking-wider leading-relaxed">
                {t('dashboardMember.manualConnectDesc', "If you already know your regional Sakhi Hero's code (e.g. SHEMP001), enter it below to send a direct request.")}
              </p>
              <form onSubmit={handleManualConnect} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder={t('dashboardMember.manualPlaceholder', 'Enter Hero Code (e.g. SHEMP001)...')}
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 px-5 py-3.5 bg-white border border-gray-200 focus:border-primary/50 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/10 shadow-sm"
                />
                <button
                  type="submit"
                  disabled={manualSearching || !manualCode.trim()}
                  className="py-3.5 px-8 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer disabled:opacity-50 disabled:hover:scale-100"
                >
                  {manualSearching ? t('dashboardMember.searchingBtn', 'Searching...') : t('dashboardMember.sendRequestBtn', 'Send Request')}
                </button>
              </form>
              {manualError && (
                <p className="text-red-500 text-xs font-bold mt-2 animate-pulse">{manualError}</p>
              )}
            </div>

          </section>
        )}

        {fieldRecord?.connectionStatus === 'pending_request' && (
          <section className="p-8 bg-amber-50 rounded-[40px] border border-amber-100 flex items-center gap-6 print-hide">
            <div className="w-16 h-16 bg-amber-100 rounded-3xl flex items-center justify-center text-amber-600 shrink-0 animate-pulse">
              <Clock size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-amber-900 leading-tight">{t('dashboardMember.pendingRequestTitle', 'Connection Request Pending')}</h2>
              <p className="text-amber-700/80 mt-2 text-sm leading-relaxed">{t('dashboardMember.pendingRequestDesc', 'Your request to connect with our local field employee is awaiting approval. You will be notified once they accept.')}</p>
            </div>
          </section>
        )}

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
          
          {/* LEFT COLUMN: Main Features */}
          <div className="lg:col-span-8 space-y-8 print:block">

            {/* DIGITAL MEMBERSHIP CARD SECTION */}
            <section className="bg-white p-6 sm:p-10 rounded-[35px] border border-gray-100 shadow-soft flex flex-col lg:flex-row gap-8 items-stretch print:block print:border-none print:shadow-none">
              
              {/* Printable target */}
              <div 
                id="printable-membership-card" 
                className="w-full max-w-[320px] mx-auto lg:mx-0 h-[220px] bg-gradient-to-br from-slate-900 via-secondary-dark to-primary-dark p-4 rounded-[20px] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group shrink-0 print:border print:m-0"
              >
                <div className="absolute top-[-30px] right-[-30px] w-40 h-40 bg-primary/20 rounded-full blur-2xl"></div>
                <div className="absolute bottom-[-40px] left-[-40px] w-48 h-48 bg-secondary/10 rounded-full blur-2xl"></div>
                
                {/* Card Header */}
                <div className="flex justify-between items-center relative z-10">
                  <div>
                    <h4 className="text-[10px] font-black tracking-widest text-primary">SAKHIHUB</h4>
                    <p className="text-[6px] text-white/60 font-black tracking-widest uppercase">{t('dashboardMember.idCardSubTitle', 'Self Help Group Member')}</p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-primary backdrop-blur-md">
                    <Sparkle size={10} className="animate-spin-slow" />
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex gap-4 items-center relative z-10">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-xl font-black text-white border border-white/20 backdrop-blur-sm shrink-0 shadow-lg">
                    {profile?.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-tight leading-tight">{profile?.fullName}</h3>
                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{fieldRecord?.village || t('dashboardMember.globalMember', 'Global Member')}</p>
                    <p className="text-[7px] text-primary font-black uppercase tracking-wider mt-0.5">{fieldRecord?.groupId?.groupName || t('dashboardMember.communityPool', 'Community Pool')}</p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex justify-between items-center border-t border-white/10 pt-2 relative z-10">
                  <div className="text-left">
                    <p className="text-[5px] text-white/40 font-bold uppercase tracking-widest">{t('dashboardMember.membershipId', 'Membership ID')}</p>
                    <p className="text-[9px] font-mono font-black text-primary tracking-wider mt-0.5">
                      {membership?.membershipId || 'SH-MEM-PENDING'}
                    </p>
                  </div>
                  <QrCode size={28} className="text-white/80" />
                </div>
              </div>

              {/* ID Card Actions */}
              <div className="flex-1 flex flex-col justify-between py-2 print-hide text-left">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 mb-3">
                    {t('dashboardMember.verifiedDigitalTag', 'Verified Digital ID')}
                  </span>
                  <h3 className="text-2xl font-black text-secondary flex items-center gap-2">
                    <ShieldCheck size={24} className="text-primary animate-pulse" /> {t('dashboardMember.digitalIdTitle', 'Digital Membership ID Card')}
                  </h3>
                  <p className="text-gray-500 text-xs font-semibold leading-relaxed mt-3">
                    {t('dashboardMember.digitalIdDesc', 'This is your verified digital ID card in the SakhiHub Community. Keep this copy saved or print it for offline self-help group verifications, campaigns, and kit distribution meetings.')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 mt-8">
                  <button
                    onClick={() => {
                      if (!isPremiumLocked) {
                        window.print();
                      }
                    }}
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer min-w-[140px] ${isPremiumLocked ? 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-80' : 'bg-gradient-to-r from-primary to-secondary text-white shadow-xl shadow-primary/25 hover:scale-105'}`}
                  >
                    {isPremiumLocked ? <ShieldAlert size={16} /> : <Printer size={16} />} 
                    {isPremiumLocked ? t('dashboardMember.lockedPremium', 'Locked (Premium)') : t('dashboardMember.printCard', 'Print Card')}
                  </button>
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-secondary hover:text-primary hover:border-primary/30 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all cursor-pointer min-w-[140px]"
                  >
                    <User size={16} /> {t('dashboardMember.editCardInfo', 'Edit Card Info')}
                  </button>
                </div>
              </div>

            </section>

            {/* MY COMMUNITY / GROUP UNIT SECTION */}
            <section className="p-6 sm:p-10 bg-white rounded-[35px] border border-gray-100 shadow-soft print-hide">
              <h2 className="text-2xl font-black text-secondary mb-8 flex items-center gap-3">
                <Users size={26} className="text-primary" /> My Community Group
              </h2>

              {fieldRecord?.groupId ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  <div className="p-6 bg-[#f8f9fa] rounded-3xl border border-transparent hover:border-gray-200 transition-all">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Group Name</p>
                    <h4 className="text-lg font-black text-secondary">{fieldRecord.groupId.groupName}</h4>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 mt-3">
                      Active Community Unit
                    </span>
                  </div>

                  <div className="p-6 bg-[#f8f9fa] rounded-3xl border border-transparent hover:border-gray-200 transition-all">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Regional Coordinates</p>
                    <h4 className="text-base font-bold text-secondary">{fieldRecord.groupId.village || 'N/A'}, {fieldRecord.groupId.district || 'N/A'}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Block: {fieldRecord?.block || 'Local Area'}</p>
                  </div>

                  <div className="sm:col-span-2 p-6 bg-pink-50/50 rounded-3xl border border-pink-100 flex gap-4 items-start">
                    <Calendar size={22} className="text-primary shrink-0 mt-0.5 animate-bounce" />
                    <div>
                      <h4 className="text-xs font-black text-secondary uppercase tracking-widest">Next Group Meeting</h4>
                      <p className="text-xs text-gray-500 font-semibold leading-relaxed mt-1">
                        Meetings are held on the first Sunday of every month. Check with your assigned Sakhi Hero (<span className="font-bold underline">{fieldRecord.assignedEmployeeId?.fullName || 'Hero'}</span>) for details.
                      </p>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="p-8 text-center bg-gray-50 rounded-3xl border border-gray-100">
                  <AlertCircle size={36} className="mx-auto text-gray-300 mb-3" />
                  <h4 className="text-base font-bold text-secondary">No Community Group Assigned</h4>
                  <p className="text-gray-400 text-xs font-semibold leading-relaxed max-w-sm mx-auto mt-1">
                    Once you connect with a nearby Sakhi Hero (Employee), you will be assigned to a local group.
                  </p>
                </div>
              )}
            </section>

            {/* VERIFIED DIGITAL RECEIPT SECTION */}
            <section className="p-6 sm:p-10 bg-white rounded-[35px] border border-gray-100 shadow-soft print-hide">
              <h2 className="text-2xl font-black text-secondary mb-8 flex items-center gap-3">
                <CreditCard size={26} className="text-primary" /> Membership Payments History
              </h2>

              {membership ? (
                <div className="p-8 bg-[#f8f9fa] rounded-3xl border border-gray-100 relative">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Receipt Number</p>
                      <h4 className="text-xl font-black text-secondary mt-1">{membership.receiptNumber}</h4>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Paid Amount</p>
                      <h4 className="text-xl font-black text-primary mt-1">₹{membership.amount}.00</h4>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                      <CheckCircle size={20} className="animate-bounce" /> Verified Digital Payment Confirmation
                    </div>
                    <Link href={`/member/receipt/${membership._id}`} target="_blank" className="w-full sm:w-auto">
                      <button className="btn-primary w-full py-3.5 px-8 shadow-lg shadow-primary/20">
                        <FileText size={16} /> View Digital Receipt
                      </button>
                    </Link>
                  </div>
                </div>
              ) : isFreeMember ? (
                <div className="p-8 sm:p-12 text-center bg-gradient-to-br from-blue-50/50 via-white to-blue-100/30 rounded-3xl border border-blue-100 shadow-sm">
                  <div className="w-16 h-16 bg-blue-100/80 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6">
                    <ShieldCheck size={32} />
                  </div>
                  <h3 className="text-xl font-black text-secondary leading-tight">Free Membership Active</h3>
                  <p className="text-gray-500 text-xs font-semibold max-w-md mx-auto leading-relaxed mt-3 mb-8">
                    You are currently on the basic free tier. Upgrade to Premium to unlock dynamic digital ID cards, learning manuals, and campaign kit benefits!
                  </p>
                  <button onClick={() => { toast.info("Premium upgrade feature coming soon!") }} className="btn-primary py-3.5 px-8 shadow-lg shadow-primary/20 mx-auto w-auto min-w-[200px] justify-center text-center">
                    Upgrade to Premium
                  </button>
                </div>
              ) : (
                <div className="p-8 sm:p-12 text-center bg-gradient-to-br from-pink-50/50 via-white to-primary/5 rounded-3xl border border-pink-100 shadow-sm">
                  <div className="w-16 h-16 bg-pink-100/80 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6 animate-pulse">
                    <ShieldAlert size={32} />
                  </div>
                  <h3 className="text-xl font-black text-secondary leading-tight">Membership Payment Pending</h3>
                  <p className="text-gray-500 text-xs font-semibold max-w-md mx-auto leading-relaxed mt-3 mb-10">
                    To activate your dynamic digital membership card, join local community groups, and qualify for campaign kits, please complete your ₹{membershipFee} membership fee.
                  </p>
                  
                  {verifyingPayment ? (
                    <div className="py-6 flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">Verifying online transaction...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                      {/* Option 1: Pay Online */}
                      <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-soft flex flex-col justify-between text-left">
                        <div>
                          <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-100">
                            Recommended
                          </span>
                          <h4 className="text-sm font-black text-secondary mt-3">Pay Online Instantly</h4>
                          <p className="text-[11px] text-gray-400 font-bold leading-relaxed mt-2">
                            Secure payment via Cashfree. Your receipt and dynamic ID card will be activated instantly.
                          </p>
                        </div>
                        <button
                          onClick={handleInitiateOnlinePayment}
                          disabled={payingOnline}
                          className="mt-6 w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                          {payingOnline ? 'Initiating...' : `Pay ₹${membershipFee} Online`}
                        </button>
                      </div>
 
                      {/* Option 2: Pay Offline */}
                      <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-soft flex flex-col justify-between text-left">
                        <div>
                          <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-100">
                            Offline Mode
                          </span>
                          <h4 className="text-sm font-black text-secondary mt-3">Pay Cash to Sakhi Hero</h4>
                          <p className="text-[11px] text-gray-400 font-bold leading-relaxed mt-2">
                            Hand over ₹{membershipFee} to your regional hero/employee. They will register it on their portal to activate your account.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const heroSec = document.getElementById("hero-details-section");
                            if (heroSec) {
                              heroSec.scrollIntoView({ behavior: 'smooth' });
                            } else {
                              toast.error("Please contact your local employee. You can find their number in the sidebar.");
                            }
                          }}
                          className="mt-6 w-full py-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-secondary hover:text-primary rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                        >
                          Contact Sakhi Hero
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

          </div>

          {/* RIGHT COLUMN: Sidebar (Help, Notifications, Sakhi Hero) */}
          <aside className="lg:col-span-4 space-y-8 print-hide">

            {/* SAKHI HERO / EMPLOYEE DETAILS PANEL */}
            {fieldRecord?.assignedEmployeeId && (
              <section id="hero-details-section" className="p-6 bg-emerald-50 rounded-[35px] border border-emerald-100 shadow-soft">
                <h3 className="text-sm font-black text-emerald-950 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-600" /> Your Sakhi Hero
                </h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-emerald-600 text-xl shadow-sm">
                    {fieldRecord.assignedEmployeeId.fullName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-emerald-950 text-sm leading-tight">{fieldRecord.assignedEmployeeId.fullName}</h4>
                    <p className="text-[10px] text-emerald-700/80 font-bold uppercase tracking-widest mt-1">Employee ID: {fieldRecord.assignedEmployeeId.employeeId}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <a 
                    href={`tel:${fieldRecord.assignedEmployeeId.mobile}`} 
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest text-center shadow-lg shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Phone size={14} /> Call Hero
                  </a>
                  <a 
                    href={`https://wa.me/${fieldRecord.assignedEmployeeId.mobile}`} 
                    target="_blank"
                    className="flex-1 py-3 bg-white border border-emerald-200 hover:border-emerald-500 text-emerald-950 rounded-2xl text-[9px] font-black uppercase tracking-widest text-center active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare size={14} /> WhatsApp
                  </a>
                </div>
              </section>
            )}

            {/* QUICK ACTIONS PANEL */}
            <section className="p-8 bg-white rounded-[35px] border border-gray-100 shadow-soft">
              <h3 className="text-base font-black text-secondary mb-6">Quick Tools</h3>
              <div className="grid gap-3">
                {[
                  { label: 'Submit Help Request', icon: <MessageSquare size={20} />, color: '#E91E63', onClick: () => setShowSupportModal(true) },
                  { label: 'Edit Member Details', icon: <User size={20} />, color: '#6A1B9A', onClick: () => setShowProfileModal(true) },
                  { label: 'View Digital ID Card', icon: <CreditCard size={20} />, color: '#F59E0B', onClick: () => {
                    const target = document.getElementById("printable-membership-card");
                    target?.scrollIntoView({ behavior: 'smooth' });
                  }},
                  { label: 'Download Learning Manuals', icon: isPremiumLocked ? <ShieldAlert size={20} /> : <Download size={20} />, color: isPremiumLocked ? '#9ca3af' : '#6366f1', onClick: () => {
                    if (isPremiumLocked) {
                      toast.error("Premium Feature: Please upgrade or verify your membership to access learning manuals.");
                      return;
                    }
                    window.location.href = '/member/resources';
                  }}
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={action.onClick}
                    className="flex items-center gap-4 p-4 w-full bg-[#f8f9fa] hover:bg-white border border-transparent hover:border-gray-200 rounded-2xl text-secondary font-bold text-xs transition-all text-left shadow-sm"
                  >
                    <span className="shrink-0 animate-pulse" style={{ color: action.color }}>{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            </section>

            {/* REAL-TIME NOTIFICATIONS PANEL */}
            <section className="p-8 bg-slate-900 rounded-[35px] text-white shadow-2xl relative overflow-hidden">
              <h3 className="text-base font-black mb-6 flex items-center gap-2">
                <Bell size={20} className="text-primary animate-bounce" /> Platform Updates
              </h3>
              <div className="flex flex-col gap-6">
                {[
                  { title: 'Support Form Verified', desc: 'Support Ticket system is now active. Submit questions to platform moderators.', time: 'Just now' },
                  { title: 'Payment Verification Mode', desc: 'Recruiter Hero verifies registration payments instantly. Receipts update inside profile.', time: '2 hours ago' },
                  { title: 'Campaign Joining Active', desc: 'Active awareness and Kit distributions are now open for enrollment.', time: '1 day ago' }
                ].map((notif, i) => (
                  <div key={i} className="relative pl-5 border-l border-primary/30">
                    <div className="absolute left-[-3.5px] top-1.5 w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <h4 className="text-xs font-black text-white leading-tight">{notif.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-1 leading-relaxed font-bold">{notif.desc}</p>
                    <p className="text-[8px] text-primary font-black uppercase tracking-wider mt-2">{notif.time}</p>
                  </div>
                ))}
              </div>
            </section>

          </aside>

        </div>

      </div>

      {/* SUPPORT TICKET FORM MODAL */}
      <AnimatePresence>
        {showSupportModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print-hide">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[35px] p-6 sm:p-8 w-full max-w-lg border border-gray-100 shadow-2xl relative"
            >
              <button
                onClick={() => setShowSupportModal(false)}
                className="absolute right-6 top-6 p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-secondary transition-all"
              >
                <X size={18} />
              </button>

              <h3 className="text-xl font-black text-secondary flex items-center gap-2 mb-2">
                <MessageSquare size={22} className="text-primary" /> Submit a Help Ticket
              </h3>
              <p className="text-gray-400 text-xs font-semibold leading-relaxed mb-6">Our dedicated support managers and local administrators are available to help you.</p>

              {supportSuccess ? (
                <div className="py-8 text-center text-green-600 font-bold flex flex-col items-center gap-2">
                  <CheckCircle size={40} className="animate-bounce" />
                  <span>Ticket Submitted Successfully! Redirecting...</span>
                </div>
              ) : (
                <form onSubmit={handleSubmitSupport} className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="What do you need help with?"
                      value={supportSubject}
                      onChange={(e) => setSupportSubject(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f8f9fa] border-none text-secondary rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Detailed Message</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Write your issue details here..."
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f8f9fa] border-none text-secondary rounded-xl text-xs font-semibold focus:outline-none resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={supportLoading}
                    className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center shadow-lg"
                  >
                    {supportLoading ? 'Submitting...' : 'Submit Support Request'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT PROFILE DETAILS MODAL */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print-hide">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[35px] p-6 sm:p-8 w-full max-w-lg border border-gray-100 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute right-6 top-6 p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-secondary transition-all"
              >
                <X size={18} />
              </button>

              <h3 className="text-xl font-black text-secondary flex items-center gap-2 mb-2">
                <User size={22} className="text-primary" /> Edit Profile Details
              </h3>
              <p className="text-gray-400 text-xs font-semibold leading-relaxed mb-6">Modify details to sync on your digital membership card.</p>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Mobile Number</label>
                    <input
                      type="text"
                      required
                      value={profileMobile}
                      onChange={(e) => setProfileMobile(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f8f9fa] border-none text-secondary rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Occupation</label>
                    <input
                      type="text"
                      value={profileOccupation}
                      onChange={(e) => setProfileOccupation(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f8f9fa] border-none text-secondary rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Village</label>
                    <input
                      type="text"
                      value={profileVillage}
                      onChange={(e) => setProfileVillage(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f8f9fa] border-none text-secondary rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Block</label>
                    <input
                      type="text"
                      value={profileBlock}
                      onChange={(e) => setProfileBlock(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f8f9fa] border-none text-secondary rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">District</label>
                    <input
                      type="text"
                      value={profileDistrict}
                      onChange={(e) => setProfileDistrict(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f8f9fa] border-none text-secondary rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Pincode</label>
                    <input
                      type="text"
                      value={profilePincode}
                      onChange={(e) => setProfilePincode(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f8f9fa] border-none text-secondary rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Detailed Address</label>
                  <input
                    type="text"
                    value={profileAddress}
                    onChange={(e) => setProfileAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f8f9fa] border-none text-secondary rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="w-full py-4 bg-secondary hover:bg-secondary-dark text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center shadow-lg"
                >
                  {profileLoading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
}
