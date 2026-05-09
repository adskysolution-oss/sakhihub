'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { 
  Users, Filter, Download, Search, CheckCircle, 
  Clock, MapPin, ShieldCheck, UserCircle, MessageSquare, Phone
} from "lucide-react";
import axios from "axios";

export default function MemberManagement() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/members?search=${search}`);
      if (res.data.success) setMembers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <DashboardLayout>
      <div style={{ padding: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--secondary)' }}>Members Directory</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Global registry of all women members and their membership compliance.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" style={{ padding: '12px 25px' }}>
              <Download size={18} /> Export Excel
            </button>
            <button className="btn-primary" style={{ padding: '12px 25px' }}>
              <Download size={18} /> Export PDF
            </button>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '30px', background: 'white', borderRadius: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '15px', top: '16px', color: '#999' }} />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by member name, mobile or village..." 
                style={{ padding: '15px 15px 15px 45px', borderRadius: '15px', border: '1px solid #eee', width: '100%', outline: 'none' }} 
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f8f9fa' }}>
                  <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Member Details</th>
                  <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Contact & Location</th>
                  <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Assigned Employee</th>
                  <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Status & Group</th>
                  <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Payment</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Loading members from database...</td></tr>
                ) : members.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No members found in the platform registry.</td></tr>
                ) : (
                  members.map((member) => (
                    <tr key={member._id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                      <td style={{ padding: '15px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FFF5F8', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                            {member.name[0]}
                          </div>
                          <div>
                            <p style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--secondary)', margin: 0 }}>{member.name}</p>
                            <p style={{ fontSize: '0.75rem', color: '#999', margin: '2px 0 0' }}>ID: {member.membershipId || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} color="var(--primary)" /> {member.mobile}</span>
                          <span style={{ fontSize: '0.8rem', color: '#666', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} color="var(--primary)" /> {member.block}, {member.district} ({member.pincode})
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        {member.assignedEmployeeId ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <p style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--secondary)', margin: 0 }}>{member.assignedEmployeeId.fullName}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700', margin: 0 }}>ID: {member.assignedEmployeeId.employeeId}</p>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#999', fontStyle: 'italic' }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <span style={{ 
                            padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800',
                            background: member.connectionStatus === 'approved' ? '#ecfdf5' : member.connectionStatus === 'unassigned' ? '#f3f4f6' : '#fffbeb',
                            color: member.connectionStatus === 'approved' ? '#059669' : member.connectionStatus === 'unassigned' ? '#6b7280' : '#d97706',
                            width: 'fit-content', textTransform: 'uppercase'
                          }}>
                            {member.connectionStatus || 'unassigned'}
                          </span>
                          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: member.groupId ? 'var(--secondary)' : '#999' }}>
                            {member.groupId?.groupName || 'No Group'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          fontSize: '0.85rem', 
                          fontWeight: '800', 
                          color: member.membershipStatus === 'paid' ? '#059669' : '#d97706',
                          background: member.membershipStatus === 'paid' ? '#ecfdf5' : '#fffbeb',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          width: 'fit-content'
                        }}>
                          {member.membershipStatus === 'paid' ? <CheckCircle size={16} /> : <Clock size={16} />}
                          {(member.membershipStatus || 'free').toUpperCase()}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
