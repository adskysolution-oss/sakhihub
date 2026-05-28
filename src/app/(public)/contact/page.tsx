"use client";

import PageBanner from "@/components/ui/PageBanner";
import React, { useState } from "react";
import { Mail, MapPin, Send, Loader2, PhoneCall } from "lucide-react";
import axios from "axios";
import { useLanguage } from "@/context/LanguageContext";

export default function ContactPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    // Basic Validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setStatus({ type: 'error', msg: t('contactPage.errorFields') });
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatus({ type: 'error', msg: t('contactPage.errorEmail') });
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('/api/public/support', formData);
      if (res.data.success) {
        setStatus({ type: 'success', msg: t('contactPage.successMsg') });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus({ type: 'error', msg: res.data.message || t('contactPage.errorSend') });
      }
    } catch (error: any) {
      setStatus({ type: 'error', msg: error.response?.data?.message || t('contactPage.errorGeneric') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="overflow-x-hidden bg-white">
      <PageBanner 
        title={t('contactPage.title')} 
        subtitle={t('contactPage.subtitle')}
        image="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1500"
      />
      
      <section className="section-padding">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr,1.2fr] gap-12 lg:gap-20">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient mb-6 leading-tight">{t('contactPage.reachOut')}</h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-500 mb-10 lg:mb-12 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {t('contactPage.reachDesc')}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 sm:gap-8">
                {[
                  { title: t('contactPage.supportEmail'), val: "support@sakhihub.com", icon: Mail, bg: "bg-primary/5", color: "text-primary" },
                  { title: "Phone Number", val: "+91 8062179122", icon: PhoneCall, bg: "bg-primary/5", color: "text-primary" },
                  { title: t('contactPage.headquarters'), val: "Pu 4, Behind C21 Mall, Scheme 54, Indore, Madhya Pradesh 452010", icon: MapPin, bg: "bg-primary/5", color: "text-primary" }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row lg:flex-row items-center gap-4 sm:gap-5 text-center sm:text-left">
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-black/[0.02]`}>
                      <item.icon size={28} />
                    </div>
                    <div>
                      <h5 className="text-gray-400 text-xs sm:text-sm font-bold uppercase tracking-widest mb-1">{item.title}</h5>
                      <p className="text-secondary text-base sm:text-lg font-bold">{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[40px] p-8 sm:p-12 lg:p-16 shadow-2xl shadow-black/5 border border-gray-100">
              <h3 className="text-2xl sm:text-3xl font-bold text-secondary mb-8 sm:mb-10 text-center lg:text-left">{t('contactPage.sendMessage')}</h3>
              
              {status && (
                <div className={`mb-8 p-4 rounded-2xl text-sm font-bold text-center ${status.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                  {status.msg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs sm:text-sm font-bold text-secondary uppercase tracking-widest ml-1">{t('contactPage.nameLabel')}</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t('contactPage.namePlaceholder')} 
                      className="w-full px-5 sm:px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary transition-all outline-none text-secondary font-medium" 
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs sm:text-sm font-bold text-secondary uppercase tracking-widest ml-1">{t('contactPage.emailLabel')}</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t('contactPage.emailPlaceholder')} 
                      className="w-full px-5 sm:px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary transition-all outline-none text-secondary font-medium" 
                      required
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs sm:text-sm font-bold text-secondary uppercase tracking-widest ml-1">{t('contactPage.subjectLabel')}</label>
                  <select 
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-5 sm:px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary transition-all outline-none text-secondary font-medium appearance-none"
                    required
                  >
                    <option value="">{t('contactPage.subjectDefault')}</option>
                    <option value="General Inquiry">{t('contactPage.subGen')}</option>
                    <option value="Technical Support">{t('contactPage.subTech')}</option>
                    <option value="Campaign Collaboration">{t('contactPage.subCamp')}</option>
                    <option value="Product Feedback">{t('contactPage.subProd')}</option>
                    <option value="Partner Opportunities">{t('contactPage.subPart')}</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs sm:text-sm font-bold text-secondary uppercase tracking-widest ml-1">{t('contactPage.msgLabel')}</label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t('contactPage.msgPlaceholder')} 
                    rows={5} 
                    className="w-full px-5 sm:px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary transition-all outline-none text-secondary font-medium resize-none"
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary py-5 px-10 text-base sm:text-lg rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all font-bold mt-4 flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      {t('contactPage.btnSending')}
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      {t('contactPage.btnSend')}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

