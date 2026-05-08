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
                  <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Contact</th>
                  <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Group / Area</th>
                  <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Status</th>
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
                            <p style={{ fontSize: '0.75rem', color: '#999', margin: '2px 0 0' }}>Reg ID: {member.membershipId}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} color="var(--primary)" /> {member.mobile}</span>
                          {member.whatsapp && <span style={{ fontSize: '0.8rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}><MessageSquare size={14} /> {member.whatsapp}</span>}
                        </div>
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <p style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--secondary)', margin: 0 }}>{member.groupId?.groupName || 'Direct Member'}</p>
                          <p style={{ fontSize: '0.8rem', color: '#666', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} color="var(--primary)" /> {member.village}
                          </p>
                        </div>
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <span style={{ 
                          padding: '6px 12px', 
                          borderRadius: '8px', 
                          fontSize: '0.75rem', 
                          fontWeight: '800',
                          background: '#ecfdf5',
                          color: '#059669',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          width: 'fit-content'
                        }}>
                          <ShieldCheck size={14} /> ACTIVE
                        </span>
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          fontSize: '0.85rem', 
                          fontWeight: '800', 
                          color: member.paymentStatus === 'Paid' ? '#059669' : '#d97706',
                          background: member.paymentStatus === 'Paid' ? '#ecfdf5' : '#fffbeb',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          width: 'fit-content'
                        }}>
                          {member.paymentStatus === 'Paid' ? <CheckCircle size={16} /> : <Clock size={16} />}
                          {member.paymentStatus.toUpperCase()}
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
