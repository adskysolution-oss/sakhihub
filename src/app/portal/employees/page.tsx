'use client';

import React from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import EmployeeManagementContent from "@/components/features/employees/EmployeeManagementContent";

export default function StaffEmployeesPage() {
  return (
    <DashboardLayout>
      <EmployeeManagementContent />
    </DashboardLayout>
  );
}
