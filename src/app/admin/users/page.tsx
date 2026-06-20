'use client';

import React from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import UserManagementContent from "@/components/features/users/UserManagementContent";

export default function UserManagementPage() {
  return (
    <DashboardLayout>
      <UserManagementContent />
    </DashboardLayout>
  );
}
