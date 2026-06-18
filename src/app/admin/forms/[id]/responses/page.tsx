'use client';

import React from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import FormResponsesContent from "@/components/features/forms/FormResponsesContent";

export default function AdminFormResponsesPage() {
  return (
    <DashboardLayout>
      <FormResponsesContent />
    </DashboardLayout>
  );
}
