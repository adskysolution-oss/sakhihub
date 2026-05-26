'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import axios from "axios";
import MembershipTable from "@/components/features/dashboard/MembershipTable";
import { toast } from 'sonner';
import { 
  Users, CheckCircle2, AlertCircle, IndianRupee, Download, 
  Settings2, Save, FileText, ToggleLeft, ToggleRight, Calendar, Filter, Clock
} from "lucide-react";

export default function AdminMembershipsPage() {
  const [memberships, setMemberships] = useState<any[]>([]);
  const [unpaidMembers, setUnpaidMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [activeTab, setActiveTab] = useState<"ledger" | "unpaid">("ledger");

  // Member statistics state
  const [memberStats, setMemberStats] = useState({ total: 0, paid: 0, pending: 0 });

  // Dynamic configuration state
  const [commConfig, setCommConfig] = useState<any>({
    membershipFee: 100,
    membershipPaymentEnabled: true
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchMemberships = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/memberships');
      if (res.data.success) setMemberships(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberStats = async () => {
    try {
      const res = await axios.get('/api/admin/members');
      if (res.data.success) {
        const list = res.data.data;
        const total = list.length;
        const paid = list.filter((m: any) => m.paymentStatus === 'Paid' || m.membershipStatus === 'paid').length;
        const pending = total - paid;
        setMemberStats({ total, paid, pending });

        // Filter out unpaid members
        const unpaid = list.filter((m: any) => m.paymentStatus !== 'Paid' && m.membershipStatus !== 'paid');
        setUnpaidMembers(unpaid);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCommissionConfig = async () => {
    try {
      const res = await axios.get('/api/admin/commission-config');
      if (res.data.success) {
        setCommConfig(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMemberships();
    fetchMemberStats();
    fetchCommissionConfig();
  }, []);

  const handleConfirmCashPayment = async (member: any) => {
    if (!confirm(`Are you sure you want to confirm Cash payment of ₹${commConfig.membershipFee || 100} for ${member.name}? This will instantly update their status and automatically distribute applicable service incentives.`)) return;
    try {
      const res = await axios.post('/api/memberships', {
        memberId: member._id,
        groupId: member.groupId?._id || null,
        paymentMode: 'Cash'
      });
      if (res.data.success) {
        toast.success(`Successfully registered Cash payment for ${member.name}!`);
        fetchMemberships();
        fetchMemberStats();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to register membership payment');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await axios.post('/api/admin/commission-config', {
        membershipFee: commConfig.membershipFee,
        membershipPaymentEnabled: commConfig.membershipPaymentEnabled
      });
      if (res.data.success) {
        setCommConfig(res.data.data);
        toast.success('Membership control settings updated successfully!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const filteredMemberships = memberships.filter(m => {
    const matchesStatus = filterStatus === "all" || m.paymentStatus === filterStatus;
    const matchesMonth = filterMonth === "all" || new Date(m.paymentDate || m.createdAt).getMonth().toString() === filterMonth;
    return matchesStatus && matchesMonth;
  });

  const totalCollected = filteredMemberships.filter(m => m.paymentStatus === 'Paid').reduce((sum, item) => sum + (item.amount || 100), 0);

  // Client-side CSV Download Report Generator
  const downloadCSVReport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Membership ID,Receipt Number,Member Name,Group Name,Amount,Payment Mode,Date,Status,Employee Recruiter\n";
    
    filteredMemberships.forEach(m => {
      const row = [
        m.membershipId || 'N/A',
        m.receiptNumber || 'N/A',
        `"${m.memberId?.name || 'Unknown Member'}"`,
        `"${m.groupId?.groupName || 'No Group Assigned'}"`,
        `INR ${m.amount || 100}`,
        m.paymentMode || 'N/A',
        new Date(m.paymentDate || m.createdAt).toLocaleDateString('en-IN'),
        m.paymentStatus || 'N/A',
        `"${m.employeeId?.fullName || 'System'}"`
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sakhihub_membership_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 max-w-6xl mx-auto p-4 sm:p-6 lg:p-10">
        
        {/* Main Title Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-secondary tracking-tight">Membership Control Center</h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">Manage rural member onboardings, manual payment confirmations, fees, and network revenues</p>
          </div>
          <button
            onClick={downloadCSVReport}
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all"
          >
            <Download size={16} /> Export CSV Report
          </button>
        </div>

        {/* Dynamic Analytics Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-soft flex items-center gap-4 group">
            <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
              <Users size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Members</p>
              <h3 className="text-2xl font-black text-secondary mt-0.5">{memberStats.total}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-soft flex items-center gap-4 group">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shrink-0 group-hover:scale-110 transition-transform">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Paid Members</p>
              <h3 className="text-2xl font-black text-green-600 mt-0.5">{memberStats.paid}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-soft flex items-center gap-4 group">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shrink-0 group-hover:scale-110 transition-transform">
              <AlertCircle size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Unpaid Members</p>
              <h3 className="text-2xl font-black text-amber-600 mt-0.5">{memberStats.pending}</h3>
            </div>
          </div>

          <div className="bg-gradient-to-br from-secondary to-slate-900 p-6 rounded-[30px] text-white shadow-xl flex items-center gap-4 group relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-primary shrink-0 relative z-10">
              <IndianRupee size={22} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Membership Revenue</p>
              <h3 className="text-2xl font-black mt-0.5 text-primary">₹{totalCollected.toLocaleString()}</h3>
            </div>
          </div>

        </section>

        {/* Dynamic Settings & Config Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Configuration Settings Panel */}
          <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-[35px] border border-gray-100 shadow-soft flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-black text-secondary flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
                <Settings2 size={20} className="text-primary" /> System Config
              </h3>
              <p className="text-gray-400 text-xs font-semibold leading-relaxed mb-6">Configure the rural membership charge and toggle whether payments are required globally.</p>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Membership Charge Amount (₹)</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-gray-400 font-bold">₹</span>
                    <input
                      type="number"
                      required
                      value={commConfig.membershipFee}
                      onChange={(e) => setCommConfig({ ...commConfig, membershipFee: Number(e.target.value) })}
                      className="w-full pl-8 pr-4 py-3 bg-[#f8f9fa] border-none text-secondary rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center bg-[#f8f9fa] p-4 rounded-2xl">
                  <div>
                    <h4 className="text-xs font-bold text-secondary">Require Membership Payments</h4>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Toggle payment requirements platform-wide.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCommConfig({ ...commConfig, membershipPaymentEnabled: !commConfig.membershipPaymentEnabled })}
                    className="text-primary hover:scale-105 transition-transform"
                  >
                    {commConfig.membershipPaymentEnabled ? <ToggleRight size={40} /> : <ToggleLeft size={40} className="text-gray-300" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="w-full py-4 bg-secondary hover:bg-secondary-dark text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Save size={16} /> {savingSettings ? 'Saving...' : 'Save Settings'}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: Filters and Table Panel */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Tab selector */}
            <div className="flex gap-6 border-b border-gray-100 pb-2">
              <button 
                onClick={() => setActiveTab("ledger")}
                className={`pb-3 px-2 font-black text-sm uppercase tracking-wider border-b-2 transition-all ${activeTab === 'ledger' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-secondary'}`}
              >
                Membership Ledger ({filteredMemberships.length})
              </button>
              <button 
                onClick={() => setActiveTab("unpaid")}
                className={`pb-3 px-2 font-black text-sm uppercase tracking-wider border-b-2 transition-all ${activeTab === 'unpaid' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-secondary'}`}
              >
                Unpaid Members Ledger ({unpaidMembers.length})
              </button>
            </div>

            {activeTab === 'ledger' ? (
              <>
                {/* Filters Bar */}
                <div className="bg-white p-5 rounded-[25px] border border-gray-100 shadow-soft flex gap-4 flex-wrap items-center">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <Filter size={16} className="text-primary" /> Filter Transactions:
                  </div>

                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2.5 bg-[#f8f9fa] border-none text-secondary rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="all">All Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                  
                  <select 
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="px-4 py-2.5 bg-[#f8f9fa] border-none text-secondary rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="all">All Months</option>
                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month, idx) => (
                      <option key={month} value={idx.toString()}>{month}</option>
                    ))}
                  </select>
                </div>

                {/* Memberships Ledger Table */}
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-secondary flex items-center gap-2 pl-2">
                    <FileText size={20} className="text-primary" /> Membership Ledger List
                  </h3>
                  
                  {loading ? (
                    <div className="bg-white p-20 rounded-[35px] border border-gray-100 shadow-soft text-center flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest animate-pulse">Syncing platform ledger...</p>
                    </div>
                  ) : filteredMemberships.length === 0 ? (
                    <div className="bg-white p-20 rounded-[35px] border border-gray-100 shadow-soft text-center">
                      <AlertCircle size={40} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-400 font-bold italic">No matching membership transaction records found.</p>
                    </div>
                  ) : (
                    <MembershipTable 
                      data={filteredMemberships} 
                      isAdmin={true} 
                      onUpdate={() => {
                        fetchMemberships();
                        fetchMemberStats();
                      }} 
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-secondary flex items-center gap-2 pl-2">
                  <AlertCircle size={20} className="text-primary" /> Unpaid Members List
                </h3>

                <div className="w-full bg-white rounded-3xl overflow-hidden shadow-soft border border-gray-100">
                  <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                          <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Member Info</th>
                          <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mobile</th>
                          <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pincode / Block</th>
                          <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Group</th>
                          <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                          <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {unpaidMembers.length > 0 ? unpaidMembers.map((m) => (
                          <tr key={m._id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-6 py-5">
                              <p className="font-bold text-secondary leading-tight">{m.name}</p>
                              <p className="text-[10px] text-gray-400 font-semibold mt-1 uppercase tracking-widest">Joined {new Date(m.createdAt).toLocaleDateString('en-IN')}</p>
                            </td>
                            <td className="px-6 py-5 font-bold text-secondary text-sm">
                              {m.mobile}
                            </td>
                            <td className="px-6 py-5">
                              <p className="font-bold text-secondary text-xs">{m.pincode || 'N/A'}</p>
                              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">{m.block || 'Local'}</p>
                            </td>
                            <td className="px-6 py-5">
                              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                                {m.groupId?.groupName || 'Unassigned'}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-600">
                                <Clock size={12} /> Pending Cash/Online
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <button 
                                onClick={() => handleConfirmCashPayment(m)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:scale-105 active:scale-95 transition-all"
                              >
                                Confirm Cash Payment
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-20 text-center text-gray-400 italic font-semibold">
                              All members have active paid memberships!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>

        </section>

      </div>
    </DashboardLayout>
  );
}
