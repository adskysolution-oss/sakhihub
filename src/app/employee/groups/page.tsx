'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import CreateGroupForm from "@/components/features/dashboard/CreateGroupForm";
import { Users, Plus, MapPin, Calendar, Search, Filter, ArrowRight } from "lucide-react";
import axios from "axios";
import Link from "next/link";

export default function EmployeeGroupsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = async () => {
    try {
      const res = await axios.get('/api/groups');
      if (res.data.success) setGroups(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const filteredGroups = groups.filter(g => 
    g.groupName.toLowerCase().includes(search.toLowerCase()) || 
    g.village.toLowerCase().includes(search.toLowerCase())
  );

  if (showCreate) {
    return (
      <DashboardLayout>
        <CreateGroupForm onCancel={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); fetchGroups(); }} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--secondary)' }}>My Groups</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage and view all women groups created by you.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary" style={{ gap: '10px' }}>
          <Plus size={20} /> Create New Group
        </button>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '20px', marginBottom: '30px', display: 'flex', gap: '15px' }}>
         <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input 
              type="text" 
              placeholder="Search groups by name or village..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #eee', outline: 'none' }} 
            />
         </div>
      </div>

      {loading ? (
        <p>Loading groups...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {filteredGroups.map((group) => (
            <div key={group._id} style={{ background: 'white', borderRadius: '24px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f5f5f5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(106, 27, 154, 0.1)', color: '#6a1b9a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={24} />
                </div>
                <span style={{ padding: '5px 12px', borderRadius: '100px', background: '#f0fdf4', color: '#10b981', fontSize: '0.75rem', fontWeight: '800' }}>Active</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '15px' }}>{group.groupName}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666', fontSize: '0.9rem' }}>
                  <MapPin size={16} /> {group.village}, {group.block}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666', fontSize: '0.9rem' }}>
                  <Calendar size={16} /> Next Meeting: {new Date(group.meetingDate).toLocaleDateString()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666', fontSize: '0.9rem' }}>
                  <Users size={16} /> Leader: {group.leaderName}
                </div>
              </div>
              <Link href={`/employee/groups/${group._id}`} style={{ width: '100%' }}>
                <button style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--primary)', background: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  View Members <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          ))}
          {groups.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 20px', background: 'white', borderRadius: '30px' }}>
               <Users size={60} color="#eee" style={{ marginBottom: '20px' }} />
               <h3 style={{ color: '#999' }}>No groups found. Create your first group today!</h3>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
