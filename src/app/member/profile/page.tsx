'use client';

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";
import { 
  User as UserIcon, Phone, MapPin, 
  ShieldCheck, Calendar, Camera, 
  MessageSquare, Edit3, Save, X 
} from "lucide-react";

export default function MemberProfilePage() {
  const { user: authUser } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ address: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/member/profile');
        if (res.data.success) {
          setData(res.data.data);
          setFormData({
            address: res.data.data.user.address || ''
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (authUser) fetchProfile();
  }, [authUser]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.patch('/api/member/profile', formData);
      if (res.data.success) {
        setData((prev: any) => ({ ...prev, user: res.data.data }));
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardLayout><div style={{ padding: '40px', textAlign: 'center' }}>Loading Profile...</div></DashboardLayout>;

  const profile = data.user;
  const field = data.fieldRecord;
  const membership = data.membership;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gap: '30px' }}>
        
        {/* Profile Header */}
        <section className="glass-card" style={{ background: 'white', padding: '40px', borderRadius: '35px', border: '1px solid #eee', position: 'relative' }}>
          <div style={{ display: 'flex', gap: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '120px', height: '120px', background: '#FFF5F8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: '900', color: 'var(--primary)', border: '4px solid white', boxShadow: '0 10px 30px rgba(233,30,99,0.1)' }}>
                {profile.fullName[0]}
              </div>
              <button style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--grad-primary)', color: 'white', border: 'none', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Camera size={16} />
              </button>
            </div>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--secondary)' }}>{profile.fullName}</h1>
              <p style={{ color: 'var(--primary)', fontWeight: '800', marginTop: '5px' }}>Member ID: {membership?.membershipId || 'Generating...'}</p>
              <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                {membership?.paymentStatus === 'Paid' ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: '#ecfdf5', color: '#059669', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '800' }}>
                    <ShieldCheck size={14} /> ACTIVE MEMBER
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: '#fffbeb', color: '#d97706', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '800' }}>
                    <ShieldCheck size={14} /> PENDING
                  </span>
                )}
              </div>
            </div>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 25px', background: 'white', border: '1px solid #ddd', borderRadius: '15px', fontWeight: '800', cursor: 'pointer' }}>
                <Edit3 size={18} /> Edit Profile
              </button>
            ) : (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                <button onClick={() => setIsEditing(false)} style={{ padding: '12px 20px', background: '#f5f5f5', border: 'none', borderRadius: '15px', fontWeight: '800', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
                <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 25px', background: 'var(--grad-primary)', color: 'white', border: 'none', borderRadius: '15px', fontWeight: '800', cursor: 'pointer' }}>
                  {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                </button>
              </div>
            )}
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* Contact Details */}
          <section className="glass-card" style={{ background: 'white', padding: '35px', borderRadius: '30px', border: '1px solid #eee' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '25px' }}>Contact Information</h3>
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '15px' }}>
                <label style={{ fontSize: '0.75rem', color: '#999', fontWeight: '800', textTransform: 'uppercase' }}>Mobile Number</label>
                <p style={{ margin: '5px 0 0', fontWeight: '700', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Phone size={18} color="var(--primary)" /> {profile.mobile}
                </p>
              </div>
              <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '15px' }}>
                <label style={{ fontSize: '0.75rem', color: '#999', fontWeight: '800', textTransform: 'uppercase' }}>Current Address</label>
                {isEditing ? (
                  <input 
                    value={formData.address} 
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    style={{ width: '100%', marginTop: '5px', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}
                  />
                ) : (
                  <p style={{ margin: '5px 0 0', fontWeight: '700', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MapPin size={18} color="var(--secondary)" /> {profile.address || 'Global Member'}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Group & Regional Details */}
          <section className="glass-card" style={{ background: 'white', padding: '35px', borderRadius: '30px', border: '1px solid #eee' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '25px' }}>Community Assignment</h3>
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '15px' }}>
                <label style={{ fontSize: '0.75rem', color: '#999', fontWeight: '800', textTransform: 'uppercase' }}>Assigned Group</label>
                <p style={{ margin: '5px 0 0', fontWeight: '700', fontSize: '1.1rem' }}>{field?.groupId?.groupName || 'Direct Member'}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                 <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '15px' }}>
                    <label style={{ fontSize: '0.75rem', color: '#999', fontWeight: '800', textTransform: 'uppercase' }}>Village</label>
                    <p style={{ margin: '5px 0 0', fontWeight: '700' }}>{field?.village || profile.area}</p>
                 </div>
                 <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '15px' }}>
                    <label style={{ fontSize: '0.75rem', color: '#999', fontWeight: '800', textTransform: 'uppercase' }}>District</label>
                    <p style={{ margin: '5px 0 0', fontWeight: '700' }}>{field?.groupId?.district || profile.district}</p>
                 </div>
              </div>
              <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '15px' }}>
                <label style={{ fontSize: '0.75rem', color: '#999', fontWeight: '800', textTransform: 'uppercase' }}>Registration Date</label>
                <p style={{ margin: '5px 0 0', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Calendar size={18} color="#666" /> {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
