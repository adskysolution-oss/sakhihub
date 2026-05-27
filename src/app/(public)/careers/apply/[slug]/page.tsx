'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { Upload, CheckCircle2, ChevronLeft, FileText, User, MapPin, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { usePincodeAutofill } from '@/hooks/usePincodeAutofill';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export default function ApplyPage() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const [vacancy, setVacancy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    fullName: '', mobile: '', whatsapp: '', email: '', gender: '', dob: '',
    pincode: '', state: '', district: '', block: '', qualification: '', experience: '',
    resumeUrl: '', aadhaarUrl: '', panUrl: '', photoUrl: '', declarationAccepted: false
  });
  const [uploading, setUploading] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [existingApp, setExistingApp] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const { loading: pincodeLoading } = usePincodeAutofill(formData.pincode, (data) => {
    setFormData(prev => ({
      ...prev,
      state: data.state || '',
      district: data.district || '',
      block: data.block || ''
    }));
  });

  useEffect(() => {
    if (params.slug) fetchVacancy();
  }, [params.slug]);

  const checkLocalStorageAndSession = async (vacancyData: any) => {
    // 1. Check local storage first
    try {
      const stored = localStorage.getItem('sakhihub_applied_vacancies');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed[vacancyData._id]) {
          const app = parsed[vacancyData._id];
          // we have mobile and app id, let's fetch latest status
          const res = await axios.get(`/api/public/careers/track?applicationId=${app.applicationId}&mobile=${app.mobile}`);
          if (res.data.success) {
            setExistingApp({
              applicationId: res.data.data.applicationId,
              status: res.data.data.status
            });
            return;
          }
        }
      }
    } catch(e) {}
    
    // 2. We could check session here if the user is logged in
    try {
      const { default: axios } = await import('axios');
      const res = await axios.get('/api/auth/me');
      if (res.data.success && res.data.data?.mobile) {
         checkExistingApplication(res.data.data.mobile, vacancyData._id);
      }
    } catch(e) {}
  };

  const fetchVacancy = async () => {
    try {
      const res = await axios.get(`/api/public/careers/vacancies/${params.slug}`);
      if (res.data.success) {
        setVacancy(res.data.data);
        checkLocalStorageAndSession(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching vacancy details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.mobile.length === 10 && vacancy) {
      checkExistingApplication(formData.mobile, vacancy._id);
    } else if (!existingApp) {
      // Don't clear existingApp if it was set by checkLocalStorageAndSession
      // setExistingApp(null);
    }
  }, [formData.mobile, vacancy]);

  const checkExistingApplication = async (mobile: string, vId: string = vacancy?._id) => {
    if (!vId) return;
    setCheckingStatus(true);
    try {
      const res = await axios.get(`/api/public/careers/check-status?mobile=${mobile}&vacancyId=${vId}`);
      if (res.data.success && res.data.applied) {
        setExistingApp(res.data.data);
        // Also save to local storage just in case
        saveToLocalStorage(vId, res.data.data.applicationId, mobile);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingStatus(false);
    }
  };

  const saveToLocalStorage = (vId: string, appId: string, mobile: string) => {
    try {
      const stored = localStorage.getItem('sakhihub_applied_vacancies') || '{}';
      const parsed = JSON.parse(stored);
      parsed[vId] = { applicationId: appId, mobile };
      localStorage.setItem('sakhihub_applied_vacancies', JSON.stringify(parsed));
    } catch (e) {}
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(field);
    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        const res = await axios.post('/api/upload', {
          image: reader.result,
          folder: `career_${field}`
        });
        if (res.data.success) {
          setFormData(prev => ({ ...prev, [field]: res.data.data.url }));
        }
      } catch (err) {
        toast.error(`Failed to upload ${field}. Please try again.`);
      } finally {
        setUploading(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (existingApp) return toast.error("You have already applied for this role.");
    if (!formData.declarationAccepted) return toast.error("You must accept the declaration.");
    if (!formData.resumeUrl) {
      return toast.error("Please upload your Resume/CV.");
    }
    if (vacancy.requireAadhaar && !formData.aadhaarUrl) {
      return toast.error("Please upload your Aadhaar Card.");
    }
    if (vacancy.requirePan && !formData.panUrl) {
      return toast.error("Please upload your PAN Card.");
    }
    if (vacancy.requirePhoto && !formData.photoUrl) {
      return toast.error("Please upload your Passport Photo.");
    }

    setSubmitting(true);
    try {
      const res = await axios.post('/api/public/careers/apply', {
        ...formData,
        vacancyId: vacancy._id,
        applyingFor: vacancy.title
      });
      if (res.data.success) {
        saveToLocalStorage(vacancy._id, res.data.data.applicationId, formData.mobile);
        setSuccess(true);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
      if (err.response?.data?.existingStatus) {
        // Handle case where duplicate is caught by server but missed by frontend
        setExistingApp({ status: err.response.data.existingStatus, applicationId: 'Unknown' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen pt-32 text-center"><div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div></div>;
  if (!vacancy) return <div className="min-h-screen pt-32 text-center font-bold text-gray-500">Vacancy not found.</div>;

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-20 flex items-center justify-center">
        <div className="bg-white p-12 rounded-[32px] text-center max-w-lg mx-auto shadow-sm border border-gray-100">
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-gray-900 mb-4">{t('careersPage.appSubTitle')}</h2>
          <p className="text-gray-600 font-medium mb-8">
            {t('careersPage.appSubDesc1')} <strong>{vacancy.title}</strong> {t('careersPage.appSubDesc2')}
          </p>
          <Link href="/careers" className="bg-pink-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-pink-700 transition-colors inline-block">
            {t('careersPage.backToCareers')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <Link href={`/careers/${vacancy.slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-pink-600 mb-8 transition-colors">
          <ChevronLeft size={16} /> {t('careersPage.backToJobDetails')}
        </Link>

        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-gray-100">
          <div className="border-b border-gray-100 pb-8 mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">{t('careersPage.applyFor')} {vacancy.title}</h1>
            <p className="text-gray-500 font-medium">{t('careersPage.fillForm')}</p>
          </div>

          {existingApp && (
            <div className="bg-blue-50 border border-blue-200 rounded-3xl p-8 mb-10 text-center shadow-sm">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-2xl font-black text-blue-900 mb-2">{t('careersPage.alreadyAppliedTitle')}</h3>
              <p className="text-blue-800 font-medium mb-6">
                {t('careersPage.alreadyAppliedDesc')}
              </p>
              <div className="bg-white rounded-2xl p-4 inline-flex flex-wrap items-center justify-center gap-8 shadow-sm border border-blue-100">
                <div className="text-left">
                  <span className="text-[10px] uppercase font-black text-gray-400 block mb-1">{t('careersPage.appIdLabel')}</span>
                  <span className="font-bold text-gray-900">{existingApp.applicationId}</span>
                </div>
                <div className="hidden sm:block w-px h-10 bg-gray-100"></div>
                <div className="text-left">
                  <span className="text-[10px] uppercase font-black text-gray-400 block mb-1">{t('careersPage.currentStatus')}</span>
                  <span className={`font-black uppercase tracking-widest px-4 py-1.5 rounded-full text-[10px] ${
                    existingApp.status === 'Selected' ? 'bg-green-100 text-green-700' :
                    existingApp.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{existingApp.status}</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className={`space-y-8 ${existingApp ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Personal Info */}
            <section className="space-y-6">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <User size={20} className="text-pink-500" /> {t('careersPage.personalInfo')}
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('careersPage.fullNameLabel')}</label>
                  <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-gray-900 focus:outline-none focus:border-pink-500" />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('careersPage.genderLabel')}</label>
                  <select required value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-gray-900 focus:outline-none focus:border-pink-500">
                    <option value="">{t('careersPage.selGender')}</option>
                    <option value="Female">{t('careersPage.female')}</option>
                    <option value="Male">{t('careersPage.male')}</option>
                    <option value="Other">{t('careersPage.other')}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                    <span>{t('careersPage.mobileLabel')}</span>
                    {checkingStatus && <span className="text-pink-500 animate-pulse">{t('careersPage.checking')}</span>}
                  </label>
                  <input type="tel" maxLength={10} required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value.replace(/\D/g, '')})} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-gray-900 focus:outline-none focus:border-pink-500" />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('careersPage.whatsappLabel')}</label>
                  <input type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-gray-900 focus:outline-none focus:border-pink-500" />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('careersPage.emailLabel')}</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-gray-900 focus:outline-none focus:border-pink-500" />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('careersPage.dobLabel')}</label>
                  <input type="date" required value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-gray-900 focus:outline-none focus:border-pink-500" />
                </div>
              </div>
            </section>

            {/* Location */}
            <section className="space-y-6">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <MapPin size={20} className="text-pink-500" /> {t('careersPage.locDetails')}
              </h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    {t('careersPage.pincodeLabel')} {pincodeLoading && <span className="animate-spin w-3 h-3 border-2 border-pink-500 border-t-transparent rounded-full" />}
                  </label>
                  <input type="text" maxLength={6} required value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '')})} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-gray-900 focus:outline-none focus:border-pink-500" placeholder="e.g. 110001" />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('careersPage.stateLabel')}</label>
                  <input type="text" required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-gray-900 focus:outline-none focus:border-pink-500" />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('careersPage.districtLabel')}</label>
                  <input type="text" required value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-gray-900 focus:outline-none focus:border-pink-500" />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('careersPage.blockLabel')}</label>
                  <input type="text" required value={formData.block} onChange={e => setFormData({...formData, block: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-gray-900 focus:outline-none focus:border-pink-500" />
                </div>
              </div>
            </section>

            {/* Professional */}
            <section className="space-y-6">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Briefcase size={20} className="text-pink-500" /> {t('careersPage.profDetails')}
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('careersPage.qualificationLabel')}</label>
                  <input type="text" required value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-gray-900 focus:outline-none focus:border-pink-500" />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('careersPage.expLabel')}</label>
                  <select required value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-gray-900 focus:outline-none focus:border-pink-500">
                    <option value="">{t('careersPage.selExp')}</option>
                    <option value="Fresher">{t('careersPage.fresher')}</option>
                    <option value="1-2 Years">1-2 Years</option>
                    <option value="3-5 Years">3-5 Years</option>
                    <option value="5+ Years">5+ Years</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Documents */}
            <section className="space-y-6">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <FileText size={20} className="text-pink-500" /> {t('careersPage.reqDocs')}
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {(() => {
                  const requiredDocs = ['resumeUrl'];
                  if (vacancy.requireAadhaar) requiredDocs.push('aadhaarUrl');
                  if (vacancy.requirePan) requiredDocs.push('panUrl');
                  if (vacancy.requirePhoto) requiredDocs.push('photoUrl');

                  return requiredDocs.map((field) => {
                    const label = field === 'resumeUrl' ? 'Resume / CV' : 
                                  field === 'aadhaarUrl' ? 'Aadhaar Card' : 
                                  field === 'panUrl' ? 'PAN Card' : 'Passport Photo';
                    return (
                      <div key={field} className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-pink-300 transition-colors bg-gray-50">
                        {(formData as any)[field] ? (
                          <div className="text-green-600 font-bold text-sm flex flex-col items-center">
                            <CheckCircle2 size={32} className="mb-2" />
                            {t('careersPage.uploaded')}
                          </div>
                        ) : uploading === field ? (
                          <div className="text-pink-600 font-bold text-sm animate-pulse">{t('careersPage.uploading')}</div>
                        ) : (
                          <>
                            <Upload size={32} className="mx-auto text-gray-400 mb-3" />
                            <label className="text-xs font-black text-pink-600 uppercase tracking-widest cursor-pointer hover:text-pink-700">
                              {t('careersPage.upload')} {label}
                              <input type="file" className="hidden" accept={field === 'photoUrl' ? "image/*" : ".pdf,.jpg,.jpeg,.png"} onChange={(e) => handleFileUpload(e, field)} />
                            </label>
                          </>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </section>

            {/* Declaration */}
            <section className="pt-6 border-t border-gray-100">
              <label className="flex items-start gap-4 cursor-pointer">
                <input type="checkbox" required checked={formData.declarationAccepted} onChange={e => setFormData({...formData, declarationAccepted: e.target.checked})} className="mt-1 w-5 h-5 rounded text-pink-600 focus:ring-pink-500 border-gray-300" />
                <span className="text-sm text-gray-600 font-medium leading-relaxed">
                  {t('careersPage.declarationText')}
                </span>
              </label>
            </section>

            <button type="submit" disabled={submitting} className="w-full py-5 bg-pink-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-pink-700 transition-colors shadow-lg shadow-pink-200 disabled:opacity-50 mt-8">
              {submitting ? t('careersPage.submittingApp') : t('careersPage.submitApp')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
