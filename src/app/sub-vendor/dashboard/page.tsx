'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { 
  Target, Users, Briefcase, User, IndianRupee, 
  ClipboardList, TrendingUp, ShieldCheck, CheckCircle, Clock,
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

export default function SubVendorDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, userRes] = await Promise.all([
          axios.get('/api/sub-vendor/stats'),
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
    { title: t('dashboardCommon.myCampaigns', 'My Campaigns'), value: stats?.activeCampaigns || 0, icon: Target, color: '#FF4D8C', trend: t('dashboardCommon.activePrograms', 'Active programs') },
    { title: t('dashboardCommon.teamEmployees', 'Team Employees'), value: stats?.totalEmployees || 0, icon: Briefcase, color: '#6A1B9A', trend: t('dashboardCommon.fieldForce', 'Field force') },
    { title: t('dashboardCommon.totalMembers', 'Total Members'), value: stats?.totalMembers || 0, icon: Users, color: '#1565C0', trend: t('dashboardCommon.villageGrowth', 'Village growth') },
    { title: t('dashboardCommon.groupsFormed', 'Groups Formed'), value: stats?.totalGroups || 0, icon: ClipboardList, color: '#EF6C00', trend: t('dashboardCommon.communityGroups', 'Community groups') },
    { title: t('dashboardCommon.paidMembers', 'Paid Members'), value: stats?.paidMembers || 0, icon: CheckCircle, color: '#2E7D32', trend: t('dashboardCommon.communityReach', 'Community reach') },
    { title: t('dashboardCommon.pendingTasks', 'Pending Tasks'), value: 3, icon: Clock, color: '#D32F2F', trend: t('dashboardCommon.actionRequired', 'Action required') },
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
            <Link href="/sub-vendor/dashboard/profile">
              <button className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 whitespace-nowrap flex items-center gap-2">
                {t('dashboardCommon.editProfile', 'Edit Profile')}
              </button>
            </Link>
          </motion.div>
        )}
        <header>
          <h1 className="text-3xl md:text-4xl font-black text-secondary">{t('dashboardCommon.subVendorDashboard', 'Sub-Vendor Dashboard')}</h1>
          <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">{t('dashboardCommon.subVendorDashboardDesc', 'Monitor your local field force and community operations')}</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Referral Link & Quick Actions */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <ReferralLinkCard 
              inviterRole="sub_vendor" 
              vendorCode={user?.vendorCode}
              subVendorCode={user?.subVendorCode}
            />
            
            <div className="flex flex-col gap-8 flex-1">
              {user?.appointmentDetails && (
                <div className="bg-green-50/50 p-6 rounded-[32px] border border-green-100 flex flex-col sm:flex-row justify-between items-center text-left shadow-sm gap-4 group hover:border-green-300 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-green-500 text-white flex items-center justify-center shrink-0">
                      <CheckCircle size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-green-800">{t('onboarding.agreementGenerated', 'Agreement Generated Successfully')}</h3>
                      <p className="text-xs text-green-600 font-bold mt-1">
                        {t('onboarding.appointmentLetterReady', 'Your official appointment letter is ready.')}
                      </p>
                    </div>
                  </div>
                  <a 
                    href="/sub-vendor/dashboard/documents" 
                    className="flex items-center gap-2 px-6 py-3 bg-white text-green-700 border border-green-200 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-green-50 transition-all shrink-0"
                  >
                    <ClipboardList size={14} /> {t('onboarding.openDocuments', 'Open Documents')}
                  </a>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <PaymentReceiptCard />
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft flex flex-col items-center justify-center text-center min-h-[250px]">
                  <TrendingUp size={60} className="text-gray-100 mb-6" />
                  <h3 className="text-xl font-black text-secondary">{t('dashboardCommon.fieldActivityOverview', 'Field Activity Overview')}</h3>
                  <p className="text-gray-400 font-bold text-sm max-w-xs mt-2">{t('dashboardCommon.fieldActivityOverviewDesc', 'Visualizing your monthly growth and member activation data.')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft">
            <h2 className="text-xl font-black text-secondary mb-8">{t('dashboardCommon.fieldActions', 'Field Actions')}</h2>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setShowRegisterModal(true)}
                className="flex items-center gap-4 p-5 w-full bg-gray-50 hover:bg-primary hover:text-white rounded-2xl text-secondary font-bold text-sm transition-all text-left group"
              >
                <User size={20} className="group-hover:scale-110 transition-transform" />
                {t('dashboardCommon.registerEmployee', 'Register Employee')}
              </button>
              {[
                { label: t('dashboardCommon.newGroupEntry', 'New Group Entry'), icon: ClipboardList },
                { label: t('dashboardCommon.viewReports', 'View Reports'), icon: TrendingUp },
                { label: t('dashboardCommon.downloadIds', 'Download IDs'), icon: ShieldCheck },
              ].map((action, i) => (
                <button key={i} className="flex items-center gap-4 p-5 w-full bg-gray-50 hover:bg-primary hover:text-white rounded-2xl text-secondary font-bold text-sm transition-all text-left group">
                  <action.icon size={20} className="group-hover:scale-110 transition-transform" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <RegisterPartnerModal 
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onSuccess={() => window.location.reload()}
          role="employee"
          parentVendorId={user?._id}
          vendorCode={user?.vendorCode}
          subVendorCode={user?.subVendorCode}
        />
      </div>
    </DashboardLayout>
  );
}
