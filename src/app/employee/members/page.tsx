'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import AddMemberForm from "@/components/features/dashboard/AddMemberForm";
import MemberDetailsModal from "@/components/features/dashboard/MemberDetailsModal";
import { UserPlus, Plus, Search, Filter, Phone, MapPin, IndianRupee, CheckCircle2 } from "lucide-react";
import axios from "axios";

export default function EmployeeMembersPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    try {
      const res = await axios.get('/api/members');
      if (res.data.success) setMembers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  if (showAdd) {
    return (
      <DashboardLayout>
        <AddMemberForm onCancel={() => setShowAdd(false)} onSuccess={() => { setShowAdd(false); fetchMembers(); }} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--secondary)' }}>Women Members</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage and view all women members registered by you.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary" style={{ gap: '10px' }}>
          <Plus size={20} /> Add New Member
        </button>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '20px', marginBottom: '30px', display: 'flex', gap: '15px' }}>
         <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input type="text" placeholder="Search members by name or mobile..." style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #eee' }} />
         </div>
         <button style={{ padding: '12px 20px', borderRadius: '12px', border: '1px solid #eee', background: 'white', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
            <Filter size={18} /> Filters
         </button>
      </div>

      <div style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8f9fa' }}>
            <tr>
              <th style={{ padding: '20px', color: '#666', fontSize: '0.9rem', fontWeight: '800' }}>Member Name</th>
              <th style={{ padding: '20px', color: '#666', fontSize: '0.9rem', fontWeight: '800' }}>Mobile & Village</th>
              <th style={{ padding: '20px', color: '#666', fontSize: '0.9rem', fontWeight: '800' }}>Group</th>
              <th style={{ padding: '20px', color: '#666', fontSize: '0.9rem', fontWeight: '800' }}>Status</th>
              <th style={{ padding: '20px', color: '#666', fontSize: '0.9rem', fontWeight: '800' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center' }}>Loading Members...</td></tr>
            ) : members.map((member) => (
              <tr key={member._id} style={{ borderTop: '1px solid #f5f5f5' }}>
                <td style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--grad-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.9rem' }}>
                      {member.name.charAt(0)}
                    </div>
                    <span style={{ fontWeight: '800' }}>{member.name}</span>
                  </div>
                </td>
                <td style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#555' }}><Phone size={14} /> {member.mobile}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#888' }}><MapPin size={14} /> {member.village}</div>
                  </div>
                </td>
                <td style={{ padding: '20px', fontWeight: '700', fontSize: '0.9rem', color: 'var(--secondary)' }}>
                  {member.groupId?.groupName || 'No Group'}
                </td>
                <td style={{ padding: '20px' }}>
                  {member.membershipStatus === 'paid' ? (
                    <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', fontWeight: '800' }}>
                      <CheckCircle2 size={16} /> Verified
                    </span>
                  ) : (
                    <span style={{ color: '#f59e0b', fontSize: '0.85rem', fontWeight: '800' }}>Pending Fee</span>
                  )}
                </td>
                <td style={{ padding: '20px' }}>
                   <button 
                    onClick={() => setSelectedMember(member)}
                    style={{ color: 'var(--primary)', fontWeight: '800', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                   >View Details</button>
                </td>
              </tr>
            ))}
            {members.length === 0 && !loading && (
              <tr>
                <td colSpan={5} style={{ padding: '100px', textAlign: 'center', color: '#999' }}>
                   No members found. Start adding women to your groups!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedMember && (
        <MemberDetailsModal 
          member={selectedMember} 
          onClose={() => setSelectedMember(null)} 
        />
      )}
    </DashboardLayout>
  );
}
