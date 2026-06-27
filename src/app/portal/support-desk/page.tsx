'use client';

import React from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import SupportDeskContent from "@/components/features/support/SupportDeskContent";

export default function PortalSupportDeskPage() {
  return (
    <DashboardLayout>
      <SupportDeskContent mode="caller" />
    </DashboardLayout>
  );
}
