'use client';

import React from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import NetworkContent from '@/components/features/network/NetworkContent';

export default function AdminNetworkPage() {
  return (
    <DashboardLayout>
      <NetworkContent />
    </DashboardLayout>
  );
}
