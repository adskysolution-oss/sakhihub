'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { Search, Calendar, MapPin, ClipboardCheck, ArrowUpRight, Image } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function AdminFieldReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmployee, setSearchEmployee] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [blockFilter, setBlockFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      let url = `/api/hrms/reports?district=${districtFilter}&block=${blockFilter}`;
      if (dateFilter) url += `&date=${dateFilter}`;

      const res = await axios.get(url);
      if (res.data.success) {
        setReports(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load daily field reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [districtFilter, blockFilter, dateFilter]);

  // Client-side local filtering for employee search
  const filteredReports = reports.filter(rep => {
    const emp = rep.employeeId;
    if (!emp) return false;
    const name = emp.fullName || '';
    const mobile = emp.mobile || '';
    const code = emp.employeeId || '';
    const q = searchEmployee.toLowerCase();
    return name.toLowerCase().includes(q) || mobile.includes(q) || code.toLowerCase().includes(q);
  });

  // Extract unique districts and blocks for filters dropdown
  const uniqueDistricts = Array.from(new Set(reports.map(r => r.district).filter(Boolean)));
  const uniqueBlocks = Array.from(new Set(reports.map(r => r.block).filter(Boolean)));

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Header */}
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--secondary)' }}>Field Reports Monitor</h2>
          <p style={{ color: '#888' }}>Review submitted daily summaries, verify field evidence photographs, and track coverage.</p>
        </div>

        {/* Filters */}
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
            <select
              value={districtFilter}
              onChange={(e) => {
                setDistrictFilter(e.target.value);
                setBlockFilter('all'); // Reset block
              }}
              style={{ padding: '12px 16px', borderRadius: '16px', border: '1px solid #eee', background: 'white', fontSize: '0.9rem', fontWeight: '800', color: 'var(--secondary)' }}
            >
              <option value="all">All Districts</option>
              {uniqueDistricts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <select
              value={blockFilter}
              onChange={(e) => setBlockFilter(e.target.value)}
              style={{ padding: '12px 16px', borderRadius: '16px', border: '1px solid #eee', background: 'white', fontSize: '0.9rem', fontWeight: '800', color: 'var(--secondary)' }}
            >
              <option value="all">All Blocks</option>
              {uniqueBlocks.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ padding: '12px 16px', borderRadius: '16px', border: '1px solid #eee', background: 'white', fontSize: '0.9rem', fontWeight: '800', color: 'var(--secondary)' }}
            />
          </div>
        </div>

        {/* Reports List */}
        <div style={{ padding: '30px', background: 'white', borderRadius: '32px', border: '1px solid #f5f5f5', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
          {loading ? (
            <p>Loading reports...</p>
          ) : filteredReports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
              <ClipboardCheck size={48} style={{ color: '#eee', marginBottom: '15px' }} />
              <p style={{ fontStyle: 'italic' }}>No daily field reports submitted matching the filter criteria.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {filteredReports.map((report) => {
                const emp = report.employeeId;
                return (
                  <div key={report._id} style={{ padding: '25px', background: '#fafafa', borderRadius: '28px', border: '1px solid #eee' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1.2fr', gap: '20px', alignItems: 'center' }} className="max-md:grid-cols-1">
                      {/* Left: Employee details */}
                      <div>
                        {emp ? (
                          <div>
                            <p style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--secondary)' }}>{emp.fullName}</p>
                            <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>{emp.employeeId || 'STF'} | {emp.designation}</p>
                            <p style={{ fontSize: '0.7rem', color: '#999', marginTop: '2.5px' }}><MapPin size={10} style={{ display: 'inline', marginRight: '2px' }} /> {report.village}, {report.block}, {report.district}</p>
                          </div>
                        ) : (
                          <span style={{ color: '#aaa', fontStyle: 'italic' }}>Unknown Employee</span>
                        )}
                      </div>

                      {/* Middle: Metrics counts */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', textAlign: 'center', background: 'white', padding: '15px', borderRadius: '20px', border: '1px solid #f0f0f0' }}>
                        <div>
                          <p style={{ fontSize: '0.7rem', color: '#888', fontWeight: '800', textTransform: 'uppercase' }}>Meetings</p>
                          <p style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--secondary)', marginTop: '2px' }}>{report.meetingCount}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.7rem', color: '#888', fontWeight: '800', textTransform: 'uppercase' }}>Groups Formed</p>
                          <p style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--secondary)', marginTop: '2px' }}>{report.groupsFormed}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.7rem', color: '#888', fontWeight: '800', textTransform: 'uppercase' }}>Members Added</p>
                          <p style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--secondary)', marginTop: '2px' }}>{report.membersAdded}</p>
                        </div>
                      </div>

                      {/* Right: Date, upload file links, evidence photos */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }} className="max-md:items-start">
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#666', background: '#eee', padding: '4px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} /> {new Date(report.reportDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        
                        {report.photos?.length > 0 && (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '5px' }}>
                            {report.photos.map((photoUrl: string, idx: number) => (
                              <a key={idx} href={photoUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={photoUrl}
                                  alt="Report Evidence"
                                  style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #ddd', cursor: 'pointer' }}
                                />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {report.remarks && (
                      <div style={{ borderTop: '1px solid #eee', marginTop: '15px', paddingTop: '12px', fontSize: '0.85rem', color: '#555' }}>
                        <strong>Remarks & Observations:</strong> {report.remarks}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
