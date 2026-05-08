'use client';

import React from 'react';
import { CreditCard, FileText, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface MembershipTableProps {
  data: any[];
  isAdmin?: boolean;
}

export default function MembershipTable({ data, isAdmin = false }: MembershipTableProps) {
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
                <Link href={`/member/receipt/${m._id}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--primary)', fontWeight: '800', textDecoration: 'none', fontSize: '0.85rem' }}>
                  <FileText size={16} /> Receipt
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
