'use client';

import React from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import SubVendorManagementContent from "@/components/features/sub-vendors/SubVendorManagementContent";

export default function SubVendorManagement() {
  return (
    <DashboardLayout>
      <SubVendorManagementContent />
    </DashboardLayout>
  );
}
