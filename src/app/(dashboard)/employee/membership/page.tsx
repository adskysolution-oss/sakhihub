'use client';

import React, { useState } from 'react';
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import MembershipPaymentForm from "@/components/features/dashboard/MembershipPaymentForm";

export default function EmployeeMembershipPage() {
  const [success, setSuccess] = useState(false);

  return (
    <DashboardLayout>
      <MembershipPaymentForm onCancel={() => window.history.back()} onSuccess={() => setSuccess(true)} />
    </DashboardLayout>
  );
}
