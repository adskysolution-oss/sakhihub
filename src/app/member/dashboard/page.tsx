'use client';

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";
import { 
  User, Phone, MapPin, ShieldCheck, CreditCard, 
  Clock, CheckCircle, AlertCircle, Download, 
  MessageSquare, Users, Home, Calendar, Briefcase,
  ExternalLink, Sparkles, Heart, FileText
} from "lucide-react";
import Link from "next/link";

export default function MemberDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/member/dashboard');
        if (res.data.success) {
          setData(res.data.data);
          if (res.data.data.fieldRecord?.pincode) {
            fetchNearbyEmployees(res.data.data.fieldRecord.pincode);
          }
        }
      } catch (err: any) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  const [nearbyEmployees, setNearbyEmployees] = useState<any[]>([]);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string>("");

  const fetchNearbyEmployees = async (pincode: string) => {
    setDiscoveryLoading(true);
    try {
      const res = await fetch(`/api/employees/nearby?pincode=${pincode}`);
      const result = await res.json();
      if (result.success) {
        setNearbyEmployees(result.data);
      }
    } catch (err) {
      console.error("Nearby discovery failed", err);
    } finally {
      setDiscoveryLoading(false);
    }
  };

  const handleConnect = async (employeeId: string) => {
    setRequestStatus(employeeId);
    try {
      const res = await axios.post('/api/member/request', {
        employeeId,
        pincode: data.fieldRecord.pincode
      });
      if (res.data.success) {
        // Refresh data
        const refresh = await axios.get('/api/member/dashboard');
        setData(refresh.data.data);
      }
    } catch (err) {
      console.error("Connect failed", err);
      setRequestStatus("");
    }
  };

  const handleResponseRequest = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await axios.patch('/api/member/request', { id, status });
      if (res.data.success) {
        // Refresh data
        const refresh = await axios.get('/api/member/dashboard');
        setData(refresh.data.data);
      }
    } catch (err) {
      console.error("Response failed", err);
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ color: '#666', fontWeight: '600' }}>Loading your Member Dashboard...</p>
        </div>
        <style jsx>{` @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } `}</style>
      </DashboardLayout>
    );
  }

  const { profile, fieldRecord, membership, pendingRequests } = data || {};
  const isVerified = membership?.membershipStatus === 'paid';

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gap: '30px' }}>
        
        {/* Connection Requests from Employees */}
        {pendingRequests?.length > 0 && pendingRequests.some((r: any) => r.requestedBy === 'employee') && (
          <section className="glass-card" style={{ padding: '30px', background: 'var(--grad-primary)', borderRadius: '30px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ padding: '15px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px' }}>
                <Users size={30} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '900', margin: 0 }}>Connection Request Received</h2>
                <p style={{ margin: '5px 0 0', opacity: 0.9 }}>
                  A SakhiHub Hero ({pendingRequests.find((r: any) => r.requestedBy === 'employee').employeeId?.fullName}) wants to connect with you.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => handleResponseRequest(pendingRequests.find((r: any) => r.requestedBy === 'employee')._id, 'rejected')}
                style={{ padding: '10px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', fontWeight: '700', cursor: 'pointer' }}
              >
                Reject
              </button>
              <button 
                onClick={() => handleResponseRequest(pendingRequests.find((r: any) => r.requestedBy === 'employee')._id, 'approved')}
                style={{ padding: '10px 25px', borderRadius: '12px', background: 'white', border: 'none', color: 'var(--primary)', fontWeight: '900', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
              >
                Approve & Connect
              </button>
            </div>
          </section>
        )}
        {/* Header / Welcome Section */}
        <section className="glass-card" style={{ 
          background: 'var(--grad-primary)', 
          padding: '40px', 
          borderRadius: '35px', 
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(233, 30, 99, 0.2)'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <span style={{ padding: '8px 15px', background: 'rgba(255,255,255,0.2)', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '1px' }}>
                MEMBER PORTAL
              </span>
              {isVerified ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 15px', background: 'rgba(74, 222, 128, 0.2)', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '800' }}>
                  <ShieldCheck size={14} /> VERIFIED
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 15px', background: 'rgba(251, 191, 36, 0.2)', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '800' }}>
                  <Clock size={14} /> PENDING VERIFICATION
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '900', marginBottom: '10px' }}>
              Welcome Back, {profile?.fullName.split(' ')[0]}! <Sparkles style={{ display: 'inline' }} />
            </h1>
            <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', lineHeight: '1.6' }}>
              We're glad to have you in the SakhiHub community. Manage your membership, view your group details, and stay updated with our latest campaigns.
            </p>
          </div>
          <Heart style={{ position: 'absolute', right: '-40px', top: '-40px', width: '300px', height: '300px', opacity: 0.1, color: 'white' }} />
        </section>

        {/* Summary Cards Grid */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="stat-card" style={{ padding: '25px', background: 'white', borderRadius: '25px', border: '1px solid #eee', display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ padding: '15px', background: '#FFF5F8', color: 'var(--primary)', borderRadius: '20px' }}>
              <CreditCard size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: '#666', fontWeight: '600' }}>Membership Status</p>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: isVerified ? '#16a34a' : '#ea580c' }}>
                {isVerified ? 'Active & Paid' : 'Pending Payment'}
              </h3>
            </div>
          </div>

          <div className="stat-card" style={{ padding: '25px', background: 'white', borderRadius: '25px', border: '1px solid #eee', display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ padding: '15px', background: '#F5F3FF', color: 'var(--secondary)', borderRadius: '20px' }}>
              <Users size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: '#666', fontWeight: '600' }}>Assigned Group</p>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--secondary)' }}>
                {fieldRecord?.groupId?.name || 'Not Assigned'}
              </h3>
            </div>
          </div>

          <div className="stat-card" style={{ padding: '25px', background: 'white', borderRadius: '25px', border: '1px solid #eee', display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ padding: '15px', background: '#ECFDF5', color: '#059669', borderRadius: '20px' }}>
              <MapPin size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: '#666', fontWeight: '600' }}>Village/Area</p>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--secondary)' }}>
                {fieldRecord?.village || profile?.area || 'Global Member'}
              </h3>
            </div>
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '30px', alignItems: 'start' }}>
          
          {/* Main Column */}
          <div style={{ display: 'grid', gap: '30px' }}>
            
            {/* Connection Status & Discovery */}
            {fieldRecord?.connectionStatus === 'unassigned' && (
              <section className="glass-card" style={{ padding: '35px', background: '#FFF5F8', borderRadius: '30px', border: '1px dashed var(--primary)' }}>
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                  <Users size={40} style={{ color: 'var(--primary)', marginBottom: '15px' }} />
                  <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--secondary)' }}>Connect with Local Sakhi</h2>
                  <p style={{ color: '#666' }}>Find and connect with an active field employee in your area to get your membership verified and join a group.</p>
                </div>

                <div style={{ display: 'grid', gap: '15px' }}>
                  {discoveryLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>Searching for nearby Sakhis...</div>
                  ) : nearbyEmployees.length > 0 ? (
                    nearbyEmployees.map((emp) => (
                      <div key={emp._id} style={{ 
                        padding: '20px', borderRadius: '20px', background: 'white', 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                      }}>
                        <div>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--secondary)' }}>{emp.fullName}</h4>
                          <p style={{ fontSize: '0.8rem', color: '#666' }}>{emp.area}, {emp.block}</p>
                        </div>
                        <button 
                          onClick={() => handleConnect(emp._id)}
                          disabled={requestStatus === emp._id}
                          className="btn-primary" 
                          style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                        >
                          {requestStatus === emp._id ? 'Connecting...' : 'Connect'}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                      No active employees found in your pincode ({fieldRecord?.pincode}) yet. 
                      Our team will reach out to you soon.
                    </div>
                  )}
                </div>
              </section>
            )}

            {fieldRecord?.connectionStatus === 'pending_request' && (
              <section className="glass-card" style={{ padding: '35px', background: '#FEFCE8', borderRadius: '30px', border: '1px solid #FEF08A' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ padding: '15px', background: '#FEF9C3', borderRadius: '20px', color: '#854d0e' }}>
                    <Clock size={30} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#854d0e' }}>Connection Request Pending</h2>
                    <p style={{ color: '#713f12', marginTop: '5px' }}>Your request to connect with our local field employee is awaiting approval. You will be notified once they accept.</p>
                  </div>
                </div>
              </section>
            )}

            {fieldRecord?.connectionStatus === 'approved' && fieldRecord?.assignedEmployeeId && (
              <section className="glass-card" style={{ padding: '35px', background: '#F0FDF4', borderRadius: '30px', border: '1px solid #BBF7D0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ padding: '15px', background: '#DCFCE7', borderRadius: '20px', color: '#166534' }}>
                      <ShieldCheck size={30} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#166534' }}>Connected with {fieldRecord.assignedEmployeeId.fullName}</h2>
                      <p style={{ color: '#15803d', marginTop: '5px' }}>Your account is managed by our local Sakhi Hero. You can contact them for any support.</p>
                    </div>
                  </div>
                  <a href={`tel:${fieldRecord.assignedEmployeeId.mobile}`} className="btn-primary" style={{ background: '#16a34a', boxShadow: '0 10px 20px rgba(22, 163, 74, 0.2)' }}>
                    <Phone size={18} /> Call Sakhi
                  </a>
                </div>
              </section>
            )}
            
            {/* Detailed Profile Section */}
            <section className="glass-card" style={{ padding: '35px', background: 'white', borderRadius: '30px', border: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <User size={22} className="text-gradient" /> Member Profile
                </h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                {[
                  { label: 'Full Name', value: profile?.fullName, icon: <User size={16} /> },
                  { label: 'Mobile Number', value: profile?.mobile, icon: <Phone size={16} /> },
                  { label: 'WhatsApp', value: profile?.whatsapp || 'Not provided', icon: <MessageSquare size={16} /> },
                  { label: 'Member ID', value: membership?.membershipId || 'Generating...', icon: <ShieldCheck size={16} /> },
                  { label: 'District', value: profile?.district || fieldRecord?.district, icon: <MapPin size={16} /> },
                  { label: 'Block', value: profile?.block || fieldRecord?.block, icon: <Home size={16} /> },
                  { label: 'Occupation', value: fieldRecord?.occupation || 'Member', icon: <Briefcase size={16} /> },
                  { label: 'Joining Date', value: new Date(profile?.createdAt).toLocaleDateString(), icon: <Calendar size={16} /> }
                ].map((item, i) => (
                  <div key={i} style={{ padding: '15px', background: '#f8f9fa', borderRadius: '15px' }}>
                    <p style={{ fontSize: '0.75rem', color: '#999', fontWeight: '700', marginBottom: '5px', textTransform: 'uppercase' }}>{item.label}</p>
                    <p style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--primary)' }}>{item.icon}</span> {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Receipt & Verification Section */}
            <section className="glass-card" style={{ padding: '35px', background: 'white', borderRadius: '30px', border: '1px solid #eee' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CreditCard size={22} className="text-gradient" /> Membership Receipt
              </h2>
              
              {membership ? (
                <div style={{ padding: '30px', background: '#f8f9fa', borderRadius: '20px', border: '2px dashed #ddd', position: 'relative' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                    <div>
                      <p style={{ fontSize: '0.8rem', color: '#666', fontWeight: '600' }}>Receipt Number</p>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--secondary)' }}>{membership.receiptNumber}</h4>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.8rem', color: '#666', fontWeight: '600' }}>Amount Paid</p>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--primary)' }}>₹{membership.amount}.00</h4>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#16a34a', fontWeight: '700' }}>
                      <CheckCircle size={20} /> Verified Receipt
                    </div>
                    <Link href={`/member/receipt/${membership._id}`} target="_blank" style={{ textDecoration: 'none' }}>
                      <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 25px', background: 'var(--grad-primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>
                        <FileText size={18} /> View Receipt
                      </button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', background: '#fff9f9', borderRadius: '25px', border: '1px solid #ffebeb' }}>
                  <AlertCircle size={40} style={{ color: '#ef4444', marginBottom: '15px' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--secondary)' }}>No Active Membership Found</h3>
                  <p style={{ color: '#666', marginTop: '10px' }}>Please contact your local SakhiHub Hero/Employee to verify your membership and generate a receipt.</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Column */}
          <aside style={{ display: 'grid', gap: '30px' }}>
            
            {/* Quick Actions */}
            <section className="glass-card" style={{ padding: '30px', background: 'white', borderRadius: '30px', border: '1px solid #eee' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '20px' }}>Quick Actions</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {[
                  { label: 'Contact Employee', icon: <Phone size={18} />, color: '#4F46E5' },
                  { label: 'View Group Members', icon: <Users size={18} />, color: '#059669' },
                  { label: 'Latest Campaigns', icon: <Sparkles size={18} />, color: '#E11D48' },
                  { label: 'Help & Support', icon: <Heart size={18} />, color: '#7C3AED' }
                ].map((action, i) => (
                  <button key={i} style={{ 
                    display: 'flex', alignItems: 'center', gap: '12px', 
                    padding: '15px 20px', width: '100%',
                    background: 'white', border: '1px solid #eee', 
                    borderRadius: '15px', color: 'var(--secondary)',
                    fontWeight: '700', cursor: 'pointer', textAlign: 'left',
                    transition: '0.2s'
                  }}>
                    <span style={{ color: action.color }}>{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Notifications / Updates */}
            <section className="glass-card" style={{ padding: '30px', background: '#F8FAFC', borderRadius: '30px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#1E293B', marginBottom: '20px' }}>Updates</h3>
              <div style={{ display: 'grid', gap: '20px' }}>
                {[
                  { title: 'New Campaign', desc: 'Sakhi Care Pads distribution starts next week.', time: '2h ago' },
                  { title: 'Meeting Reminder', desc: 'Your community group meeting is on Sunday.', time: '1d ago' },
                  { title: 'Payment Confirmed', desc: 'Membership payment verified by Admin.', time: '3d ago' }
                ].map((notif, i) => (
                  <div key={i} style={{ paddingLeft: '15px', borderLeft: '3px solid var(--primary)' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--secondary)' }}>{notif.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>{notif.desc}</p>
                    <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '5px' }}>{notif.time}</p>
                  </div>
                ))}
              </div>
              <button style={{ 
                marginTop: '25px', width: '100%', padding: '12px', 
                background: 'transparent', border: '1px solid #CBD5E1', 
                borderRadius: '12px', color: '#64748B', fontWeight: '700', fontSize: '0.85rem'
              }}>
                View All Notifications
              </button>
            </section>

          </aside>

        </div>
      </div>
      
      <style jsx>{`
        .glass-card { transition: transform 0.3s ease; }
        .glass-card:hover { transform: translateY(-5px); }
        .stat-card { transition: all 0.3s ease; }
        .stat-card:hover { border-color: var(--primary) !important; background: #fffcfd !important; }
        .text-gradient { background: var(--grad-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        @media (max-width: 992px) {
          div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </DashboardLayout>
  );
}
