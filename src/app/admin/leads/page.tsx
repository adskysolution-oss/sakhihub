'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Filter, Mail, Phone, MapPin, MoreVertical, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function LeadsManagement() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setLeads(data || []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', id);

    if (error) alert("Failed to update status");
    else fetchLeads();
  }

  const filteredLeads = filter === 'All' ? leads : leads.filter(l => l.interested_in === filter);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: 'var(--secondary)' }}>Leads & Inquiries</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage all incoming messages and registrations.</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#999' }} />
            <input type="text" placeholder="Search leads..." style={{ padding: '10px 15px 10px 40px', borderRadius: '10px', border: '1px solid #eee' }} />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '10px 15px', borderRadius: '10px', border: '1px solid #eee' }}>
            <option value="All">All Inquiries</option>
            <option value="Campaign">Campaign</option>
            <option value="NGO">NGO Partnership</option>
            <option value="Bulk Inquiry">Bulk Inquiry</option>
            <option value="Employee">Hiring</option>
          </select>
        </div>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden', background: 'white' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #eee' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '20px', fontSize: '0.85rem', fontWeight: '800' }}>DATE</th>
              <th style={{ textAlign: 'left', padding: '20px', fontSize: '0.85rem', fontWeight: '800' }}>NAME & CONTACT</th>
              <th style={{ textAlign: 'left', padding: '20px', fontSize: '0.85rem', fontWeight: '800' }}>INTERESTED IN</th>
              <th style={{ textAlign: 'left', padding: '20px', fontSize: '0.85rem', fontWeight: '800' }}>STATUS</th>
              <th style={{ textAlign: 'left', padding: '20px', fontSize: '0.85rem', fontWeight: '800' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '50px' }}>Loading leads...</td></tr>
            ) : filteredLeads.map((lead) => (
              <tr key={lead.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={{ padding: '20px', fontSize: '0.85rem', color: '#666' }}>
                  {new Date(lead.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '20px' }}>
                  <p style={{ fontWeight: '700', marginBottom: '5px' }}>{lead.full_name}</p>
                  <div style={{ display: 'flex', gap: '15px', color: '#888', fontSize: '0.8rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {lead.mobile}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {lead.district}</span>
                  </div>
                </td>
                <td style={{ padding: '20px' }}>
                  <span style={{ padding: '5px 12px', background: '#FFF5F8', color: 'var(--primary)', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800' }}>
                    {lead.interested_in}
                  </span>
                </td>
                <td style={{ padding: '20px' }}>
                  <select 
                    value={lead.status} 
                    onChange={(e) => updateStatus(lead.id, e.target.value)}
                    style={{ 
                      padding: '6px 12px', 
                      borderRadius: '8px', 
                      border: '1px solid #eee',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      color: lead.status === 'Converted' ? '#10b981' : lead.status === 'Rejected' ? '#ef4444' : '#f59e0b'
                    }}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Interested">Interested</option>
                    <option value="Converted">Converted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
                <td style={{ padding: '20px' }}>
                  <button onClick={() => alert(lead.message)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }}>View Msg</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
