'use client';

import React from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import GroupManagementContent from "@/components/features/groups/GroupManagementContent";

export default function AdminGroupsPage() {
  return (
    <DashboardLayout>
      <GroupManagementContent />
    </DashboardLayout>
  );
}
