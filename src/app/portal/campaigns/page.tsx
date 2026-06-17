'use client';

import React from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import CampaignManagementContent from "@/components/features/campaigns/CampaignManagementContent";

export default function StaffCampaignsPage() {
  return (
    <DashboardLayout>
      <CampaignManagementContent />
    </DashboardLayout>
  );
}
