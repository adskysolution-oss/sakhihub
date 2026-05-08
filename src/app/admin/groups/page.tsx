'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { Users, MapPin, Calendar, Search, Filter, ArrowRight, ClipboardList } from "lucide-react";
import axios from "axios";

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get(`/api/groups`); // Admin can use the same groups API if authorized, or a dedicated admin one
        if (res.data.success) setGroups(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const filteredGroups = groups.filter(g => 
    g.groupName.toLowerCase().includes(search.toLowerCase()) ||
    g.village.toLowerCase().includes(search.toLowerCase()) ||
    g.block.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--secondary)' }}>Community Groups</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Global directory of all SakhiHub village units and group leaders.</p>
      </div>

      <div className="glass-card" style={{ padding: '25px', background: 'white', borderRadius: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', marginBottom: '30px' }}>
        <div style={{ position: 'relative', maxWidth: '500px' }}>
          <Search size={18} style={{ position: 'absolute', left: '15px', top: '16px', color: '#999' }} />
          <input 
            type="text" 
            placeholder="Search by group name, village or block..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '15px 15px 15px 45px', borderRadius: '15px', border: '1px solid #eee', width: '100%', outline: 'none' }} 
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading groups data...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredGroups.map((group) => (
            <div key={group._id} style={{ background: 'white', borderRadius: '24px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f5f5f5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(106, 27, 154, 0.1)', color: '#6a1b9a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={24} />
                </div>
                <span style={{ padding: '5px 12px', borderRadius: '100px', background: '#ecfdf5', color: '#059669', fontSize: '0.75rem', fontWeight: '800' }}>Active Unit</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '15px' }}>{group.groupName}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666', fontSize: '0.9rem' }}>
                  <MapPin size={16} color="var(--primary)" /> {group.village}, {group.block}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666', fontSize: '0.9rem' }}>
                  <Calendar size={16} color="var(--primary)" /> Created: {new Date(group.createdAt).toLocaleDateString()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666', fontSize: '0.9rem' }}>
                  <ClipboardList size={16} color="var(--primary)" /> Leader: {group.leaderName}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #eee', background: 'white', color: '#666', fontWeight: '700', cursor: 'pointer' }}>Edit Unit</button>
                <button style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid var(--primary)', background: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  Analytics <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
          {filteredGroups.length === 0 && (
             <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 20px', background: 'white', borderRadius: '30px' }}>
                <Users size={60} color="#eee" style={{ marginBottom: '20px' }} />
                <h3 style={{ color: '#999' }}>No community groups found in the database.</h3>
             </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
