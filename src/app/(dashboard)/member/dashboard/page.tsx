'use client';

import React from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";

export default function MemberPage() {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Member Dashboard...</div>;

  return (
    <DashboardLayout>
      <div className="glass-card" style={{ padding: '40px', background: 'white', borderRadius: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--secondary)' }}>
          Welcome, {user?.fullName}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '10px' }}>
          This is your community member dashboard.
        </p>
        
        <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div style={{ padding: '25px', background: 'var(--accent)', borderRadius: '20px', border: '1px solid rgba(233, 30, 99, 0.1)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>My Group</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>View your community group details.</p>
          </div>
          <div style={{ padding: '25px', background: 'white', borderRadius: '20px', border: '1px solid #eee' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--secondary)' }}>Resources</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>Access training and support materials.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
