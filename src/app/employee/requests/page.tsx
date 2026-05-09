'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { User, Phone, MapPin, Check, X, Clock, AlertCircle } from "lucide-react";
import axios from "axios";

export default function EmployeeRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('/api/employee/requests');
      if (res.data.success) setRequests(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setActionLoading(id);
    try {
      const res = await axios.patch('/api/employee/requests', { id, status });
      if (res.data.success) {
        setRequests(prev => prev.filter(r => r._id !== id));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update request");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--secondary)' }}>Member Requests</h2>
        <p style={{ color: 'var(--text-muted)' }}>Approve or reject connection requests from self-registered members in your area.</p>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading Requests...</div>
      ) : requests.length === 0 ? (
        <div style={{ padding: '80px 40px', textAlign: 'center', background: 'white', borderRadius: '30px', border: '1px dashed #ccc' }}>
          <Clock size={48} style={{ color: '#ccc', marginBottom: '15px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#666' }}>No Pending Requests</h3>
          <p style={{ color: '#999' }}>Any new members requesting to connect with you will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {requests.map((request) => (
            <div key={request._id} style={{ 
              background: 'white', padding: '25px', borderRadius: '25px', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #eee',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'var(--grad-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={30} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--secondary)' }}>{request.memberId?.fullName}</h3>
                  <div style={{ display: 'flex', gap: '20px', marginTop: '5px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#666' }}>
                      <Phone size={14} /> {request.memberId?.mobile}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#666' }}>
                      <MapPin size={14} /> {request.memberId?.area || 'Area N/A'} (Pincode: {request.pincode})
                    </span>
                  </div>
                  {request.message && (
                    <p style={{ marginTop: '10px', fontSize: '0.85rem', color: '#777', padding: '8px 12px', background: '#f8f9fa', borderRadius: '10px', borderLeft: '3px solid var(--primary)' }}>
                      " {request.message} "
                    </p>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => handleAction(request._id, 'rejected')}
                  disabled={!!actionLoading}
                  style={{ 
                    padding: '12px 20px', borderRadius: '12px', border: '1px solid #fee2e2', 
                    background: '#fef2f2', color: '#ef4444', fontWeight: '700', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  <X size={18} /> Reject
                </button>
                <button 
                  onClick={() => handleAction(request._id, 'approved')}
                  disabled={!!actionLoading}
                  style={{ 
                    padding: '12px 25px', borderRadius: '12px', border: 'none', 
                    background: '#22c55e', color: 'white', fontWeight: '700', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    boxShadow: '0 10px 20px rgba(34, 197, 94, 0.2)'
                  }}
                >
                  {actionLoading === request._id ? 'Processing...' : <><Check size={18} /> Approve</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
