'use client';

import React from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import ProfileManager from "@/components/features/profile/ProfileManager";

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="mb-10">
        <h1 className="text-4xl font-black text-secondary tracking-tight">My Profile</h1>
        <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-xs">Manage your personal information and organization settings</p>
      </div>
      <ProfileManager />
    </DashboardLayout>
  );
}
