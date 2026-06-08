'use client';

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import SuperAdminDashboard from "@/components/features/dashboard/SuperAdminDashboard";
import OperationsAdminDashboard from "@/components/features/dashboard/OperationsAdminDashboard";
import axios from "axios";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminDashboardPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/admin/stats');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>{t('dashboardAdmin.loadingData', 'Loading Dashboard Data...')}</p>
        </div>
      </DashboardLayout>
    );
  }

  const isOpsAdmin = data?.isOperationsAdmin;

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--secondary)' }}>
          {isOpsAdmin ? 'Operations Command Center' : t('dashboardAdmin.commandCenter', 'Platform Command Center')}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          {isOpsAdmin 
            ? 'Verify documents, approve memberships, review field reports, and manage local workflows.' 
            : t('dashboardAdmin.commandCenterDesc', 'Global overview of SakhiHub operations, employees, and community growth.')}
        </p>
      </div>
      {isOpsAdmin ? (
        <OperationsAdminDashboard stats={data} />
      ) : (
        <SuperAdminDashboard stats={data} />
      )}
    </DashboardLayout>
  );
}


