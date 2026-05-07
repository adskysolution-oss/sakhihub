'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart3, MapPin, Download, Search, TrendingUp, Users, Target } from 'lucide-react';

export default function RegionalReports() {
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRegionalData();
  }, []);

  async function fetchRegionalData() {
    setLoading(true);
    // Aggregate leads and members by state/district
    const { data, error } = await supabase
      .from('leads')
      .select('state, district, interested_in, status');

    if (error) {
      console.error(error);
    } else {
      // Grouping logic
      const grouped: Record<string, any> = {};
      data?.forEach(lead => {
        const key = `${lead.state}-${lead.district}`;
        if (!grouped[key]) {
          grouped[key] = { 
            state: lead.state || 'Unknown', 
            district: lead.district || 'Unknown', 
            total_leads: 0, 
            converted: 0,
            types: {} 
          };
        }
        grouped[key].total_leads += 1;
        if (lead.status === 'Converted') grouped[key].converted += 1;
        
        const type = lead.interested_in || 'General';
        grouped[key].types[type] = (grouped[key].types[type] || 0) + 1;
      });
      setReportData(Object.values(grouped));
    }
    setLoading(false);
  }

  const filteredData = reportData.filter(r => 
    r.state.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: 'var(--secondary)' }}>Regional Impact Reports</h2>
          <p style={{ color: 'var(--text-muted)' }}>Detailed breakdown of leads and conversion rates by district.</p>
        </div>
        <button className="btn-primary" style={{ padding: '12px 25px' }}>
          <Download size={18} style={{ marginRight: '10px' }} /> Export CSV
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '40px' }}>
        <div className="glass-card" style={{ padding: '25px', background: 'white' }}>
          <div style={{ color: 'var(--primary)', marginBottom: '15px' }}><TrendingUp size={30} /></div>
          <p style={{ color: '#666', fontSize: '0.85rem' }}>Top Performing State</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Uttar Pradesh</h3>
        </div>
        <div className="glass-card" style={{ padding: '25px', background: 'white' }}>
          <div style={{ color: '#10b981', marginBottom: '15px' }}><Target size={30} /></div>
          <p style={{ color: '#666', fontSize: '0.85rem' }}>Avg. Conversion Rate</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>14.5%</h3>
        </div>
        <div className="glass-card" style={{ padding: '25px', background: 'white' }}>
          <div style={{ color: '#3b82f6', marginBottom: '15px' }}><Users size={30} /></div>
          <p style={{ color: '#666', fontSize: '0.85rem' }}>Active Districts</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{reportData.length}</h3>
        </div>
      </div>

      <div className="glass-card" style={{ background: 'white', padding: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
          <div style={{ position: 'relative', width: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '15px', top: '12px', color: '#999' }} />
            <input 
              type="text" 
              placeholder="Filter by state or district..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 15px 12px 45px', borderRadius: '12px', border: '1px solid #eee' }} 
            />
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #eee', background: 'white', fontWeight: '700' }}>State Wise</button>
            <button style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #eee', background: 'white', fontWeight: '700' }}>District Wise</button>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
              <th style={{ padding: '15px', fontSize: '0.85rem', color: '#64748b' }}>STATE / DISTRICT</th>
              <th style={{ padding: '15px', fontSize: '0.85rem', color: '#64748b' }}>TOTAL LEADS</th>
              <th style={{ padding: '15px', fontSize: '0.85rem', color: '#64748b' }}>CONVERTED</th>
              <th style={{ padding: '15px', fontSize: '0.85rem', color: '#64748b' }}>CONV. RATE</th>
              <th style={{ padding: '15px', fontSize: '0.85rem', color: '#64748b' }}>INTEREST MIX</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '50px' }}>Loading report data...</td></tr>
            ) : filteredData.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '20px' }}>
                  <p style={{ fontWeight: '700', marginBottom: '4px' }}>{row.district}</p>
                  <p style={{ fontSize: '0.8rem', color: '#999' }}><MapPin size={12} /> {row.state}</p>
                </td>
                <td style={{ padding: '20px', fontWeight: '700' }}>{row.total_leads}</td>
                <td style={{ padding: '20px', color: '#10b981', fontWeight: '700' }}>{row.converted}</td>
                <td style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '60px', height: '6px', background: '#f1f5f9', borderRadius: '10px' }}>
                      <div style={{ width: `${(row.converted/row.total_leads)*100}%`, height: '100%', background: '#10b981', borderRadius: '10px' }}></div>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{Math.round((row.converted/row.total_leads)*100)}%</span>
                  </div>
                </td>
                <td style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {Object.entries(row.types).map(([type, count]: [any, any]) => (
                      <span key={type} title={`${type}: ${count}`} style={{ padding: '4px 8px', background: '#f1f5f9', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700' }}>
                        {type.charAt(0)}:{count}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
