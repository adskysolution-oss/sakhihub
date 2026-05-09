'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import AddMemberForm from "@/components/features/dashboard/AddMemberForm";
import MemberDetailsModal from "@/components/features/dashboard/MemberDetailsModal";
import { UserPlus, Plus, Search, Filter, Phone, MapPin, IndianRupee, CheckCircle2 } from "lucide-react";
import axios from "axios";

export default function EmployeeMembersPage() {
  const [activeTab, setActiveTab] = useState<'my-members' | 'discovery'>('my-members');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("all");

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const mode = activeTab === 'discovery' ? 'mode=discovery' : '';
      const res = await axios.get(`/api/members?${mode}&search=${search}`);
      if (res.data.success) setMembers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [activeTab, search]);

  const handleSendRequest = async (memberUserId: string) => {
    setActionLoading(memberUserId);
    try {
      const res = await axios.post('/api/employee/request', { memberUserId });
      if (res.data.success) {
        alert("Request sent successfully");
        fetchMembers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleGroupAssign = (member: any) => {
    setSelectedMember(member);
    // This will open the modal, which we should update to include group selection
  };

  const groups = Array.from(new Set(members.map(m => m.groupId?.groupName).filter(Boolean)));

  const filteredMembers = members.filter(m => {
    const matchesGroup = filterGroup === "all" || m.groupId?.groupName === filterGroup;
    return matchesGroup;
  });

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
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--secondary)' }}>{activeTab === 'discovery' ? 'Discover Members' : 'My Women Members'}</h2>
          <p style={{ color: 'var(--text-muted)' }}>{activeTab === 'discovery' ? 'Find unassigned members in your area to connect.' : 'Manage members connected to you.'}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary" style={{ gap: '10px' }}>
          <Plus size={20} /> Add New Member
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', borderBottom: '1px solid #eee' }}>
        <button 
          onClick={() => setActiveTab('my-members')}
          style={{ 
            padding: '12px 25px', background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: activeTab === 'my-members' ? '3px solid var(--primary)' : 'none',
            color: activeTab === 'my-members' ? 'var(--primary)' : '#666',
            fontWeight: '800', fontSize: '1rem'
          }}
        >
          My Members
        </button>
        <button 
          onClick={() => setActiveTab('discovery')}
          style={{ 
            padding: '12px 25px', background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: activeTab === 'discovery' ? '3px solid var(--primary)' : 'none',
            color: activeTab === 'discovery' ? 'var(--primary)' : '#666',
            fontWeight: '800', fontSize: '1rem'
          }}
        >
          Discover (Nearby)
        </button>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '20px', marginBottom: '30px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
         <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input 
              type="text" 
              placeholder="Search by name or mobile..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #eee', outline: 'none' }} 
            />
         </div>
         {activeTab === 'my-members' && (
           <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <Filter size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                <select 
                  value={filterGroup}
                  onChange={(e) => setFilterGroup(e.target.value)}
                  style={{ padding: '12px 15px 12px 40px', borderRadius: '12px', border: '1px solid #eee', background: 'white', fontWeight: '700', appearance: 'none', minWidth: '160px' }}
                >
                  <option value="all">All Groups</option>
                  {groups.map(g => <option key={g as string} value={g as string}>{g as string}</option>)}
                </select>
              </div>
           </div>
         )}
      </div>

      <div style={{ background: 'white', borderRadius: '24px', overflowX: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead style={{ background: '#f8f9fa' }}>
            <tr>
              <th style={{ padding: '20px', color: '#666', fontSize: '0.9rem', fontWeight: '800' }}>Member Name</th>
              <th style={{ padding: '20px', color: '#666', fontSize: '0.9rem', fontWeight: '800' }}>Contact & Location</th>
              <th style={{ padding: '20px', color: '#666', fontSize: '0.9rem', fontWeight: '800' }}>{activeTab === 'discovery' ? 'Area' : 'Group'}</th>
              <th style={{ padding: '20px', color: '#666', fontSize: '0.9rem', fontWeight: '800' }}>Status</th>
              <th style={{ padding: '20px', color: '#666', fontSize: '0.9rem', fontWeight: '800' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center' }}>Loading...</td></tr>
            ) : filteredMembers.map((member) => (
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#888' }}><MapPin size={14} /> {member.block}, {member.district}</div>
                  </div>
                </td>
                <td style={{ padding: '20px', fontWeight: '700', fontSize: '0.9rem', color: 'var(--secondary)' }}>
                  {activeTab === 'discovery' ? (member.area || 'N/A') : (member.groupId?.groupName || 'No Group')}
                </td>
                <td style={{ padding: '20px' }}>
                  <span style={{ 
                    padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800',
                    background: member.connectionStatus === 'approved' ? '#ecfdf5' : '#f3f4f6',
                    color: member.connectionStatus === 'approved' ? '#059669' : '#666'
                  }}>
                    {(member.connectionStatus || 'Unassigned').toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '20px' }}>
                  {activeTab === 'discovery' ? (
                    <button 
                      onClick={() => handleSendRequest(member.userId)}
                      disabled={!!actionLoading || member.connectionStatus === 'pending_request'}
                      className="btn-primary" 
                      style={{ padding: '8px 15px', fontSize: '0.8rem' }}
                    >
                      {member.connectionStatus === 'pending_request' ? 'Request Sent' : (actionLoading === member.userId ? 'Sending...' : 'Send Request')}
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '10px' }}>
                       <button 
                        onClick={() => setSelectedMember(member)}
                        style={{ color: 'var(--primary)', fontWeight: '800', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                       >Details</button>
                       {!member.groupId && (
                         <button 
                          onClick={() => handleGroupAssign(member)}
                          style={{ color: '#6a1b9a', fontWeight: '800', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                         >+ Group</button>
                       )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filteredMembers.length === 0 && !loading && (
              <tr>
                <td colSpan={5} style={{ padding: '100px', textAlign: 'center', color: '#999' }}>
                   No members found in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedMember && (
        <MemberDetailsModal 
          member={selectedMember} 
          onClose={() => {
            setSelectedMember(null);
            fetchMembers();
          }} 
        />
      )}
    </DashboardLayout>
  );
}
