'use client';

import React from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import SubVendorManagementContent from "@/components/features/sub-vendors/SubVendorManagementContent";

export default function StaffSubVendorsPage() {
  return (
    <DashboardLayout>
      <SubVendorManagementContent />
    </DashboardLayout>
  );
}
