'use client';

import React from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import FormsManagementContent from "@/components/features/forms/FormsManagementContent";

export default function PortalFormsPage() {
  return (
    <DashboardLayout>
      <FormsManagementContent />
    </DashboardLayout>
  );
}
