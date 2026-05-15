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

export default function VendorDashboard() {
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
    { title: 'Active Campaigns', value: stats?.activeCampaigns || 0, icon: Target, color: '#FF4D8C', trend: '+2 this month' },
    { title: 'Total Employees', value: stats?.totalEmployees || 0, icon: Briefcase, color: '#6A1B9A', trend: 'Active force' },
    { title: 'Sub-Vendors', value: stats?.totalSubVendors || 0, icon: ShieldCheck, color: '#2E7D32', trend: 'Network partners' },
    { title: 'Total Members', value: stats?.totalMembers || 0, icon: Users, color: '#1565C0', trend: 'Community size' },
    { title: 'Paid Members', value: stats?.paidMembers || 0, icon: CheckCircle, color: '#2E7D32', trend: '₹ Collection' },
    { title: 'Free Members', value: stats?.freeMembers || 0, icon: Clock, color: '#EF6C00', trend: 'Pending activation' },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <header className="flex justify-between items-start">
          {/* <div>
            <h1 className="text-3xl md:text-4xl font-black text-secondary">Vendor Command Center</h1>
            <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">Manage your recruitment hierarchy and campaign performance</p>
          </div> */}
          <div className="flex gap-4">
            <button
              onClick={() => setRegisterModal({ isOpen: true, role: 'sub_vendor' })}
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
            >
              <ShieldCheck size={16} /> Add Sub-Vendor
            </button>
            <button
              onClick={() => setRegisterModal({ isOpen: true, role: 'employee' })}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
            >
              <User size={16} /> Add Employee
            </button>
            <button
              onClick={() => setRegisterModal({ isOpen: true, role: 'member' })}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
            >
              <Users size={16} /> Register Member
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ReferralLinkCard
            inviterRole="vendor"
            vendorCode={user?.vendorCode}
          />

          {/* Security Deposit Status */}
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-secondary">Security Deposit Status</h2>
              <button className="text-primary font-black text-xs uppercase tracking-widest">Pay Now</button>
            </div>
            <div className="flex flex-col gap-6">
              {stats?.deposits?.map((d: any, i: number) => (
                <div key={i} className="p-6 bg-gray-50 rounded-3xl flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-secondary">{d.campaignName}</h4>
                    <p className="text-xs text-gray-400 mt-1">Due: ₹{d.amount}</p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${d.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                    {d.status}
                  </span>
                </div>
              ))}
              {!stats?.deposits?.length && (
                <p className="text-center text-gray-400 font-bold py-10 italic">No security deposits linked yet.</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-secondary p-8 rounded-[40px] text-white shadow-2xl">
            <h2 className="text-xl font-black mb-8">Network Activity</h2>
            <div className="flex flex-col gap-8">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex gap-4 relative pl-6 border-l-2 border-white/10 hover:border-primary transition-all">
                  <div className="absolute left-[-5px] top-0 w-2 h-2 bg-primary rounded-full"></div>
                  <div>
                    <h4 className="text-sm font-bold">New Employee Registered</h4>
                    <p className="text-xs text-white/60 mt-1">Ravi Kumar joined under Sub-Vendor SVN1245.</p>
                    <p className="text-[10px] text-primary font-black mt-2 uppercase tracking-widest">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-10 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
              View Full Audit Log
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
