'use client';

import React from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import ReportManagementContent from "@/components/features/reports/ReportManagementContent";

export default function StaffReportsPage() {
  return (
    <DashboardLayout>
      <ReportManagementContent />
    </DashboardLayout>
  );
}
