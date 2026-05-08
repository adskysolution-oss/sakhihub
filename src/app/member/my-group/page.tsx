'use client';

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";
import { 
  Users, MapPin, User, Calendar, 
  ShieldCheck, MessageSquare, Info,
  ExternalLink, Phone
} from "lucide-react";

export default function MyGroupPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await axios.get('/api/member/group');
        if (res.data.success) setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchGroup();
  }, [user]);

  if (loading) return <DashboardLayout><div style={{ padding: '40px', textAlign: 'center' }}>Loading Group Details...</div></DashboardLayout>;

  if (!data?.group) {
    return (
      <DashboardLayout>
        <div style={{ padding: '60px', textAlign: 'center', background: 'white', borderRadius: '30px' }}>
          <Users size={60} style={{ color: '#ccc', marginBottom: '20px' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--secondary)' }}>No Group Assigned</h2>
          <p style={{ color: '#666', marginTop: '10px' }}>You are not currently assigned to any community group. Please contact your local SakhiHub Hero.</p>
        </div>
      </DashboardLayout>
    );
  }

  const { group, members } = data;

  return (
    <DashboardLayout>
      <div style={{ display: 'grid', gap: '30px' }}>
        {/* Group Header Card */}
        <section className="glass-card" style={{ background: 'white', padding: '40px', borderRadius: '35px', border: '1px solid #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '2px' }}>MY COMMUNITY GROUP</span>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--secondary)', marginTop: '5px' }}>{group.groupName}</h1>
              <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontWeight: '600' }}><MapPin size={18} /> {group.village}, {group.block}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontWeight: '600' }}><Users size={18} /> {members.length} Members</span>
              </div>
            </div>
            <div style={{ padding: '20px', background: '#FDF2F8', borderRadius: '20px', border: '1px solid #FCE7F3' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '800', marginBottom: '5px' }}>GROUP LEADER / HERO</p>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--secondary)' }}>{group.createdBy?.fullName || 'Assigned Lead'}</h4>
              <p style={{ fontSize: '0.85rem', color: '#666', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}><Phone size={14} /> {group.createdBy?.mobile}</p>
            </div>
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
          {/* Members List */}
          <section className="glass-card" style={{ background: 'white', padding: '35px', borderRadius: '30px', border: '1px solid #eee' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={22} color="var(--primary)" /> Group Members
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {members.map((m: any, i: number) => (
                <div key={i} style={{ padding: '15px 20px', background: '#f8f9fa', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: 'var(--primary)', border: '1px solid #eee' }}>
                      {m.name[0]}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: '800', color: 'var(--secondary)' }}>{m.name} {m.mobile === user?.mobile && '(Me)'}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>{m.village}</p>
                    </div>
                  </div>
                  {m.membershipStatus === 'paid' ? (
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#059669', background: '#ecfdf5', padding: '4px 10px', borderRadius: '100px' }}>VERIFIED</span>
                  ) : (
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#d97706', background: '#fffbeb', padding: '4px 10px', borderRadius: '100px' }}>PENDING</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Sidebar: Meetings & Info */}
          <aside style={{ display: 'grid', gap: '30px' }}>
            <section style={{ background: 'white', padding: '30px', borderRadius: '30px', border: '1px solid #eee' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '20px' }}>Next Meeting</h3>
              <div style={{ padding: '20px', background: '#F5F3FF', borderRadius: '20px', border: '1px solid #EDE9FE' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '15px' }}>
                  <Calendar size={20} color="var(--secondary)" />
                  <span style={{ fontWeight: '800', color: 'var(--secondary)' }}>Sunday, 15th May</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.5' }}>Monthly awareness session and kit distribution at the Village Center.</p>
              </div>
            </section>

            <section style={{ background: 'var(--grad-primary)', padding: '30px', borderRadius: '30px', color: 'white' }}>
              <Info size={24} style={{ marginBottom: '15px', opacity: 0.8 }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '10px' }}>Group Guidelines</h3>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', fontSize: '0.85rem', display: 'grid', gap: '10px', opacity: 0.9 }}>
                <li>• Attend monthly meetings</li>
                <li>• Participate in awareness campaigns</li>
                <li>• Keep your membership active</li>
                <li>• Support fellow group members</li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
