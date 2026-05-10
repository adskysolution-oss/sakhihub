'use client';

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";
import {
  User, Phone, MapPin, ShieldCheck, CreditCard,
  Clock, CheckCircle, AlertCircle, Download,
  MessageSquare, Users, Home, Calendar, Briefcase,
  ExternalLink, Sparkles, Heart, FileText, Bell
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

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
      <div className="max-w-6xl mx-auto flex flex-col gap-6 md:gap-10 p-3 sm:p-6 lg:p-10">

        {/* Connection Requests from Employees */}
        {pendingRequests?.length > 0 && pendingRequests.some((r: any) => r.requestedBy === 'employee') && (
          <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 md:p-10 bg-gradient-to-br from-primary to-secondary rounded-[35px] text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl shadow-primary/30"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center shrink-0">
                <Users size={32} />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold leading-tight">Connection Request Received</h2>
                <p className="mt-2 opacity-90 text-sm md:text-base">
                  A SakhiHub Hero (<span className="font-semibold underline">{pendingRequests.find((r: any) => r.requestedBy === 'employee').employeeId?.fullName}</span>) wants to connect with you.
                </p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={() => handleResponseRequest(pendingRequests.find((r: any) => r.requestedBy === 'employee')._id, 'rejected')}
                className="flex-1 md:flex-none py-4 px-6 rounded-2xl bg-white/10 hover:bg-white/20 font-semibold transition-all"
              >
                Reject
              </button>
              <button
                onClick={() => handleResponseRequest(pendingRequests.find((r: any) => r.requestedBy === 'employee')._id, 'approved')}
                className="flex-1 md:flex-none py-4 px-8 rounded-2xl bg-white text-primary font-bold shadow-xl shadow-black/10 hover:scale-105 transition-all"
              >
                Approve & Connect
              </button>
            </div>
          </motion.section>
        )}

        {/* Header / Welcome Section */}
        <section className="relative p-6 sm:p-10 lg:p-14 bg-gradient-to-br from-primary to-secondary-dark rounded-[30px] md:rounded-[40px] text-white overflow-hidden shadow-2xl shadow-primary/20">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase">
                MEMBER PORTAL
              </span>
              {isVerified ? (
                <span className="flex items-center gap-2 px-4 py-1.5 bg-green-400/20 backdrop-blur-md rounded-full text-[10px] md:text-xs font-bold text-green-300">
                  <ShieldCheck size={14} /> VERIFIED MEMBER
                </span>
              ) : (
                <span className="flex items-center gap-2 px-4 py-1.5 bg-amber-400/20 backdrop-blur-md rounded-full text-[10px] md:text-xs font-bold text-amber-300">
                  <Clock size={14} /> PENDING VERIFICATION
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold mb-4 leading-tight">
              Welcome Back, <br className="sm:hidden" /> {profile?.fullName.split(' ')[0]}! <Sparkles className="inline ml-2 text-amber-300" />
            </h1>
            <p className="text-sm md:text-xl opacity-80 max-w-2xl leading-relaxed">
              We're glad to have you in the SakhiHub community. Manage your membership, view your group details, and stay updated with our latest campaigns.
            </p>
          </div>
          <Heart className="absolute -right-20 -bottom-20 w-80 h-80 opacity-10 text-white transform -rotate-12" />
        </section>

        {/* Summary Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="p-5 sm:p-6 lg:p-8 bg-white rounded-[24px] sm:rounded-[32px] border border-gray-100 flex items-center gap-4 sm:gap-5 shadow-soft hover:border-primary/30 transition-all group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
              <CreditCard size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-widest truncate">Membership</p>
              <h3 className={`text-base sm:text-lg lg:text-xl font-bold mt-0.5 truncate ${isVerified ? 'text-green-600' : 'text-amber-600'}`}>
                {isVerified ? 'Active & Paid' : 'Pending Payment'}
              </h3>
            </div>
          </div>

          <div className="p-5 sm:p-6 lg:p-8 bg-white rounded-[24px] sm:rounded-[32px] border border-gray-100 flex items-center gap-4 sm:gap-5 shadow-soft hover:border-primary/30 transition-all group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-secondary/5 rounded-2xl flex items-center justify-center text-secondary group-hover:scale-110 transition-transform shrink-0">
              <Users size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-widest truncate">Your Group</p>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-secondary mt-0.5 truncate">
                {fieldRecord?.groupId?.name || 'Not Assigned'}
              </h3>
            </div>
          </div>

          <div className="p-5 sm:p-6 lg:p-8 bg-white rounded-[24px] sm:rounded-[32px] border border-gray-100 flex items-center gap-4 sm:gap-5 shadow-soft hover:border-primary/30 transition-all group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform shrink-0">
              <MapPin size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-widest truncate">Location</p>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-secondary mt-0.5 truncate">
                {fieldRecord?.village || profile?.area || 'Global Member'}
              </h3>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">

          {/* Main Column */}
          <div className="lg:col-span-8 flex flex-col gap-6 md:gap-10">

            {/* Connection Status & Discovery */}
            {fieldRecord?.connectionStatus === 'unassigned' && (
              <section className="p-6 sm:p-10 lg:p-12 bg-primary/5 rounded-[30px] md:rounded-[40px] border-2 border-dashed border-primary/30 text-center">
                <Users size={50} className="mx-auto text-primary mb-6" />
                <h2 className="text-2xl md:text-3xl font-bold text-secondary leading-tight">Connect with Local Sakhi</h2>
                <p className="text-gray-500 mt-3 mb-10 max-w-lg mx-auto leading-relaxed">Find and connect with an active field employee in your area to get your membership verified and join a group.</p>
                <div className="grid gap-4">
                  {discoveryLoading ? (
                    <div className="py-10 flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-gray-100 border-t-primary rounded-full animate-spin"></div>
                      <p className="text-gray-400 font-bold">Searching nearby Sakhis...</p>
                    </div>
                  ) : nearbyEmployees.length > 0 ? (
                    nearbyEmployees.map((emp) => (
                      <div key={emp._id} className="p-6 bg-white rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-5 shadow-soft hover:shadow-medium transition-all border border-gray-50">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-primary font-bold text-xl">
                            {emp.fullName.charAt(0)}
                          </div>
                          <div className="text-left">
                            <h4 className="text-lg font-bold text-secondary leading-tight">{emp.fullName}</h4>
                            <p className="text-sm text-gray-400 font-semibold uppercase tracking-widest mt-1">{emp.area}, {emp.block}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleConnect(emp._id)}
                          disabled={requestStatus === emp._id}
                          className="btn-primary w-full sm:w-auto py-3 px-8 text-sm"
                        >
                          {requestStatus === emp._id ? 'Connecting...' : 'Connect'}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 bg-white/50 rounded-3xl border border-gray-100 px-6">
                      <AlertCircle size={40} className="mx-auto text-gray-200 mb-4" />
                      <p className="text-gray-400 font-semibold italic">
                        No active employees found in your pincode ({fieldRecord?.pincode}) yet. <br />
                        Our team will reach out to you soon.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {fieldRecord?.connectionStatus === 'pending_request' && (
              <section className="p-8 md:p-10 bg-amber-50 rounded-[40px] border border-amber-100 flex items-center gap-6">
                <div className="w-16 h-16 bg-amber-100 rounded-3xl flex items-center justify-center text-amber-600 shrink-0">
                  <Clock size={32} />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-amber-900 leading-tight">Connection Request Pending</h2>
                  <p className="text-amber-700/80 mt-2 text-sm md:text-base leading-relaxed">Your request to connect with our local field employee is awaiting approval. You will be notified once they accept.</p>
                </div>
              </section>
            )}

            {fieldRecord?.connectionStatus === 'approved' && fieldRecord?.assignedEmployeeId && (
              <section className="p-8 md:p-10 bg-green-50 rounded-[40px] border border-green-100 flex flex-col sm:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-green-100 rounded-3xl flex items-center justify-center text-green-600 shrink-0">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-green-900 leading-tight">Connected with {fieldRecord.assignedEmployeeId.fullName}</h2>
                    <p className="text-green-700/80 mt-2 text-sm md:text-base leading-relaxed">Your account is managed by our local Sakhi Hero. You can contact them for any support.</p>
                  </div>
                </div>
                <a href={`tel:${fieldRecord.assignedEmployeeId.mobile}`} className="btn-primary w-full sm:w-auto py-4 px-8 bg-green-600 border-none shadow-xl shadow-green-200 justify-center">
                  <Phone size={20} /> Call Sakhi
                </a>
              </section>
            )}

            {/* Detailed Profile Section */}
            <section className="p-6 sm:p-10 lg:p-12 bg-white rounded-[30px] md:rounded-[40px] border border-gray-100 shadow-soft">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-secondary flex items-center gap-4">
                  <User size={28} className="text-primary" /> Member Profile
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                {[
                  { label: 'Full Name', value: profile?.fullName, icon: <User size={18} /> },
                  { label: 'Mobile Number', value: profile?.mobile, icon: <Phone size={18} /> },
                  { label: 'WhatsApp', value: profile?.whatsapp || 'Not provided', icon: <MessageSquare size={18} /> },
                  { label: 'Member ID', value: membership?.membershipId || 'Generating...', icon: <ShieldCheck size={18} /> },
                  { label: 'District', value: profile?.district || fieldRecord?.district, icon: <MapPin size={18} /> },
                  { label: 'Block', value: profile?.block || fieldRecord?.block, icon: <Home size={18} /> },
                  { label: 'Occupation', value: fieldRecord?.occupation || 'Member', icon: <Briefcase size={18} /> },
                  { label: 'Joining Date', value: new Date(profile?.createdAt).toLocaleDateString(), icon: <Calendar size={18} /> }
                ].map((item, i) => (
                  <div key={i} className="p-5 md:p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-gray-200 transition-all group">
                    <p className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">{item.label}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-primary opacity-60 group-hover:opacity-100 transition-opacity">{item.icon}</span>
                      <p className="text-sm md:text-lg font-bold text-secondary">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Receipt & Verification Section */}
            <section className="p-6 sm:p-10 lg:p-12 bg-white rounded-[30px] md:rounded-[40px] border border-gray-100 shadow-soft">
              <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-10 flex items-center gap-4">
                <CreditCard size={28} className="text-primary" /> Membership Receipt
              </h2>

              {membership ? (
                <div className="p-8 md:p-10 bg-gray-50 rounded-[35px] border-2 border-dashed border-gray-200 relative">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-200">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Receipt Number</p>
                      <h4 className="text-xl md:text-3xl font-bold text-secondary mt-1">{membership.receiptNumber}</h4>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Amount Paid</p>
                      <h4 className="text-xl md:text-3xl font-bold text-primary mt-1">₹{membership.amount}.00</h4>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3 text-green-600 font-semibold text-base md:text-lg">
                      <CheckCircle size={24} /> Verified Digital Receipt
                    </div>
                    <Link href={`/member/receipt/${membership._id}`} target="_blank" className="w-full sm:w-auto">
                      <button className="btn-primary w-full py-4 px-8 shadow-xl shadow-primary/20">
                        <FileText size={20} /> View Receipt
                      </button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-10 md:p-16 text-center bg-red-50/50 rounded-[40px] border border-red-100">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
                    <AlertCircle size={40} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-secondary leading-tight">No Active Membership Found</h3>
                  <p className="text-gray-500 mt-4 max-w-sm mx-auto leading-relaxed">Please contact your local SakhiHub Hero/Employee to verify your membership and generate a receipt.</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Column */}
          <aside className="lg:col-span-4 flex flex-col gap-6 md:gap-10">

            {/* Quick Actions */}
            <section className="p-8 bg-white rounded-[40px] border border-gray-100 shadow-soft">
              <h3 className="text-xl font-bold text-secondary mb-8">Quick Actions</h3>
              <div className="grid gap-3">
                {[
                  { label: 'Contact Employee', icon: <Phone size={20} />, color: '#E91E63' },
                  { label: 'View Group Members', icon: <Users size={20} />, color: '#6A1B9A' },
                  { label: 'Latest Campaigns', icon: <Sparkles size={20} />, color: '#F59E0B' },
                  { label: 'Help & Support', icon: <Heart size={20} />, color: '#E91E63' }
                ].map((action, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-4 p-5 w-full bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-2xl text-secondary font-semibold text-sm transition-all text-left shadow-sm hover:shadow-md"
                  >
                    <span className="shrink-0" style={{ color: action.color }}>{action.icon}</span>
                    {action.label}
                  </motion.button>
                ))}
              </div>
            </section>

            {/* Notifications / Updates */}
            <section className="p-8 bg-slate-900 rounded-[40px] text-white shadow-2xl">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                <Bell size={24} className="text-primary" /> Updates
              </h3>
              <div className="flex flex-col gap-8">
                {[
                  { title: 'New Campaign', desc: 'Sakhi Care Pads distribution starts next week.', time: '2h ago' },
                  { title: 'Meeting Reminder', desc: 'Your community group meeting is on Sunday.', time: '1d ago' },
                  { title: 'Payment Confirmed', desc: 'Membership payment verified by Admin.', time: '3d ago' }
                ].map((notif, i) => (
                  <div key={i} className="relative pl-6 border-l-2 border-primary/30 hover:border-primary transition-colors">
                    <div className="absolute left-[-5px] top-0 w-2 h-2 bg-primary rounded-full"></div>
                    <h4 className="text-base font-bold text-white leading-tight">{notif.title}</h4>
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed font-semibold">{notif.desc}</p>
                    <p className="text-[10px] text-primary font-semibold uppercase tracking-widest mt-3">{notif.time}</p>
                  </div>
                ))}
              </div>
              <button className="mt-10 w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-white font-semibold text-xs uppercase tracking-widest transition-all">
                View All Notifications
              </button>
            </section>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
