'use client';

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import PermissionEnabledDashboard from "@/components/features/dashboard/OperationsAdminDashboard";
import axios from "axios";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { ShieldAlert, RefreshCw } from "lucide-react";
import DigitalIdWidget from "@/components/features/dashboard/DigitalIdWidget";

export default function StaffDashboardPage() {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const hasPermissions = user?.permissions && user.permissions.length > 0;

  useEffect(() => {
    if (authLoading) return;
    if (!user || !hasPermissions) {
      setStatsLoading(false);
      return;
    }

    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const res = await axios.get('/api/admin/stats');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [user, authLoading, hasPermissions]);

  if (authLoading || (hasPermissions && statsLoading)) {
    return (
      <DashboardLayout>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 font-semibold">{t('dashboardAdmin.loadingData', 'Loading Dashboard Data...')}</p>
        </div>
      </DashboardLayout>
    );
  }

  // Zero Permission State Card
  if (!hasPermissions) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white rounded-[32px] p-8 text-center border border-gray-100 shadow-soft max-w-2xl mx-auto my-8">
          <div className="w-20 h-20 bg-rose-50 rounded-[24px] flex items-center justify-center text-primary mb-6 border border-rose-100 shadow-inner">
            <ShieldAlert size={36} />
          </div>
          <h2 className="text-3xl font-black text-secondary mb-3">
            {t('dashboardStaff.awaitingAssignmentTitle', 'Awaiting Permission Assignment')}
          </h2>
          <p className="text-gray-500 font-bold mb-8 max-w-md mx-auto leading-relaxed">
            Your account has been approved.<br />
            Administrative permissions have not yet been assigned.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary py-4 px-8 flex items-center gap-2"
          >
            <RefreshCw size={16} /> {t('dashboardStaff.checkAgain', 'Check Again')}
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--secondary)' }}>
          {t('dashboardStaff.title', 'Staff Operations Command Center')}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          {t('dashboardStaff.description', 'Verify documents, review field reports, and manage regional operations.')}
        </p>
      </div>

      <div className="mb-8">
        <DigitalIdWidget user={user} />
      </div>

      <PermissionEnabledDashboard stats={data} />
    </DashboardLayout>
  );
}
