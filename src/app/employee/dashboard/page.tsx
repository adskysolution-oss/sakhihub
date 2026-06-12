'use client';

import React from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import EmployeeDashboard from "@/components/features/dashboard/EmployeeDashboard";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/context/LanguageContext";

export default function EmployeePage() {
  const { t } = useLanguage();
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>{t('employeeDashboard.loadingDashboard', 'Loading Employee Dashboard...')}</div>;

  return (
    <DashboardLayout>
      <EmployeeDashboard user={user} />
    </DashboardLayout>
  );
}

