'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import {
  Target, Users, Briefcase, User, IndianRupee,
  ClipboardList, TrendingUp, ShieldCheck, CheckCircle, Clock, FileText, ExternalLink,
  AlertCircle
} from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";
import Link from "next/link";
import RegisterPartnerModal from "@/components/features/dashboard/RegisterPartnerModal";
import ReferralLinkCard from "@/components/features/dashboard/ReferralLinkCard";
import PaymentReceiptCard from "@/components/features/dashboard/PaymentReceiptCard";
import DigitalIdWidget from "@/components/features/dashboard/DigitalIdWidget";
import { useLanguage } from '@/context/LanguageContext';

export default function VendorDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registerModal, setRegisterModal] = useState<{ isOpen: boolean, role: 'sub_vendor' | 'employee' | 'member' | 'vendor' }>({
    isOpen: false,
    role: 'sub_vendor'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, userRes] = await Promise.all([
          axios.get('/api/vendor/stats'),
          axios.get('/api/auth/me')
        ]);
        if (statsRes.data.success) setStats(statsRes.data.data);
        if (userRes.data.success) setUser(userRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: t('dashboardCommon.activeCampaigns', 'Active Campaigns'), value: stats?.activeCampaigns || 0, icon: Target, color: '#FF4D8C', trend: t('dashboardCommon.trendCampaigns', '+2 this month') },
    { title: t('dashboardCommon.totalEmployees', 'Total Employees'), value: stats?.totalEmployees || 0, icon: Briefcase, color: '#6A1B9A', trend: t('dashboardCommon.trendActiveForce', 'Active force') },
    { title: t('dashboardCommon.subVendors', 'Sub-Vendors'), value: stats?.totalSubVendors || 0, icon: ShieldCheck, color: '#2E7D32', trend: t('dashboardCommon.trendFieldPartners', 'Field partners') },
    { title: t('dashboardCommon.totalMembers', 'Total Members'), value: stats?.totalMembers || 0, icon: Users, color: '#1565C0', trend: t('dashboardCommon.trendCommunitySize', 'Community size') },
    { title: t('dashboardCommon.paidMembers', 'Paid Members'), value: stats?.paidMembers || 0, icon: CheckCircle, color: '#2E7D32', trend: t('dashboardCommon.trendCollection', '₹ Collection') },
    { title: t('dashboardCommon.freeMembers', 'Free Members'), value: stats?.freeMembers || 0, icon: Clock, color: '#EF6C00', trend: t('dashboardCommon.trendPendingActivation', 'Pending activation') },
  ];

  const isWorkLocationIncomplete = user && (
    !user.workState || !user.workDistrict || !user.workBlock ||
    !user.workTehsil || !user.workPincode || !user.workArea || !user.workAddress
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {isWorkLocationIncomplete && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-[30px] border border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-amber-500/5 backdrop-blur-md"
          >
            <div className="flex items-center gap-5 flex-1">
              <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                <AlertCircle size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-amber-900 leading-tight">{t('onboarding.completeWorkLocation', 'Action Required: Complete Your Work Location')}</h2>
                <p className="text-amber-700/80 mt-1 text-sm leading-relaxed">
                  {t('onboarding.completeWorkLocationDesc', 'Please provide your detailed proposed work location (Tehsil, Panchayat/Area, block, district, state, pincode, and address) in your profile.')}
                </p>
              </div>
            </div>
            <Link href="/vendor/dashboard/profile">
              <button className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 whitespace-nowrap flex items-center gap-2">
                {t('dashboardCommon.editProfile', 'Edit Profile')}
              </button>
            </Link>
          </motion.div>
        )}
        <header className="flex justify-between items-start">
          <div className="flex gap-4">
            <button
              onClick={() => setRegisterModal({ isOpen: true, role: 'sub_vendor' })}
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
            >
              <ShieldCheck size={16} /> {t('dashboardAdmin.addSubVendor', 'Add Sub-Vendor')}
            </button>
            <button
              onClick={() => setRegisterModal({ isOpen: true, role: 'employee' })}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
            >
              <User size={16} /> {t('dashboardAdmin.createEmployee', 'Add Employee')}
            </button>
            <button
              onClick={() => setRegisterModal({ isOpen: true, role: 'member' })}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
            >
              <Users size={16} /> {t('dashboardAdmin.registerMember', 'Register Member')}
            </button>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-gray-100 rounded-[32px] animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-soft hover:shadow-medium transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: card.color }}
                  >
                    <card.icon size={28} />
                  </div>
                  <span className="text-[10px] font-black text-primary bg-primary/5 px-3 py-1 rounded-full uppercase tracking-widest">{card.trend}</span>
                </div>
                <h3 className="text-4xl font-black text-secondary mb-1">{card.value}</h3>
                <p className="text-gray-400 font-bold text-sm">{card.title}</p>
              </motion.div>
            ))}
          </div>
        )}

        <DigitalIdWidget user={user} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ReferralLinkCard
            inviterRole="vendor"
            vendorCode={user?.vendorCode}
          />

          <PaymentReceiptCard />

          {user?.appointmentDetails && (
            <div className="bg-green-50/50 p-6 rounded-[32px] border border-green-100 flex flex-col sm:flex-row justify-between items-center text-left col-span-1 lg:col-span-2 shadow-sm gap-4 group hover:border-green-300 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-500 text-white flex items-center justify-center shrink-0">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-green-800">{t('onboarding.agreementGenerated', 'Vendor Agreement Generated Successfully')}</h3>
                  <p className="text-xs text-green-600 font-bold mt-1">
                    {t('onboarding.agreementGeneratedDesc', 'Your official vendor agreement is ready.')}
                  </p>
                </div>
              </div>
              <a 
                href="/vendor/dashboard/documents" 
                className="flex items-center gap-2 px-6 py-3 bg-white text-green-700 border border-green-200 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-green-50 transition-all shrink-0"
              >
                <FileText size={14} /> {t('onboarding.openDocuments', 'Open Documents')}
              </a>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-secondary p-8 rounded-[40px] text-white shadow-2xl">
            <h2 className="text-xl font-black mb-8">{t('dashboardCommon.operationsActivity', 'Operations Activity')}</h2>
            <div className="flex flex-col gap-8">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex gap-4 relative pl-6 border-l-2 border-white/10 hover:border-primary transition-all">
                  <div className="absolute left-[-5px] top-0 w-2 h-2 bg-primary rounded-full"></div>
                  <div>
                    <h4 className="text-sm font-bold">{t('dashboardCommon.newEmployeeRegistered', 'New Employee Registered')}</h4>
                    <p className="text-xs text-white/60 mt-1">{t('dashboardCommon.sampleActivityText', 'Ravi Kumar joined under Sub-Vendor SHSVN1245.')}</p>
                    <p className="text-[10px] text-primary font-black mt-2 uppercase tracking-widest">{t('dashboardCommon.hoursAgo', '2 hours ago')}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-10 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
              {t('dashboardCommon.viewAuditLog', 'View Full Audit Log')}
            </button>
          </div>
        </div>

        <RegisterPartnerModal
          isOpen={registerModal.isOpen}
          onClose={() => setRegisterModal({ ...registerModal, isOpen: false })}
          onSuccess={() => window.location.reload()}
          role={registerModal.role}
          parentVendorId={user?._id}
          vendorCode={user?.vendorCode}
        />
      </div>
    </DashboardLayout>
  );
}
