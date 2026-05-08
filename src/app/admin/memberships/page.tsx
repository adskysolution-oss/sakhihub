'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import axios from "axios";
import MembershipTable from "@/components/features/dashboard/MembershipTable";

export default function AdminMembershipsPage() {
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMemberships = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/memberships');
      if (res.data.success) setMemberships(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, []);

  const totalCollected = memberships.length * 100;

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--secondary)' }}>Membership Revenue</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Track registration fees and financial compliance across the platform.</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
           <div style={{ background: '#ecfdf5', padding: '15px 30px', borderRadius: '20px', border: '1px solid #10b981', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#059669', fontWeight: '800', textTransform: 'uppercase' }}>Total Collections</p>
              <h3 style={{ margin: '5px 0 0', fontSize: '1.5rem', fontWeight: '900', color: '#059669' }}>₹{totalCollected.toLocaleString()}</h3>
           </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '30px', background: 'white', borderRadius: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', marginBottom: '30px' }}>
        {loading ? (
          <p style={{ padding: '40px', textAlign: 'center' }}>Syncing revenue data...</p>
        ) : memberships.length === 0 ? (
          <p style={{ padding: '40px', textAlign: 'center' }}>No membership records found.</p>
        ) : (
          <MembershipTable data={memberships} isAdmin={true} onUpdate={fetchMemberships} />
        )}
      </div>
    </DashboardLayout>
  );
}
