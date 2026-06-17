'use client';

import React from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import CampaignManagementContent from "@/components/features/campaigns/CampaignManagementContent";

export default function AdminCampaignsPage() {
  return (
    <DashboardLayout>
      <CampaignManagementContent />
    </DashboardLayout>
  );
}
