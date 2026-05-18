'use client';

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import ProfileManager from "@/components/features/profile/ProfileManager";
import axios from "axios";
import { 
  User as UserIcon, Phone, Briefcase, Calendar, 
  Home, MapPin, ShieldCheck, Mail, Sparkles
} from "lucide-react";

export default function ProfilePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/member/profile');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load profile for registry view", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const profile = data?.user;
  const fieldRecord = data?.fieldRecord;
  const membership = data?.membership;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto py-6 px-4">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-secondary tracking-tight">My Profile</h1>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-xs">
            Manage your personal information and membership details
          </p>
        </div>

        {/* Member Profile Registry Card */}
        {!loading && profile && (
          <section className="p-6 sm:p-10 bg-white rounded-[35px] border border-gray-100 shadow-soft mb-12">
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
              <h2 className="text-2xl font-black text-secondary flex items-center gap-3">
                <UserIcon size={26} className="text-primary" /> Member Profile Registry
              </h2>
              <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={14} /> Verified Record
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { label: 'Full Name', value: profile?.fullName, icon: <UserIcon size={18} /> },
                { label: 'Mobile Number', value: profile?.mobile, icon: <Phone size={18} /> },
                { label: 'Occupation', value: fieldRecord?.occupation || 'Member (SHG Participant)', icon: <Briefcase size={18} /> },
                { label: 'Joined On', value: new Date(profile?.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }), icon: <Calendar size={18} /> },
                { label: 'Village', value: fieldRecord?.village || 'Not Set', icon: <Home size={18} /> },
                { label: 'District / Area', value: fieldRecord?.district || 'Not Set', icon: <MapPin size={18} /> }
              ].map((item, i) => (
                <div key={i} className="p-5 bg-[#f8f9fa] rounded-2xl border border-transparent hover:border-gray-200 transition-all flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                    <h4 className="text-sm font-bold text-secondary mt-0.5">{item.value}</h4>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Profile Editing Form */}
        <ProfileManager />
      </div>
    </DashboardLayout>
  );
}
