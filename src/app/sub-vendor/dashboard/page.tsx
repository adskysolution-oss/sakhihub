'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { 
  Target, Users, Briefcase, User, IndianRupee, 
  ClipboardList, TrendingUp, ShieldCheck, CheckCircle, Clock 
} from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";
import RegisterPartnerModal from "@/components/features/dashboard/RegisterPartnerModal";
import ReferralLinkCard from "@/components/features/dashboard/ReferralLinkCard";

export default function SubVendorDashboard() {
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
    { title: 'My Campaigns', value: stats?.activeCampaigns || 0, icon: Target, color: '#FF4D8C', trend: 'Active programs' },
    { title: 'Team Employees', value: stats?.totalEmployees || 0, icon: Briefcase, color: '#6A1B9A', trend: 'Field force' },
    { title: 'Total Members', value: stats?.totalMembers || 0, icon: Users, color: '#1565C0', trend: 'Village growth' },
    { title: 'Groups Formed', value: stats?.totalGroups || 0, icon: ClipboardList, color: '#EF6C00', trend: 'Community groups' },
    { title: 'Paid Members', value: stats?.paidMembers || 0, icon: CheckCircle, color: '#2E7D32', trend: 'Revenue share' },
    { title: 'Pending Tasks', value: 3, icon: Clock, color: '#D32F2F', trend: 'Action required' },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <header>
          <h1 className="text-3xl md:text-4xl font-black text-secondary">Sub-Vendor Dashboard</h1>
          <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">Monitor your local field force and member recruitment</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Referral Link & Quick Actions */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <ReferralLinkCard 
              inviterRole="sub_vendor" 
              vendorCode={user?.vendorCode}
              subVendorCode={user?.subVendorCode}
            />
            
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft flex-1 flex flex-col items-center justify-center text-center min-h-[250px]">
              <TrendingUp size={60} className="text-gray-100 mb-6" />
              <h3 className="text-xl font-black text-secondary">Recruitment Trends</h3>
              <p className="text-gray-400 font-bold text-sm max-w-xs mt-2">Visualizing your monthly growth and member activation data.</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft">
            <h2 className="text-xl font-black text-secondary mb-8">Field Actions</h2>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setShowRegisterModal(true)}
                className="flex items-center gap-4 p-5 w-full bg-gray-50 hover:bg-primary hover:text-white rounded-2xl text-secondary font-bold text-sm transition-all text-left group"
              >
                <User size={20} className="group-hover:scale-110 transition-transform" />
                Register Employee
              </button>
              {[
                { label: 'New Group Entry', icon: ClipboardList },
                { label: 'View Reports', icon: TrendingUp },
                { label: 'Download IDs', icon: ShieldCheck },
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
