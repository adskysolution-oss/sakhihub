'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import {
  Users, UserPlus, MapPin, Calendar,
  Search, ArrowLeft, ShieldCheck,
  Phone, CheckCircle, Clock, ChevronRight,
  ClipboardList, Camera, Video, AlertTriangle, Eye, RefreshCw, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Link from "next/link";
import AddMemberModal from "@/components/features/dashboard/AddMemberModal";
import CreateMeetingModal from "@/components/features/groups/CreateMeetingModal";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";

export default function GroupDetailsPage() {
  const { t } = useLanguage();
  const { groupId } = useParams();
  
  // State variables
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'meetings' | 'photos' | 'videos'>('overview');
  
  // Filtering & Modal States
  const [memberSearch, setMemberSearch] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<any>(null);
  
  // Lightbox view state
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const fetchGroupAndMembers = async () => {
    try {
      const [groupRes, membersRes] = await Promise.all([
        axios.get(`/api/groups/${groupId}`),
        axios.get(`/api/members?groupId=${groupId}`)
      ]);

      if (groupRes.data.success) setGroup(groupRes.data.data);
      if (membersRes.data.success) setMembers(membersRes.data.data);
    } catch (err) {
      console.error("Failed to load group basic info:", err);
      toast.error("Failed to load group details");
    }
  };

  const fetchMeetings = async () => {
    try {
      const res = await axios.get(`/api/meetings?groupId=${groupId}`);
      if (res.data.success) {
        const result = res.data.data;
        setMeetings(Array.isArray(result) ? result : (result.data || []));
      }
    } catch (err) {
      console.error("Failed to load meetings:", err);
    }
  };

  const fetchPhotos = async () => {
    try {
      const res = await axios.get(`/api/groups/${groupId}/media?type=photo`);
      if (res.data.success) setPhotos(res.data.data);
    } catch (err) {
      console.error("Failed to load photos:", err);
    }
  };

  const fetchVideos = async () => {
    try {
      const res = await axios.get(`/api/groups/${groupId}/media?type=video`);
      if (res.data.success) setVideos(res.data.data);
    } catch (err) {
      console.error("Failed to load videos:", err);
    }
  };

  // Main data load trigger
  const fetchAllData = async () => {
    setLoading(true);
    await fetchGroupAndMembers();
    await Promise.all([
      fetchMeetings(),
      fetchPhotos(),
      fetchVideos()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    if (groupId) fetchAllData();
  }, [groupId]);

  // Refetch when switching tabs to ensure real-time consistency
  useEffect(() => {
    if (!groupId) return;
    if (activeTab === 'meetings') fetchMeetings();
    else if (activeTab === 'photos') fetchPhotos();
    else if (activeTab === 'videos') fetchVideos();
  }, [activeTab]);

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.mobile.includes(memberSearch)
  );

  if (loading) return <DashboardLayout><div style={{ padding: '80px', textAlign: 'center', fontWeight: 'bold', color: '#666' }}><RefreshCw className="animate-spin" style={{ margin: '0 auto 10px' }} size={24} />{t('employeeGroups.loadingDetails', 'Loading group details...')}</div></DashboardLayout>;
  if (!group) return <DashboardLayout><p>{t('employeeGroups.notFound', 'Group not found.')}</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '35px' }}>
        <Link href="/employee/groups" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '700', marginBottom: '20px', textDecoration: 'none' }}>
          <ArrowLeft size={18} /> {t('employeeGroups.backToGroups', 'Back to My Groups')}
        </Link>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--secondary)' }}>{group.groupName}</h2>
            <div style={{ display: 'flex', gap: '15px', color: 'var(--text-muted)', marginTop: '10px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={16} /> {group.village}, {group.block}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Users size={16} /> {members.length} Registered Members</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><ShieldCheck size={16} /> Leader: {group.leaderName}</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setShowAddMember(true)} className="btn-primary" style={{ gap: '8px', padding: '12px 20px', fontSize: '0.85rem' }}>
              <UserPlus size={18} /> Add New Member
            </button>
            <button onClick={() => setShowCreateMeeting(true)} className="btn-primary" style={{ gap: '8px', padding: '12px 20px', background: 'var(--grad-secondary)', fontSize: '0.85rem' }}>
              <ClipboardList size={18} /> Record Group Meeting
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', gap: '20px', marginBottom: '30px', overflowX: 'auto', paddingBottom: '2px' }}>
        {([
          { id: 'overview', label: 'Overview' },
          { id: 'members', label: 'Members' },
          { id: 'meetings', label: 'Meetings Log' },
          { id: 'photos', label: 'Photos Gallery' },
          { id: 'videos', label: 'Videos Stream' }
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 6px',
              border: 'none',
              background: 'none',
              fontSize: '0.9rem',
              fontWeight: '800',
              cursor: 'pointer',
              color: activeTab === tab.id ? 'var(--primary)' : '#64748b',
              borderBottom: activeTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Modals */}
      {showAddMember && (
        <AddMemberModal
          groupId={groupId as string}
          groupName={group.groupName}
          onClose={() => setShowAddMember(false)}
          onSuccess={() => { setShowAddMember(false); fetchGroupAndMembers(); }}
        />
      )}

      {showCreateMeeting && (
        <CreateMeetingModal
          groupId={groupId as string}
          groupName={group.groupName}
          members={members}
          onClose={() => setShowCreateMeeting(false)}
          onSuccess={() => { setShowCreateMeeting(false); fetchAllData(); }}
        />
      )}

      {editingMeeting && (
        <CreateMeetingModal
          groupId={groupId as string}
          groupName={group.groupName}
          members={members}
          meetingToEdit={editingMeeting}
          onClose={() => setEditingMeeting(null)}
          onSuccess={() => { setEditingMeeting(null); fetchAllData(); }}
        />
      )}

      {/* Tab Contents */}
      <div style={{ minHeight: '400px' }}>
        
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px', alignItems: 'start', flexWrap: 'wrap' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ padding: '20px', background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px rgba(0,0,0,0.01)' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Village Unit</p>
                <p style={{ margin: '5px 0 0', fontWeight: '800', fontSize: '1.1rem', color: 'var(--secondary)' }}>{group.village}, {group.block}</p>
              </div>
              <div style={{ padding: '20px', background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px rgba(0,0,0,0.01)' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Group Leader</p>
                <p style={{ margin: '5px 0 0', fontWeight: '800', fontSize: '1.1rem', color: 'var(--secondary)' }}>{group.leaderName}</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>{group.leaderMobile}</p>
              </div>
              <div style={{ padding: '20px', background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px rgba(0,0,0,0.01)' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Scheduled Meeting Date</p>
                <p style={{ margin: '5px 0 0', fontWeight: '800', fontSize: '1.1rem', color: 'var(--secondary)' }}>{new Date(group.meetingDate).toLocaleDateString()}</p>
              </div>
              {group.campaignId && (
                <div style={{ padding: '20px', background: '#fffcf0', borderRadius: '20px', border: '1px solid #fef3c7' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#d97706', fontWeight: '800', textTransform: 'uppercase' }}>Active Campaign</p>
                  <p style={{ margin: '5px 0 0', fontWeight: '800', fontSize: '1.1rem', color: '#b45309' }}>{group.campaignId.title}</p>
                </div>
              )}
            </div>

            <div>
              <div style={{ background: 'var(--grad-primary)', padding: '25px', borderRadius: '25px', color: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                  <CheckCircle size={24} />
                  <h4 style={{ margin: 0, fontWeight: '900' }}>Activation Stats</h4>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                  <span>Paid Members:</span>
                  <span style={{ fontWeight: '800' }}>{members.filter(m => m.membershipStatus === 'paid').length} / {members.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Activation Rate:</span>
                  <span style={{ fontWeight: '900', fontSize: '1.4rem' }}>
                    {members.length > 0 ? Math.round((members.filter(m => m.membershipStatus === 'paid').length / members.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Members Table */}
        {activeTab === 'members' && (
          <div className="glass-card" style={{ background: 'white', padding: '25px', borderRadius: '25px' }}>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                <input
                  type="text"
                  placeholder="Search members by name or mobile..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '15px', border: '1px solid #eee', fontSize: '0.95rem', outline: 'none' }}
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
                    </tr>
                  ))}
                  {filteredMembers.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: '#999', fontWeight: '700' }}>No members found in this group.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Meetings Log */}
        {activeTab === 'meetings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {meetings.map((meeting) => (
              <div key={meeting._id} style={{ background: 'white', borderRadius: '24px', padding: '25px', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.01)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '45px', height: '45px', background: 'rgba(106, 27, 154, 0.1)', color: '#6a1b9a', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calendar size={22} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontWeight: '900', color: 'var(--secondary)', fontSize: '1.05rem' }}>
                        {new Date(meeting.meetingDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </h4>
                      <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700' }}>Conducted by: {meeting.conductedBy?.fullName || 'Self'}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {/* Status Chip */}
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.7rem',
                      fontWeight: '900',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      background: meeting.status === 'verified' ? '#ecfdf5' : meeting.status === 'rejected' ? '#fef2f2' : meeting.status === 'submitted' ? '#eff6ff' : '#f8fafc',
                      color: meeting.status === 'verified' ? '#059669' : meeting.status === 'rejected' ? '#dc2626' : meeting.status === 'submitted' ? '#2563eb' : '#64748b'
                    }}>
                      {meeting.status}
                    </span>

                    {/* Correction trigger button for rejected meetings */}
                    {meeting.status === 'rejected' && (
                      <button onClick={() => setEditingMeeting(meeting)} style={{ padding: '8px 15px', borderRadius: '10px', border: 'none', background: 'var(--grad-primary)', color: 'white', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
                        Edit & Correct
                      </button>
                    )}
                  </div>
                </div>

                {/* Rejection Alert Box */}
                {meeting.status === 'rejected' && (
                  <div style={{ display: 'flex', gap: '10px', padding: '15px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '16px', marginBottom: '20px', color: '#b91c1c', fontSize: '0.85rem' }}>
                    <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ fontWeight: '900' }}>Verification Rejection Remarks:</strong>
                      <p style={{ margin: '5px 0 0', color: '#991b1b', fontWeight: '700' }}>{meeting.rejectionReason}</p>
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', background: '#f8fafc', padding: '15px', borderRadius: '16px', border: '1px solid #f1f5f9', marginBottom: '15px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Attendees</p>
                    <p style={{ margin: '3px 0 0', fontWeight: '900', fontSize: '1.1rem', color: 'var(--secondary)' }}>{meeting.attendeesCount}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Photos</p>
                    <p style={{ margin: '3px 0 0', fontWeight: '900', fontSize: '1.1rem', color: 'var(--secondary)' }}>{meeting.photoCount}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Videos</p>
                    <p style={{ margin: '3px 0 0', fontWeight: '900', fontSize: '1.1rem', color: 'var(--secondary)' }}>{meeting.videoCount}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Village</p>
                    <p style={{ margin: '3px 0 0', fontWeight: '900', fontSize: '0.9rem', color: 'var(--secondary)' }} className="truncate">{meeting.village}</p>
                  </div>
                </div>

                {meeting.remarks && (
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', background: '#fff', borderLeft: '3px solid #ccc', paddingLeft: '10px' }}>
                    "{meeting.remarks}"
                  </p>
                )}
              </div>
            ))}
            {meetings.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '25px', border: '1px solid #f1f5f9' }}>
                <Calendar size={40} color="#cbd5e1" style={{ marginBottom: '10px' }} />
                <h4 style={{ color: '#94a3b8', margin: 0 }}>No group meetings recorded yet.</h4>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Photos Grid Gallery */}
        {activeTab === 'photos' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
              {photos.map((item) => (
                <div 
                  key={item._id} 
                  onClick={() => setLightboxImage(item.url)}
                  style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', aspectRatio: '1', cursor: 'pointer', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}
                  className="group"
                >
                  <img src={item.url} alt="Meeting Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} className="group-hover:scale-105" />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }} className="group-hover:opacity-100">
                    <Eye size={20} />
                  </div>
                </div>
              ))}
            </div>
            {photos.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '25px', border: '1px solid #f1f5f9' }}>
                <Camera size={40} color="#cbd5e1" style={{ marginBottom: '10px' }} />
                <h4 style={{ color: '#94a3b8', margin: 0 }}>No evidence photos uploaded yet.</h4>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Videos Stream Playback */}
        {activeTab === 'videos' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {videos.map((item) => (
                <div key={item._id} style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                  <div style={{ position: 'relative', background: '#000', aspectRatio: '16/9' }}>
                    <video 
                      src={item.url} 
                      controls 
                      style={{ width: '100%', height: '100%' }}
                      preload="metadata"
                    />
                  </div>
                  <div style={{ padding: '15px' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontWeight: '800' }}>UPLOADER / TIMESTAMP</p>
                    <p style={{ margin: '3px 0 0', fontSize: '0.85rem', fontWeight: '700', color: 'var(--secondary)' }}>
                      Conducted on: {new Date(item.uploadedAt).toLocaleDateString()}
                    </p>
                    {item.duration && (
                      <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '800' }}>
                        Duration: {Math.round(item.duration)}s
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {videos.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '25px', border: '1px solid #f1f5f9' }}>
                <Video size={40} color="#cbd5e1" style={{ marginBottom: '10px' }} />
                <h4 style={{ color: '#94a3b8', margin: 0 }}>No evidence videos uploaded yet.</h4>
              </div>
            )}
          </div>
        )}
        
      </div>

      {/* Fullscreen Lightbox Overlay Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
            <div onClick={() => setLightboxImage(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }} />
            <button onClick={() => setLightboxImage(null)} style={{ position: 'absolute', right: '30px', top: '30px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={24} />
            </button>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <img src={lightboxImage} alt="Fullscreen Lightbox Evidence" style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
