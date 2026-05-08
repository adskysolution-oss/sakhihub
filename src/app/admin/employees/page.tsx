'use client';

import React from "react";
import { UserCircle, MapPin, TrendingUp, Search, Plus, Edit2, Trash2 } from "lucide-react";

export default function EmployeeManagement() {
  return (
    <div style={{ padding: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: 'var(--secondary)' }}>Employee Management</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage your workforce and assign operational districts.</p>
        </div>
        <button className="btn-primary">
          <Plus size={20} /> Add New Employee
        </button>
      </div>

      <div className="glass-card" style={{ padding: '30px', background: 'white', marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#999' }} />
            <input type="text" placeholder="Search by name, ID or mobile..." style={{ padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }} />
          </div>
          <select style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd', minWidth: '150px' }}>
            <option>All Districts</option>
            <option>Varanasi</option>
            <option>Lucknow</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                <th style={{ padding: '15px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Employee Details</th>
                <th style={{ padding: '15px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Assigned Area</th>
                <th style={{ padding: '15px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Performance</th>
                <th style={{ padding: '15px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Sunita Sharma', id: 'EMP001', district: 'Varanasi', block: 'Kashi', groups: 12, members: 145, status: 'Active' },
                { name: 'Priya Verma', id: 'EMP002', district: 'Lucknow', block: 'Bakshi', groups: 10, members: 112, status: 'Active' },
                { name: 'Anjali Gupta', id: 'EMP003', district: 'Prayagraj', block: 'Civil', groups: 8, members: 98, status: 'Inactive' },
              ].map((emp, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{emp.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {emp.id}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
                      <MapPin size={14} color="var(--primary)" />
                      {emp.district} / {emp.block}
                    </div>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontSize: '0.9rem' }}>
                      <p style={{ fontWeight: '700', color: 'var(--secondary)' }}>{emp.groups} Groups</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.members} Members Added</p>
                    </div>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button style={{ padding: '8px', borderRadius: '8px', background: '#f1f5f9', border: 'none', color: '#64748b' }}><Edit2 size={16} /></button>
                      <button style={{ padding: '8px', borderRadius: '8px', background: '#fef2f2', border: 'none', color: '#ef4444' }}><Trash2 size={16} /></button>
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

