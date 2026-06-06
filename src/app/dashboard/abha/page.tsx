'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import AbhaCardView from '@/components/shared/AbhaCardView';
import { 
  Heart, ShieldAlert, CheckCircle, FileText, 
  ArrowLeft, Key, Fingerprint, Loader2, Printer, 
  AlertCircle, ChevronRight, Lock, Phone
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

export default function UserAbhaPage() {
  const [loading, setLoading] = useState(true);
  const [abhaDetails, setAbhaDetails] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'link' | 'create'>('link');
  const router = useRouter();

  // Link Flow States (Option A)
  const [linkInput, setLinkInput] = useState('');
  const [linkTxnId, setLinkTxnId] = useState('');
  const [linkOtp, setLinkOtp] = useState('');
  const [linkingLoading, setLinkingLoading] = useState(false);

  // Creation Flow States (Option B)
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [createTxnId, setCreateTxnId] = useState('');
  const [createOtp, setCreateOtp] = useState('');
  const [aadhaarMobileInput, setAadhaarMobileInput] = useState('');
  const [creationLoading, setCreationLoading] = useState(false);

  // Load existing ABHA Card details on mount
  const fetchAbhaDetails = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/user/abha');
      if (res.data.success) {
        if (res.data.data.hasAbha) {
          setAbhaDetails(res.data.data.abhaCard);
        }
        if (res.data.data.userMobile) {
          setAadhaarMobileInput(res.data.data.userMobile);
        }
      }
    } catch (err: any) {
      console.error('Failed to load ABHA details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbhaDetails();
  }, []);

  // Option A: Initialize Link verification
  const handleLinkInit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkInput.trim()) {
      toast.error('Please enter your ABHA number or address.');
      return;
    }

    setLinkingLoading(true);
    try {
      const res = await axios.post('/api/user/abha/link/init', { healthId: linkInput.trim() });
      if (res.data.success) {
        setLinkTxnId(res.data.data.txnId);
        toast.success(res.data.message || 'OTP sent successfully.');
      } else {
        toast.error(res.data.message || 'Failed to initialize verification.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error initializing verification.');
    } finally {
      setLinkingLoading(false);
    }
  };

  // Option A: Confirm Link verification
  const handleLinkConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkOtp.trim()) {
      toast.error('Please enter the OTP received.');
      return;
    }

    setLinkingLoading(true);
    try {
      const res = await axios.post('/api/user/abha/link/confirm', {
        otp: linkOtp.trim(),
        transactionId: linkTxnId
      });

      if (res.data.success) {
        toast.success('ABHA Card linked successfully!');
        setAbhaDetails(res.data.data);
      } else {
        toast.error(res.data.message || 'OTP verification failed.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Verification failed.');
    } finally {
      setLinkingLoading(false);
    }
  };

  // Option B: Generate OTP for new ABHA
  const handleCreateInit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aadhaarInput.trim() || aadhaarInput.trim().length !== 12) {
      toast.error('Please enter a valid 12-digit Aadhaar number.');
      return;
    }
    if (!consentChecked) {
      toast.error('Please accept the consent checkbox to proceed.');
      return;
    }

    setCreationLoading(true);
    try {
      const res = await axios.post('/api/user/abha/otp/generate', {
        aadhaarNumber: aadhaarInput.trim(),
        consent: true
      });
      if (res.data.success) {
        setCreateTxnId(res.data.data.txnId);
        toast.success('Aadhaar OTP generated successfully.');
      } else {
        toast.error(res.data.message || 'Failed to generate Aadhaar OTP.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'OTP generation failed.');
    } finally {
      setCreationLoading(false);
    }
  };

  // Option B: Verify OTP and create ABHA
  const handleCreateConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createOtp.trim()) {
      toast.error('Please enter the OTP received.');
      return;
    }
    if (!aadhaarMobileInput.trim()) {
      toast.error('Please enter the Aadhaar-linked mobile number.');
      return;
    }

    setCreationLoading(true);
    try {
      const res = await axios.post('/api/user/abha/otp/verify', {
        otp: createOtp.trim(),
        transactionId: createTxnId,
        mobile: aadhaarMobileInput.trim()
      });

      if (res.data.success) {
        toast.success('ABHA Card generated successfully!');
        setAbhaDetails(res.data.data);
      } else {
        toast.error(res.data.message || 'Aadhaar verification failed.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Aadhaar verification failed.');
    } finally {
      setCreationLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-12 h-12 text-[#D91656] animate-spin" />
          <p className="text-gray-400 font-bold animate-pulse">Syncing with Health Registry...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center max-w-xl mx-auto p-6">
        <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 shadow-md">
          <Lock size={40} className="animate-pulse" />
        </div>
        <h1 className="text-3xl font-black text-secondary">ABHA Card System Locked</h1>
        <p className="text-gray-500 font-bold leading-relaxed">
          The Ayushman Bharat Health Account (ABHA) registration and verification service is temporarily down for maintenance as NHA API integration keys are undergoing updates.
        </p>
        <div className="p-4 bg-teal-50 border border-teal-100 rounded-2xl flex items-start gap-3 text-left w-full">
          <AlertCircle className="text-teal-600 shrink-0 mt-0.5" size={18} />
          <div>
            <h4 className="text-xs font-black text-teal-900 uppercase tracking-widest">Coming Soon</h4>
            <p className="text-xs text-teal-700 font-medium mt-1">
              This service will automatically unlock and resume operations once credentials are re-validated by the platform administration.
            </p>
          </div>
        </div>
        <button 
          onClick={() => router.back()}
          className="btn-primary py-4 px-8 mt-4 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
        >
          Go Back
        </button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 print:p-0">
        
        {/* Controls Header - Hidden during print */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 print:hidden">
          <div>
            <Link 
              href="/vendor/dashboard/documents" 
              className="flex items-center gap-2 text-gray-500 hover:text-[#D91656] transition-colors font-bold text-xs uppercase tracking-widest mb-3 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm w-fit"
            >
              <ArrowLeft size={14} /> Back to Documents
            </Link>
            <h1 className="text-3xl md:text-4xl font-black text-secondary flex items-center gap-3">
              <Heart className="text-[#D91656] fill-[#D91656]" size={36} /> Ayushman Bharat Health Account (ABHA)
            </h1>
            <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">
              Manage your digital identity in India's integrated healthcare ecosystem.
            </p>
          </div>

          {abhaDetails && (
            <button 
              onClick={handlePrint}
              className="btn-primary py-4 px-8 flex items-center gap-2"
            >
              <Printer size={18} /> Print ABHA Card
            </button>
          )}
        </div>

        {/* Existing Card Display */}
        {abhaDetails ? (
          <div className="flex flex-col items-center gap-8 mt-6">
            <div className="bg-white p-8 md:p-12 rounded-[40px] border border-gray-100 shadow-soft w-full max-w-2xl flex flex-col items-center">
              <div className="mb-8 text-center">
                <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-600">
                  Officially Verified & Linked
                </span>
                <h2 className="text-2xl font-black text-secondary mt-3">Your Digital ABHA Identity</h2>
                <p className="text-xs text-gray-400 font-bold mt-1">This health ID is permanently saved and linked to your SakhiHub account.</p>
              </div>

              <AbhaCardView card={abhaDetails} />
              
              {/* Print Instructions */}
              <div className="mt-10 w-full max-w-[550px] bg-blue-50 border border-blue-100 p-5 rounded-2xl text-xs text-blue-800 print:hidden text-left">
                <h4 className="font-bold mb-2 flex items-center gap-2">🖨️ Printing & Download:</h4>
                <ul className="list-disc pl-5 space-y-1 font-bold">
                  <li>Click <strong>Print ABHA Card</strong> above to trigger your browser's print dialog.</li>
                  <li>Verify <strong>Background Graphics</strong> is checked in layout settings so colors render properly.</li>
                  <li>You can select "Save as PDF" to download a local document.</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          /* Form views: Options to Link or Create */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Interactive Form Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Tabs selector */}
              <div className="bg-white p-2 rounded-[32px] border border-gray-100 shadow-soft flex gap-2 w-full">
                <button
                  onClick={() => {
                    setActiveTab('link');
                    setLinkTxnId('');
                    setLinkOtp('');
                  }}
                  className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                    activeTab === 'link' 
                      ? 'bg-secondary text-white shadow-lg' 
                      : 'text-gray-400 hover:text-secondary'
                  }`}
                >
                  I Already Have ABHA
                </button>
                <button
                  onClick={() => {
                    setActiveTab('create');
                    setCreateTxnId('');
                    setCreateOtp('');
                  }}
                  className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                    activeTab === 'create' 
                      ? 'bg-secondary text-white shadow-lg' 
                      : 'text-gray-400 hover:text-secondary'
                  }`}
                >
                  Create New ABHA
                </button>
              </div>

              {/* Form Content Cards */}
              <div className="bg-white p-8 md:p-10 rounded-[40px] border border-gray-100 shadow-soft text-left">
                
                {/* ----------------- TAB A: LINK EXISTING ABHA ----------------- */}
                {activeTab === 'link' && (
                  <div>
                    {!linkTxnId ? (
                      // Link Init Form
                      <form onSubmit={handleLinkInit} className="space-y-6">
                        <div>
                          <h2 className="text-xl font-black text-secondary">Link Existing ABHA</h2>
                          <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">Ownership verification required before linkage.</p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black text-secondary uppercase tracking-widest">ABHA Number / ABHA Address</label>
                          <input 
                            type="text"
                            value={linkInput}
                            onChange={(e) => setLinkInput(e.target.value)}
                            placeholder="e.g. 91-0000-0000-0000 or username@sbx"
                            disabled={linkingLoading}
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm"
                          />
                        </div>

                        <button 
                          type="submit"
                          disabled={linkingLoading}
                          className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                        >
                          {linkingLoading ? (
                            <>
                              <Loader2 size={16} className="animate-spin" /> Initializing Verification...
                            </>
                          ) : (
                            <>
                              Verify and Send OTP <ChevronRight size={16} />
                            </>
                          )}
                        </button>
                      </form>
                    ) : (
                      // Link Confirm OTP Form
                      <form onSubmit={handleLinkConfirm} className="space-y-6">
                        <div>
                          <h2 className="text-xl font-black text-secondary">Enter Verification OTP</h2>
                          <p className="text-xs text-gray-400 font-bold mt-1">An OTP has been sent to the Aadhaar-linked mobile number for ownership check.</p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black text-secondary uppercase tracking-widest flex items-center gap-1.5">
                            <Key size={14} className="text-[#D91656]" /> 6-Digit OTP
                          </label>
                          <input 
                            type="text"
                            maxLength={6}
                            value={linkOtp}
                            onChange={(e) => setLinkOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="------"
                            disabled={linkingLoading}
                            className="w-full text-center px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-extrabold tracking-[1em] text-lg focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                          />
                        </div>

                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => setLinkTxnId('')}
                            disabled={linkingLoading}
                            className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-secondary font-black text-xs uppercase tracking-widest rounded-2xl transition-all"
                          >
                            Back
                          </button>
                          <button 
                            type="submit"
                            disabled={linkingLoading}
                            className="flex-1 btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                          >
                            {linkingLoading ? (
                              <>
                                <Loader2 size={16} className="animate-spin" /> Verifying...
                              </>
                            ) : (
                              'Confirm & Link Card'
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* ----------------- TAB B: CREATE NEW ABHA ----------------- */}
                {activeTab === 'create' && (
                  <div>
                    {!createTxnId ? (
                      // Create Init Form with Consent
                      <form onSubmit={handleCreateInit} className="space-y-6">
                        <div>
                          <h2 className="text-xl font-black text-secondary">Create Official ABHA</h2>
                          <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">Enrol in the National Health Identity registry.</p>
                        </div>

                        {/* Official ABDM Consent Disclosure */}
                        <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100 space-y-4">
                          <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
                            <Lock size={14} className="text-blue-600" /> Consent Declaration
                          </h4>
                          <p className="text-[11px] text-gray-600 font-medium leading-relaxed">
                            I hereby give my voluntary consent to share my Aadhaar number and demographic data with the National Health Authority (NHA) for the purpose of creating my ABHA (Ayushman Bharat Health Account) card. I understand that this information will be verified against the UIDAI database.
                          </p>
                          <label className="flex items-start gap-3 cursor-pointer select-none">
                            <input 
                              type="checkbox"
                              checked={consentChecked}
                              onChange={(e) => setConsentChecked(e.target.checked)}
                              disabled={creationLoading}
                              className="mt-1 w-4 h-4 text-primary rounded border-blue-200 focus:ring-primary cursor-pointer"
                            />
                            <span className="text-[11px] font-black text-blue-950 uppercase tracking-wide">
                              I accept all terms and authorize Aadhaar verification.
                            </span>
                          </label>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black text-secondary uppercase tracking-widest">12-Digit Aadhaar Number</label>
                          <input 
                            type="text"
                            maxLength={12}
                            value={aadhaarInput}
                            onChange={(e) => setAadhaarInput(e.target.value.replace(/\D/g, ''))}
                            placeholder="0000 0000 0000"
                            disabled={creationLoading}
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm"
                          />
                        </div>

                        <button 
                          type="submit"
                          disabled={creationLoading}
                          className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                        >
                          {creationLoading ? (
                            <>
                              <Loader2 size={16} className="animate-spin" /> Sending OTP Request...
                            </>
                          ) : (
                            <>
                              Generate Aadhaar OTP <ChevronRight size={16} />
                            </>
                          )}
                        </button>
                      </form>
                    ) : (
                      // Create Confirm OTP Form
                      <form onSubmit={handleCreateConfirm} className="space-y-6">
                        <div>
                          <h2 className="text-xl font-black text-secondary">Aadhaar OTP Verification</h2>
                          <p className="text-xs text-gray-400 font-bold mt-1">Please enter the 6-digit authentication OTP sent to your Aadhaar-linked mobile.</p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black text-secondary uppercase tracking-widest flex items-center gap-1.5">
                            <Key size={14} className="text-[#D91656]" /> Verification Code
                          </label>
                          <input 
                            type="text"
                            maxLength={6}
                            value={createOtp}
                            onChange={(e) => setCreateOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="------"
                            disabled={creationLoading}
                            className="w-full text-center px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-extrabold tracking-[1em] text-lg focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black text-secondary uppercase tracking-widest flex items-center gap-1.5">
                            <Phone size={14} className="text-blue-900" /> Aadhaar-Linked Mobile Number
                          </label>
                          <input 
                            type="text"
                            maxLength={10}
                            value={aadhaarMobileInput}
                            onChange={(e) => setAadhaarMobileInput(e.target.value.replace(/\D/g, ''))}
                            placeholder="Enter 10-digit mobile linked to Aadhaar"
                            disabled={creationLoading}
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm"
                          />
                        </div>

                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => setCreateTxnId('')}
                            disabled={creationLoading}
                            className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-secondary font-black text-xs uppercase tracking-widest rounded-2xl transition-all"
                          >
                            Back
                          </button>
                          <button 
                            type="submit"
                            disabled={creationLoading}
                            className="flex-1 btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                          >
                            {creationLoading ? (
                              <>
                                <Loader2 size={16} className="animate-spin" /> Verifying & Registering...
                              </>
                            ) : (
                              'Confirm & Create ABHA'
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

              </div>
            </div>

            {/* Right Information Sidebar Column */}
            <div className="space-y-8 text-left">
              
              {/* Information Panel */}
              <div className="bg-secondary p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-[-30px] right-[-30px] w-40 h-40 bg-[#D91656]/20 rounded-full blur-3xl"></div>
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                      <Fingerprint size={26} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black leading-tight">Digital Health ID</h2>
                      <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Ayushman Bharat</span>
                    </div>
                  </div>

                  <p className="text-xs text-white/70 font-medium leading-relaxed">
                    ABHA (Ayushman Bharat Health Account) is a key initiative of the Government of India under ABDM. It establishes a unique health identity across all medical institutions, labs, and clinics nationwide.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="flex gap-3 items-start">
                      <CheckCircle size={16} className="text-green-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-white/80 font-bold">Standardized National Health Identification</p>
                    </div>
                    <div className="flex gap-3 items-start">
                      <CheckCircle size={16} className="text-green-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-white/80 font-bold">Secure digital storage of medical history</p>
                    </div>
                    <div className="flex gap-3 items-start">
                      <CheckCircle size={16} className="text-green-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-white/80 font-bold">Seamless access to digital health services</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Shield Note */}
              <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft flex flex-col gap-4">
                <h5 className="text-xs font-black text-secondary uppercase tracking-widest flex items-center gap-2">
                  <ShieldAlert size={16} className="text-[#D91656]" /> Security Standards
                </h5>
                <p className="text-[11px] text-gray-400 font-bold leading-relaxed">
                  Your credentials are encrypted and transmitted directly to the official ABDM Sandbox registries. SakhiHub does not store your raw Aadhaar number or OTP.
                </p>
              </div>

            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
