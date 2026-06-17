'use client';

import React from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import VendorManagementContent from "@/components/features/vendors/VendorManagementContent";

export default function VendorManagement() {
  return (
    <DashboardLayout>
      <VendorManagementContent />
    </DashboardLayout>
  );
}
