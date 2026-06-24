'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { Search, Calendar, MapPin, ShieldAlert, Eye, Clock, Image } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function AdminAttendanceLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));
  const [searchEmployee, setSearchEmployee] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/hrms/attendance?date=${dateFilter}&status=${statusFilter}`
      );
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [dateFilter, statusFilter]);

  // Filter logs locally by employee name search
  const filteredLogs = logs.filter(log => {
    const employee = log.employeeId;
    if (!employee) return false;
    const name = employee.fullName || '';
    const mobile = employee.mobile || '';
    const code = employee.employeeId || '';
    const q = searchEmployee.toLowerCase();
    return name.toLowerCase().includes(q) || mobile.includes(q) || code.toLowerCase().includes(q);
  });

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Header */}
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--secondary)' }}>Employee Attendance Logs</h2>
          <p style={{ color: '#888' }}>Monitor real-time geotagged check-ins, verify selfies, and identify missing check-outs.</p>
        </div>

        {/* Filters Panel */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }} className="max-sm:flex-col max-sm:items-stretch">
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              type="text"
              placeholder="Search employee by name, mobile, ID..."
              value={searchEmployee}
              onChange={(e) => setSearchEmployee(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 46px', borderRadius: '16px', border: '1px solid #eee', background: 'white', fontSize: '0.9rem' }}
            />
          </div>
          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ padding: '12px 16px', borderRadius: '16px', border: '1px solid #eee', background: 'white', fontSize: '0.9rem', fontWeight: '800', color: 'var(--secondary)' }}
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '12px 20px', borderRadius: '16px', border: '1px solid #eee', background: 'white', fontSize: '0.9rem', fontWeight: '800', color: 'var(--secondary)' }}
            >
              <option value="all">All Statuses</option>
              <option value="Checked In">Currently Checked In</option>
              <option value="Checked Out">Checked Out</option>
              <option value="Checkout Missing">Checkout Missing</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div style={{ padding: '30px', background: 'white', borderRadius: '32px', border: '1px solid #f5f5f5', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
          {loading ? (
            <p>Loading attendance logs...</p>
          ) : filteredLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
              <Clock size={48} style={{ color: '#eee', marginBottom: '15px' }} />
              <p style={{ fontStyle: 'italic' }}>No attendance logs found for this date.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '950px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f5f5f5', textAlign: 'left' }}>
                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: '800', color: '#aaa', textTransform: 'uppercase' }}>Employee</th>
                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: '800', color: '#aaa', textTransform: 'uppercase' }}>Selfie</th>
                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: '800', color: '#aaa', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: '800', color: '#aaa', textTransform: 'uppercase' }}>Check-In details</th>
                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: '800', color: '#aaa', textTransform: 'uppercase' }}>Check-Out details</th>
                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: '800', color: '#aaa', textTransform: 'uppercase' }}>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => {
                    const emp = log.employeeId;
                    return (
                      <tr key={log._id} style={{ borderBottom: '1px solid #fafafa' }}>
                        <td style={{ padding: '15px 12px' }}>
                          {emp ? (
                            <div>
                              <p style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--secondary)' }}>{emp.fullName}</p>
                              <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>{emp.employeeId || 'STF'} | {emp.designation}</p>
                              <p style={{ fontSize: '0.7rem', color: '#aaa', marginTop: '2.5px' }}>{emp.block}, {emp.district}</p>
                            </div>
                          ) : (
                            <span style={{ color: '#aaa', fontStyle: 'italic' }}>Unknown User</span>
                          )}
                        </td>
                        <td style={{ padding: '15px 12px' }}>
                          {log.checkInPhoto?.url ? (
                            <a href={log.checkInPhoto.url} target="_blank" rel="noopener noreferrer">
                              <img
                                src={log.checkInPhoto.url}
                                alt="Selfie Check-in"
                                style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #ddd', cursor: 'pointer' }}
                                title="Click to view full photo"
                              />
                            </a>
                          ) : (
                            <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                              <Image size={18} />
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '15px 12px' }}>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '800',
                            padding: '5px 10px',
                            borderRadius: '8px',
                            textTransform: 'uppercase',
                            background: log.attendanceStatus === 'Checked Out' ? '#e8f5e9' : log.attendanceStatus === 'Checked In' ? '#e3f2fd' : '#ffebee',
                            color: log.attendanceStatus === 'Checked Out' ? '#2e7d32' : log.attendanceStatus === 'Checked In' ? '#1565c0' : '#c62828',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {log.attendanceStatus === 'Checkout Missing' && <ShieldAlert size={10} />}
                            {log.attendanceStatus}
                          </span>
                        </td>
                        <td style={{ padding: '15px 12px', fontSize: '0.85rem' }}>
                          {log.checkInTime ? (
                            <div>
                              <p style={{ fontWeight: '800', color: 'var(--secondary)' }}>{new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '3px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.checkInLocation?.address}>
                                <MapPin size={10} color="var(--primary)" /> {log.checkInLocation?.address || 'No Address'}
                              </p>
                              <p style={{ fontSize: '0.7rem', color: '#999', marginTop: '2px' }}>Accuracy: ±{log.checkInLocation?.accuracy?.toFixed(1) || '0'}m</p>
                            </div>
                          ) : (
                            <span style={{ color: '#ccc' }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: '15px 12px', fontSize: '0.85rem' }}>
                          {log.checkOutTime ? (
                            <div>
                              <p style={{ fontWeight: '800', color: 'var(--secondary)' }}>{new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '3px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.checkOutLocation?.address}>
                                <MapPin size={10} color="var(--primary)" /> {log.checkOutLocation?.address || 'No Address'}
                              </p>
                              <p style={{ fontSize: '0.7rem', color: '#999', marginTop: '2px' }}>Accuracy: ±{log.checkOutLocation?.accuracy?.toFixed(1) || '0'}m</p>
                            </div>
                          ) : log.attendanceStatus === 'Checkout Missing' ? (
                            <span style={{ color: '#c62828', fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldAlert size={12} /> Checkout Missing</span>
                          ) : (
                            <span style={{ color: '#ccc' }}>Active Duty...</span>
                          )}
                        </td>
                        <td style={{ padding: '15px 12px', fontSize: '0.9rem', fontWeight: '900', color: 'var(--primary)' }}>
                          {log.workingHours !== undefined ? `${log.workingHours} hrs` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
