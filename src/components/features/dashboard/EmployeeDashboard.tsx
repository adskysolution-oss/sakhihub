'use client';

import React from 'react';
import {
  Users, UserPlus, IndianRupee, MapPin,
  Target, TrendingUp, Calendar, ArrowRight,
  ClipboardList, Bell, ShieldCheck, Heart
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Link from 'next/link';
import ReferralLinkCard from './ReferralLinkCard';

export default function EmployeeDashboard({ user }: { user: any }) {
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/employee/stats');
        if (res.data.success) setData(res.data.data.stats);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: "Groups Created", value: data?.totalGroups || "0", icon: Users, color: "#6a1b9a" },
    { label: "Women Members", value: data?.totalMembers || "0", icon: UserPlus, color: "#e91e63" },
    { label: "Total Collection", value: `₹${(data?.totalCollection || 0).toLocaleString()}`, icon: IndianRupee, color: "#2e7d32" },
    { label: "Monthly Goal", value: `${data?.monthlyMembers || 0} / 200`, icon: Target, color: "#ef6c00" },
  ];

  return (
    <div className="flex flex-col gap-6 md:gap-10 p-2 md:p-4">
      {/* Welcome Banner */}
      <section className="relative p-6 sm:p-10 lg:p-14 bg-gradient-to-br from-primary to-secondary-dark rounded-[30px] md:rounded-[40px] text-white overflow-hidden shadow-2xl shadow-primary/20">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">Hello, {user?.fullName}!</h1>
            <p className="text-xs sm:text-lg lg:text-xl opacity-90 leading-relaxed max-w-xl">
              You are currently assigned to <span className="font-semibold border-b-2 border-white/30">{user?.block}, {user?.district}</span> area.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-8">
              <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-2xl text-[10px] md:text-xs font-bold tracking-widest uppercase">
                ID: {user?.employeeId || 'Pending'}
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-2xl text-[10px] md:text-xs font-bold tracking-widest uppercase">
                Role: {user?.designation}
              </span>
            </div>
          </div>
          <div className="w-24 h-24 md:w-32 md:h-32 bg-white/20 backdrop-blur-xl rounded-[40px] flex items-center justify-center border border-white/30 shadow-2xl">
            <ShieldCheck size={60} className="text-white" />
          </div>
        </div>
        <Heart className="absolute -right-20 -bottom-20 w-80 h-80 opacity-10 text-white transform -rotate-12" />
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-5 sm:p-6 lg:p-8 bg-white rounded-[24px] sm:rounded-[32px] border border-gray-100 flex items-center gap-4 sm:gap-5 shadow-soft hover:border-primary/30 transition-all group"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0" style={{ background: `${stat.color}15`, color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-widest truncate">{stat.label}</p>
              <h3 className="text-base sm:text-lg lg:text-2xl font-bold text-secondary mt-0.5 truncate">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Recruitment Link */}
      <section>
        <ReferralLinkCard 
          inviterRole="employee"
          vendorCode={user?.parentVendorCode || user?.vendorCode}
          subVendorCode={user?.parentSubVendorCode || user?.subVendorCode}
          employeeCode={user?.employeeId}
        />
      </section>

      {/* Main Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        {/* Quick Actions */}
        <section className="lg:col-span-7 p-6 sm:p-10 lg:p-12 bg-white rounded-[30px] md:rounded-[40px] border border-gray-100 shadow-soft">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-secondary mb-8 sm:mb-10 flex items-center gap-4">
            <ClipboardList size={28} className="text-primary" /> Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4 md:gap-6">
            <Link href="/employee/members" className="group no-underline">
              <button className="w-full p-5 sm:p-6 rounded-[24px] sm:rounded-[32px] border border-gray-100 bg-gray-50 hover:bg-white hover:border-primary/30 hover:shadow-medium transition-all text-left h-full flex flex-col gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0"><UserPlus size={24} /></div>
                <div className="min-w-0">
                  <p className="text-base sm:text-lg font-bold text-secondary leading-tight truncate">Add Member</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 font-semibold mt-1">Register a new woman</p>
                </div>
              </button>
            </Link>
            <Link href="/employee/groups" className="group no-underline">
              <button className="w-full p-5 sm:p-6 rounded-[24px] sm:rounded-[32px] border border-gray-100 bg-gray-50 hover:bg-white hover:border-primary/30 hover:shadow-medium transition-all text-left h-full flex flex-col gap-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary group-hover:scale-110 transition-transform shrink-0"><Users size={24} /></div>
                <div className="min-w-0">
                  <p className="text-base sm:text-lg font-bold text-secondary leading-tight truncate">Create Group</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 font-semibold mt-1">Form a new unit</p>
                </div>
              </button>
            </Link>
            <Link href="/employee/requests" className="group no-underline sm:col-span-2">
              <button className="w-full p-5 sm:p-6 rounded-[24px] sm:rounded-[32px] border-2 border-primary/20 bg-primary/5 hover:bg-white hover:border-primary transition-all text-left flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform shrink-0"><Bell size={24} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg sm:text-xl font-bold text-secondary leading-tight">Member Requests</p>
                  <p className="text-xs sm:text-sm text-gray-400 font-semibold mt-1">Check pending connection requests</p>
                </div>
                <div className="hidden sm:block sm:ml-auto"><ArrowRight className="text-primary group-hover:translate-x-2 transition-transform" /></div>
              </button>
            </Link>
            <Link href="/employee/membership" className="group no-underline">
              <button className="w-full p-5 sm:p-6 rounded-[24px] sm:rounded-[32px] border border-gray-100 bg-gray-50 hover:bg-white hover:border-primary/30 hover:shadow-medium transition-all text-left h-full flex flex-col gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform shrink-0"><IndianRupee size={24} /></div>
                <div className="min-w-0">
                  <p className="text-base sm:text-lg font-bold text-secondary leading-tight truncate">Membership Fee</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 font-semibold mt-1">Collect from member</p>
                </div>
              </button>
            </Link>
            <Link href="/employee/reports" className="group no-underline">
              <button className="w-full p-5 sm:p-6 rounded-[24px] sm:rounded-[32px] border border-gray-100 bg-gray-50 hover:bg-white hover:border-primary/30 hover:shadow-medium transition-all text-left h-full flex flex-col gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform shrink-0"><TrendingUp size={24} /></div>
                <div className="min-w-0">
                  <p className="text-base sm:text-lg font-bold text-secondary leading-tight truncate">Daily Report</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 font-semibold mt-1">Submit summary</p>
                </div>
              </button>
            </Link>
          </div>
        </section>

        {/* Targets & Performance */}
        <aside className="lg:col-span-5 flex flex-col gap-6 md:gap-10">
          <section className="p-6 sm:p-10 lg:p-12 bg-white rounded-[30px] md:rounded-[40px] border border-gray-100 shadow-soft">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-secondary mb-8 sm:mb-10 flex items-center gap-4">
              <Target size={28} className="text-primary" /> Targets & Score
            </h3>
            <div className="flex flex-col gap-10">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Monthly Members</span>
                  <span className="text-sm font-bold text-secondary">{data?.monthlyMembers || 0} / 200</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.min(((data?.monthlyMembers || 0) / 200) * 100, 100)}%` }}
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                  ></motion.div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Group Creation</span>
                  <span className="text-sm font-bold text-secondary">{data?.totalGroups || 0} / 15</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.min(((data?.totalGroups || 0) / 15) * 100, 100)}%` }}
                    className="h-full bg-gradient-to-r from-secondary to-secondary-dark"
                  ></motion.div>
                </div>
              </div>
              <div className="mt-4 p-8 bg-primary/5 rounded-[32px] border border-dashed border-primary/30 text-center">
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Efficiency Score</p>
                <h4 className="text-5xl font-bold text-secondary mb-4">{Math.round(((data?.monthlyMembers || 0) / 200) * 100)}%</h4>
                <p className="text-xs text-gray-400 font-semibold leading-relaxed px-4">
                  {((data?.monthlyMembers || 0) / 200) >= 0.8 ? 'You are performing exceptionally well!' : 'Keep pushing to reach your monthly targets and help more women.'}
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
