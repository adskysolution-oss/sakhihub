'use client';

import React from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import EmployeeDashboard from "@/components/features/dashboard/EmployeeDashboard";
import { useAuth } from "@/hooks/useAuth";

export default function EmployeePage() {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Employee Dashboard...</div>;

  return (
    <DashboardLayout>
      <EmployeeDashboard user={user} />
    </DashboardLayout>
  );
}

