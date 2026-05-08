'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import axios from "axios";
import MembershipTable from "@/components/features/dashboard/MembershipTable";

export default function AdminMembershipsPage() {
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");

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

  const filteredMemberships = memberships.filter(m => {
    const matchesStatus = filterStatus === "all" || m.paymentStatus === filterStatus;
    const matchesMonth = filterMonth === "all" || new Date(m.paymentDate).getMonth().toString() === filterMonth;
    return matchesStatus && matchesMonth;
  });

  const totalCollected = filteredMemberships.filter(m => m.paymentStatus === 'Paid').length * 100;

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--secondary)' }}>Membership Revenue</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Track registration fees and financial compliance across the platform.</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
           <div style={{ background: '#ecfdf5', padding: '15px 30px', borderRadius: '20px', border: '1px solid #10b981', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#059669', fontWeight: '800', textTransform: 'uppercase' }}>Filtered Collections</p>
              <h3 style={{ margin: '5px 0 0', fontSize: '1.5rem', fontWeight: '900', color: '#059669' }}>₹{totalCollected.toLocaleString()}</h3>
           </div>
        </div>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '20px', marginBottom: '30px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: '12px 15px', borderRadius: '12px', border: '1px solid #eee', background: 'white', fontWeight: '700', outline: 'none' }}
        >
          <option value="all">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>
        
        <select 
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          style={{ padding: '12px 15px', borderRadius: '12px', border: '1px solid #eee', background: 'white', fontWeight: '700', outline: 'none' }}
        >
          <option value="all">All Months</option>
          {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month, idx) => (
            <option key={month} value={idx.toString()}>{month}</option>
          ))}
        </select>
      </div>

      <div className="glass-card" style={{ padding: '30px', background: 'white', borderRadius: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', marginBottom: '30px', overflowX: 'auto' }}>
        {loading ? (
          <p style={{ padding: '40px', textAlign: 'center' }}>Syncing revenue data...</p>
        ) : filteredMemberships.length === 0 ? (
          <p style={{ padding: '40px', textAlign: 'center' }}>No matching records found.</p>
        ) : (
          <div style={{ minWidth: '800px' }}>
            <MembershipTable data={filteredMemberships} isAdmin={true} onUpdate={fetchMemberships} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
