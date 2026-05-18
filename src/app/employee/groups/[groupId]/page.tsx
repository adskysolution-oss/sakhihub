'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { 
  Users, UserPlus, MapPin, Calendar, 
  Search, Filter, ArrowLeft, ShieldCheck, 
  Phone, Briefcase, Heart, IndianRupee,
  CheckCircle, Clock, ChevronRight
} from "lucide-react";
import axios from "axios";
import Link from "next/link";
import AddMemberModal from "@/components/features/dashboard/AddMemberModal";

export default function GroupDetailsPage() {
  const { groupId } = useParams();
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [groupRes, membersRes] = await Promise.all([
        axios.get(`/api/groups/${groupId}`),
        axios.get(`/api/members?groupId=${groupId}`)
      ]);
      
      if (groupRes.data.success) setGroup(groupRes.data.data);
      if (membersRes.data.success) setMembers(membersRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) fetchData();
  }, [groupId]);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.mobile.includes(search)
  );

  if (loading) return <DashboardLayout><p>Loading group details...</p></DashboardLayout>;
  if (!group) return <DashboardLayout><p>Group not found.</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '30px' }}>
        <Link href="/employee/groups" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '700', marginBottom: '20px', textDecoration: 'none' }}>
          <ArrowLeft size={18} /> Back to My Groups
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--secondary)' }}>{group.groupName}</h2>
            <div style={{ display: 'flex', gap: '15px', color: 'var(--text-muted)', marginTop: '10px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={16} /> {group.village}, {group.block}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Users size={16} /> {members.length} Members Registered</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><ShieldCheck size={16} /> Leader: {group.leaderName}</span>
            </div>
          </div>
          <button onClick={() => setShowAddMember(true)} className="btn-primary" style={{ gap: '10px', padding: '15px 30px' }}>
            <UserPlus size={20} /> Add New Member
          </button>
        </div>
      </div>

      {showAddMember && (
        <AddMemberModal 
          groupId={groupId as string} 
          groupName={group.groupName} 
          onClose={() => setShowAddMember(false)} 
          onSuccess={() => { setShowAddMember(false); fetchData(); }} 
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px', alignItems: 'start' }}>
        {/* Member List Section */}
        <div>
          <div className="glass-card" style={{ background: 'white', padding: '25px', borderRadius: '25px', marginBottom: '30px' }}>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                <input 
                  type="text" 
                  placeholder="Search members by name or mobile..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: '100%', padding: '14px 14px 14px 45px', borderRadius: '15px', border: '1px solid #eee', fontSize: '1rem' }} 
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #f8f9fa' }}>
                    <th style={{ padding: '15px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Member Name</th>
                    <th style={{ padding: '15px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Contact</th>
                    <th style={{ padding: '15px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '15px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member._id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FFF5F8', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                            {member.name[0]}
                          </div>
                          <div>
                            <p style={{ fontWeight: '800', color: 'var(--secondary)', margin: 0 }}>{member.name}</p>
                            <p style={{ fontSize: '0.75rem', color: '#999', margin: 0 }}>Joined {new Date(member.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={14} color="var(--primary)" /> {member.mobile}
                        </p>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ 
                          padding: '6px 12px', 
                          borderRadius: '8px', 
                          fontSize: '0.7rem', 
                          fontWeight: '800',
                          background: member.membershipStatus === 'paid' ? '#ecfdf5' : '#fffbeb',
                          color: member.membershipStatus === 'paid' ? '#059669' : '#d97706',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          width: 'fit-content'
                        }}>
                          {member.membershipStatus === 'paid' ? <CheckCircle size={14} /> : <Clock size={14} />}
                          {member.membershipStatus.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          Details <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredMembers.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No members found in this group.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Group Info Sidebar */}
        <div>
          <div className="glass-card" style={{ background: 'white', padding: '25px', borderRadius: '25px', marginBottom: '20px' }}>
            <h4 style={{ fontWeight: '900', marginBottom: '20px', fontSize: '1.1rem' }}>Group Overview</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '15px' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#999', fontWeight: '800' }}>VILLAGE UNIT</p>
                <p style={{ margin: '5px 0 0', fontWeight: '700' }}>{group.village}, {group.block}</p>
              </div>
              <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '15px' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#999', fontWeight: '800' }}>GROUP LEADER</p>
                <p style={{ margin: '5px 0 0', fontWeight: '700' }}>{group.leaderName}</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#666' }}>{group.leaderMobile}</p>
              </div>
              <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '15px' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#999', fontWeight: '800' }}>NEXT MEETING</p>
                <p style={{ margin: '5px 0 0', fontWeight: '700' }}>{new Date(group.meetingDate).toLocaleDateString()}</p>
              </div>
              {group.campaignId && (
                <div style={{ padding: '15px', background: '#fffcf0', borderRadius: '15px', border: '1px solid #fef3c7' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#d97706', fontWeight: '800' }}>ACTIVE CAMPAIGN</p>
                  <p style={{ margin: '5px 0 0', fontWeight: '700', color: '#d97706' }}>{group.campaignId.title}</p>
                </div>
              )}
            </div>
          </div>
          
          <div style={{ background: 'var(--grad-primary)', padding: '25px', borderRadius: '25px', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <CheckCircle size={24} />
              <h4 style={{ margin: 0, fontWeight: '900' }}>Activation Stats</h4>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Paid Members:</span>
              <span style={{ fontWeight: '800' }}>{members.filter(m => m.membershipStatus === 'paid').length} / {members.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Activation Rate:</span>
              <span style={{ fontWeight: '900', fontSize: '1.2rem' }}>
                {members.length > 0 ? Math.round((members.filter(m => m.membershipStatus === 'paid').length / members.length) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
