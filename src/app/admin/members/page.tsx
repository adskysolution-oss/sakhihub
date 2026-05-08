'use client';

import React from "react";
import { Users, Filter, Download, Search, CheckCircle, Clock } from "lucide-react";

export default function MemberManagement() {
  return (
    <div style={{ padding: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: 'var(--secondary)' }}>Members Directory</h2>
          <p style={{ color: 'var(--text-muted)' }}>View and manage all women members registered across groups.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" style={{ padding: '12px 20px' }}>
            <Download size={18} /> Export Excel
          </button>
          <button className="btn-primary" style={{ padding: '12px 20px' }}>
            <Download size={18} /> Export PDF
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '30px', background: 'white' }}>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#999' }} />
            <input type="text" placeholder="Search members by name or mobile..." style={{ padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }} />
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '10px', border: '1px solid #ddd', background: 'white', fontWeight: '600' }}>
            <Filter size={18} /> Filters
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                <th style={{ padding: '15px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Member Name</th>
                <th style={{ padding: '15px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Contact</th>
                <th style={{ padding: '15px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Group / Area</th>
                <th style={{ padding: '15px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Status</th>
                <th style={{ padding: '15px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Payment</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Kiran Devi', mobile: '+91 98765 43210', group: 'Sakhi Group 1', village: 'Rampur', status: 'Active', payment: 'Paid' },
                { name: 'Meena Sahani', mobile: '+91 87654 32109', group: 'Mahila Shakti', village: 'Bari', status: 'Active', payment: 'Pending' },
                { name: 'Suman Lata', mobile: '+91 76543 21098', group: 'Sakhi Group 2', village: 'Rampur', status: 'Active', payment: 'Paid' },
                { name: 'Geeta Devi', mobile: '+91 65432 10987', group: 'Sakhi Group 1', village: 'Rampur', status: 'Inactive', payment: 'Pending' },
              ].map((member, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '15px' }}>
                    <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{member.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reg: May 01, 2024</p>
                  </td>
                  <td style={{ padding: '15px', fontSize: '0.9rem' }}>{member.mobile}</td>
                  <td style={{ padding: '15px' }}>
                    <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{member.group}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member.village}</p>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem', 
                      fontWeight: '700',
                      background: member.status === 'Active' ? '#dcfce7' : '#f1f5f9',
                      color: member.status === 'Active' ? '#166534' : '#64748b'
                    }}>
                      {member.status}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', fontWeight: '700', color: member.payment === 'Paid' ? '#16a34a' : '#f59e0b' }}>
                      {member.payment === 'Paid' ? <CheckCircle size={16} /> : <Clock size={16} />}
                      {member.payment}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

