'use client';

import React, { Suspense } from 'react';
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import FormBuilderContent from "@/components/features/forms/FormBuilderContent";

export default function PortalBuilderPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="p-12 text-center">Loading Builder...</div>}>
        <FormBuilderContent />
      </Suspense>
    </DashboardLayout>
  );
}
