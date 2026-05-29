'use client';

import React from 'react';
import {
  Users, Layout, UserPlus, IndianRupee,
  BarChart3, ShieldAlert, User, TrendingUp, Wallet, Briefcase
} from 'lucide-react';
import RegisterPartnerModal from "@/components/features/dashboard/RegisterPartnerModal";
import { motion } from 'framer-motion';
import Link from 'next/link';
import axios from 'axios';
import { useLanguage } from '@/context/LanguageContext';

export default function SuperAdminDashboard({ stats: data }: { stats?: any }) {
  const { t } = useLanguage();

  const coreStats = [
    { label: t('dashboardAdmin.totalMembers', "Total Members Onboarded"), value: data?.stats?.totalMembers || "0", icon: UserPlus, color: "#2e7d32", subText: t('dashboardAdmin.totalMembersSub', "Pending: {{count}}", { count: data?.stats?.pendingConnections || 0 }) },
    { label: t('dashboardAdmin.activeGroups', "Active Self-Help Groups"), value: data?.stats?.totalGroups || "0", icon: Layout, color: "#e91e63" },
    { label: t('dashboardAdmin.activeFieldForce', "Active Field Force"), value: data?.stats?.activeEmployees || "0", icon: Users, color: "#6a1b9a", subText: t('dashboardAdmin.activeFieldForceSub', "Vendors: {{vendors}} | Sub: {{subVendors}}", { vendors: data?.stats?.activeVendors || 0, subVendors: data?.stats?.activeSubVendors || 0 }) },
    { label: t('dashboardAdmin.pendingKyc', "Pending KYC Requests"), value: data?.stats?.pendingConnections || "0", icon: ShieldAlert, color: "#ef6c00" },
  ];

  const financialStats = [
    { label: t('dashboardAdmin.totalRevenue', "Total Platform Revenue"), value: `₹${(data?.stats?.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: "#2e7d32", description: t('dashboardAdmin.totalRevenueDesc', "Member collections + Partner subscriptions") },
    { label: t('dashboardAdmin.memberCollections', "Member Fee Collections"), value: `₹${(data?.stats?.totalCollections || 0).toLocaleString()}`, icon: IndianRupee, color: "#ef6c00", description: t('dashboardAdmin.memberCollectionsDesc', "INR 100/member flat registrations") },
    { label: t('dashboardAdmin.partnerSubscriptions', "Partner Subscriptions"), value: `₹${(data?.stats?.totalPartnerSubscriptions || 0).toLocaleString()}`, icon: Wallet, color: "#0288d1", description: t('dashboardAdmin.partnerSubscriptionsDesc', "Vendor, Sub-Vendor, & Employee annual fees") },
    { label: t('dashboardAdmin.securityDeposits', "Refundable Security Deposits"), value: `₹${(data?.stats?.totalPartnerDeposits || 0).toLocaleString()}`, icon: Briefcase, color: "#7b1fa2", description: t('dashboardAdmin.securityDepositsDesc', "Held in escrow for Vendors & Sub-vendors") },
  ];

  const [registerModal, setRegisterModal] = React.useState<{ isOpen: boolean, role: 'vendor' | 'sub_vendor' | 'employee' | 'member' }>({ 
    isOpen: false, 
    role: 'vendor' 
  });

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await axios.patch(`/api/admin/employees/${id}/status`, { status });
      if (res.data.success) {
        window.location.reload(); 
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <div className="flex flex-col gap-6 md:gap-10">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
         <button 
          onClick={() => setRegisterModal({ isOpen: true, role: 'vendor' })}
          className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
         >
           <UserPlus size={16} /> {t('dashboardAdmin.registerVendor', 'Register New Vendor')}
         </button>
         <button 
          onClick={() => setRegisterModal({ isOpen: true, role: 'sub_vendor' })}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
         >
           <ShieldAlert size={16} /> {t('dashboardAdmin.addSubVendor', 'Add Sub-Vendor')}
         </button>
         <button 
          onClick={() => setRegisterModal({ isOpen: true, role: 'employee' })}
          className="flex items-center gap-2 px-6 py-3 bg-white text-secondary border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
         >
           <Users size={16} /> {t('dashboardAdmin.createEmployee', 'Create Employee')}
         </button>
         <button 
          onClick={() => setRegisterModal({ isOpen: true, role: 'member' })}
          className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
         >
           <User size={16} /> {t('dashboardAdmin.registerMember', 'Register Member')}
         </button>
      </div>

      {/* Core Operations Overview */}
      <div>
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-l-4 border-primary pl-4 mb-4">{t('dashboardAdmin.coreOperations', 'Core Operations Overview')}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {coreStats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-6 md:p-8 rounded-[24px] sm:rounded-[32px] border border-gray-100 shadow-soft relative overflow-hidden group"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: `${stat.color}15`, color: stat.color }}>
                  <stat.icon size={26} />
                </div>
              </div>
              <div className="mt-5 md:mt-6">
                <p className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-secondary mt-1">{stat.value}</h3>
                {stat.subText && <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider">{stat.subText}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Financial Ledger & Revenues */}
      <div>
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-l-4 border-green-500 pl-4 mb-4">{t('dashboardAdmin.financialLedger', 'Financial Ledger & Revenues')}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {financialStats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (i + 4) * 0.05 }}
              className="bg-white p-6 md:p-8 rounded-[24px] sm:rounded-[32px] border border-gray-100 shadow-soft relative overflow-hidden group"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: `${stat.color}15`, color: stat.color }}>
                  <stat.icon size={26} />
                </div>
              </div>
              <div className="mt-5 md:mt-6">
                <p className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-secondary mt-1">{stat.value}</h3>
                {stat.description && <p className="text-[9px] text-gray-400 font-medium mt-1 leading-tight">{stat.description}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Grid: Pending Approvals & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        {/* Pending Approvals */}
        <div className="lg:col-span-7 bg-white rounded-[30px] md:rounded-[40px] border border-gray-100 shadow-soft p-6 sm:p-8 md:p-10">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl md:text-2xl font-bold text-secondary flex items-center gap-3">
              <ShieldAlert size={24} className="text-amber-500" /> {t('dashboardAdmin.pendingApprovals', 'Pending Approvals')} ({data?.pendingApplications?.length || 0})
            </h3>
            <Link href="/admin/employees" className="text-primary font-bold text-sm hover:underline">{t('dashboardAdmin.viewAll', 'View All')}</Link>
          </div>

          <div className="flex flex-col gap-4">
            {data?.pendingApplications?.length > 0 ? (
              data.pendingApplications.map((app: any) => (
                <div key={app._id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-3xl border border-gray-50 bg-[#fcfcfc] hover:border-primary/20 transition-all">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20 shrink-0">
                    {app.fullName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-secondary text-base truncate">{app.fullName}</p>
                    <p className="text-xs text-gray-400 font-semibold mt-0.5 truncate">
                      <span className="text-primary font-black uppercase tracking-widest text-[9px] mr-2 px-2 py-0.5 bg-primary/5 rounded-md">
                        {app.role.replace('_', ' ')}
                      </span>
                      {app.assignmentStatus === 'pending' && (
                        <span className="text-amber-600 font-black uppercase tracking-widest text-[9px] mr-2 px-2 py-0.5 bg-amber-50 rounded-md border border-amber-100">
                          {t('dashboardAdmin.assignmentRequired', 'Assignment Required')}
                        </span>
                      )}
                      {app.designation || t('dashboardAdmin.staff', 'Staff')} • {app.block}, {app.district}
                    </p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    <button 
                      onClick={() => handleStatusUpdate(app._id, 'rejected')}
                      className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-gray-100 bg-white text-red-500 font-bold text-xs hover:bg-red-50 transition-all"
                    >{t('dashboardAdmin.reject', 'Reject')}</button>
                    <button 
                      onClick={() => handleStatusUpdate(app._id, 'active')}
                      className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                    >{t('dashboardAdmin.approve', 'Approve')}</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400 font-semibold italic border-2 border-dashed border-gray-50 rounded-3xl">
                {t('dashboardAdmin.noPending', 'No pending applications found.')}
              </div>
            )}
          </div>
        </div>

        {/* Recent Platform Activity */}
        <div className="lg:col-span-5 bg-white rounded-[30px] md:rounded-[40px] border border-gray-100 shadow-soft p-6 sm:p-8 md:p-10">
          <h3 className="text-xl md:text-2xl font-bold text-secondary mb-8 flex items-center gap-3">
            <BarChart3 size={24} className="text-primary" /> {t('dashboardAdmin.topPerformers', 'Top Performers')}
          </h3>
          <div className="flex flex-col gap-4">
             {data?.stats?.employeeStats?.map((emp: any, i: number) => (
               <div key={i} className="flex justify-between items-center p-5 bg-[#fcfcfc] rounded-2xl border border-gray-50 hover:shadow-sm transition-all group">
                  <div className="flex gap-4 items-center min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm group-hover:bg-primary group-hover:text-white transition-all shrink-0">{i + 1}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-secondary truncate">{emp._id}</p>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-0.5">{emp.count} {t('dashboardAdmin.membersActivated', 'Members Activated')}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base md:text-lg font-bold text-green-600">₹{emp.total.toLocaleString()}</p>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        {/* District-wise collections */}
        <div className="bg-white rounded-[30px] md:rounded-[40px] border border-gray-100 shadow-soft p-6 sm:p-8 md:p-10">
          <h3 className="text-xl md:text-2xl font-bold text-secondary mb-8">{t('dashboardAdmin.collectionsByDistrict', 'Collections by District')}</h3>
          <div className="flex flex-col gap-6">
             {data?.stats?.districtStats?.map((dist: any) => (
               <div key={dist._id}>
                  <div className="flex justify-between mb-3 text-sm font-bold">
                    <span className="text-gray-500 uppercase tracking-widest text-[10px]">{dist._id || t('dashboardAdmin.unassigned', 'Unassigned')}</span>
                    <span className="text-primary">₹{dist.total.toLocaleString()}</span>
                  </div>
                  <div className="h-2.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.min((dist.total / (data?.stats?.totalCollections || 1)) * 100, 100)}%` }}
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                    ></motion.div>
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-[30px] md:rounded-[40px] border border-gray-100 shadow-soft p-6 sm:p-8 md:p-10">
          <h3 className="text-xl md:text-2xl font-bold text-secondary mb-8">{t('dashboardAdmin.recentActivity', 'Recent Activity')}</h3>
          <div className="flex flex-col gap-6">
             {data?.recentGroups?.slice(0, 4).map((g: any) => (
               <div key={g._id} className="flex gap-4 relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-primary before:rounded-full before:z-10 after:content-[''] after:absolute after:left-[3px] after:top-4 after:w-[2px] after:h-[calc(100%+24px)] after:bg-gray-100 last:after:hidden">
                  <div>
                    <p className="text-sm font-bold text-secondary leading-tight">{t('dashboardAdmin.groupFormed', '{{groupName}} formed in {{village}}', { groupName: g.groupName, village: g.village })}</p>
                    <p className="text-[10px] font-semibold text-gray-400 mt-2 uppercase tracking-widest">{new Date(g.createdAt).toLocaleDateString()}</p>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      <RegisterPartnerModal 
        isOpen={registerModal.isOpen}
        onClose={() => setRegisterModal({ ...registerModal, isOpen: false })}
        onSuccess={() => window.location.reload()}
        role={registerModal.role}
      />
    </div>
  );
}
