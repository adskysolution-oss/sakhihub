'use client';

import React from 'react';
import { CreditCard, FileText, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

interface MembershipTableProps {
  data: any[];
  isAdmin?: boolean;
  onUpdate?: () => void;
}

export default function MembershipTable({ data, isAdmin = false, onUpdate }: MembershipTableProps) {
  const handleVerify = async (id: string, status: 'Paid' | 'Failed') => {
    if (!confirm(`Are you sure you want to mark this as ${status}?`)) return;
    try {
      const res = await axios.patch(`/api/memberships/${id}`, { status });
      if (res.data.success) {
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #f8f9fa' }}>
            <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Member / Group</th>
            <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Receipt Info</th>
            <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Amount</th>
            <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Mode</th>
            {isAdmin && <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Employee</th>}
            <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Status</th>
            <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((m) => (
            <tr key={m._id} style={{ borderBottom: '1px solid #f8f9fa' }}>
              <td style={{ padding: '15px 20px' }}>
                <p style={{ margin: 0, fontWeight: '800', color: 'var(--secondary)' }}>{m.memberId?.name}</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#999' }}>{m.groupId?.groupName || 'No Group'}</p>
              </td>
              <td style={{ padding: '15px 20px' }}>
                <p style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem' }}>{m.receiptNumber}</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#999' }}>{new Date(m.paymentDate).toLocaleDateString()}</p>
              </td>
              <td style={{ padding: '15px 20px' }}>
                <span style={{ fontWeight: '900', color: '#10b981' }}>₹{m.amount}</span>
              </td>
              <td style={{ padding: '15px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#666', fontWeight: '700' }}>
                  <CreditCard size={14} /> {m.paymentMode}
                </div>
              </td>
              {isAdmin && (
                <td style={{ padding: '15px 20px' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700' }}>{m.employeeId?.fullName || 'System'}</p>
                </td>
              )}
              <td style={{ padding: '15px 20px' }}>
                <span style={{ 
                  padding: '5px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '800',
                  background: m.paymentStatus === 'Paid' ? '#f0fdf4' : m.paymentStatus === 'Failed' ? '#fef2f2' : '#fffbeb',
                  color: m.paymentStatus === 'Paid' ? '#16a34a' : m.paymentStatus === 'Failed' ? '#ef4444' : '#d97706'
                }}>
                  {m.paymentStatus.toUpperCase()}
                </span>
              </td>
              <td style={{ padding: '15px 20px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <Link href={`/member/receipt/${m._id}`} target="_blank" style={{ color: 'var(--primary)', fontWeight: '800', textDecoration: 'none', fontSize: '0.8rem' }}>
                    Receipt
                  </Link>
                  {isAdmin && m.paymentStatus !== 'Paid' && (
                    <>
                      <button onClick={() => handleVerify(m._id, 'Paid')} style={{ padding: '5px 10px', borderRadius: '8px', border: 'none', background: '#16a34a', color: 'white', fontWeight: '800', fontSize: '0.7rem', cursor: 'pointer' }}>Verify</button>
                      <button onClick={() => handleVerify(m._id, 'Failed')} style={{ padding: '5px 10px', borderRadius: '8px', border: '1px solid #ef4444', background: 'white', color: '#ef4444', fontWeight: '800', fontSize: '0.7rem', cursor: 'pointer' }}>Reject</button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
