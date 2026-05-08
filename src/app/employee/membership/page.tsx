'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import MembershipTable from "@/components/features/dashboard/MembershipTable";
import MembershipPaymentForm from "@/components/features/dashboard/MembershipPaymentForm";
import { IndianRupee, History, Plus, CheckCircle } from 'lucide-react';
import axios from 'axios';

export default function EmployeeMembershipPage() {
  const [view, setView] = useState<'history' | 'collect'>('history');
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

  if (view === 'collect') {
    return (
      <DashboardLayout>
        <MembershipPaymentForm 
          onCancel={() => setView('history')} 
          onSuccess={() => { setView('history'); fetchMemberships(); }} 
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--secondary)' }}>Membership Collections</h2>
          <p style={{ color: 'var(--text-muted)' }}>Track and manage all membership fees collected from your groups.</p>
        </div>
        <button onClick={() => setView('collect')} className="btn-primary" style={{ gap: '10px' }}>
          <Plus size={20} /> Collect New Fee
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: 'white', padding: '30px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: '1px solid #f5f5f5' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, color: '#666', fontWeight: '700', fontSize: '0.9rem' }}>Total Collections</p>
                <h3 style={{ fontSize: '2rem', fontWeight: '900', margin: '5px 0', color: 'var(--secondary)' }}>₹{(memberships.length * 100).toLocaleString()}</h3>
              </div>
              <div style={{ width: '50px', height: '50px', background: '#f0fdf4', color: '#10b981', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IndianRupee size={24} />
              </div>
           </div>
        </div>
        <div style={{ background: 'white', padding: '30px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: '1px solid #f5f5f5' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, color: '#666', fontWeight: '700', fontSize: '0.9rem' }}>Members Activated</p>
                <h3 style={{ fontSize: '2rem', fontWeight: '900', margin: '5px 0', color: 'var(--secondary)' }}>{memberships.length}</h3>
              </div>
              <div style={{ width: '50px', height: '50px', background: 'rgba(106, 27, 154, 0.1)', color: '#6a1b9a', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={24} />
              </div>
           </div>
        </div>
      </div>

      <div className="glass-card" style={{ background: 'white', padding: '30px', borderRadius: '30px' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <History size={22} color="var(--primary)" /> Collection History
        </h3>
        
        {loading ? (
          <p>Loading collections...</p>
        ) : memberships.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '50px', color: '#999' }}>No collections found.</p>
        ) : (
          <MembershipTable data={memberships} />
        )}
      </div>
    </DashboardLayout>
  );
}
