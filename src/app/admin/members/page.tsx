'use client';

import React from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import MemberManagementContent from "@/components/features/members/MemberManagementContent";

export default function MemberManagement() {
  return (
    <DashboardLayout>
      <MemberManagementContent />
    </DashboardLayout>
  );
}
