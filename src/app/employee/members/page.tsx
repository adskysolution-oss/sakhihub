'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import AddMemberForm from "@/components/features/dashboard/AddMemberForm";
import MemberDetailsModal from "@/components/features/dashboard/MemberDetailsModal";
import GroupAssignModal from "@/components/features/dashboard/GroupAssignModal";
import { 
  UserPlus, Plus, Search, Filter, Phone, MapPin, 
  IndianRupee, CheckCircle2, ChevronDown 
} from "lucide-react";
import axios from "axios";

export default function EmployeeMembersPage() {
  const [activeTab, setActiveTab] = useState<'my-members' | 'discovery'>('my-members');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [assigningMember, setAssigningMember] = useState<any>(null);
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
    setAssigningMember(member);
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-secondary">{activeTab === 'discovery' ? 'Discover Members' : 'My Women Members'}</h2>
          <p className="text-gray-500 text-sm md:text-base">{activeTab === 'discovery' ? 'Find unassigned members in your area to connect.' : 'Manage members connected to you.'}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary w-full md:w-auto justify-center gap-2 py-3 px-6 text-sm">
          <Plus size={20} /> Add New Member
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 md:gap-8 mb-6 md:mb-8 border-b border-gray-100 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('my-members')}
          className={`whitespace-nowrap pb-4 px-2 text-sm md:text-lg font-bold transition-all ${activeTab === 'my-members' ? 'text-primary border-b-4 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
          My Members
        </button>
        <button 
          onClick={() => setActiveTab('discovery')}
          className={`whitespace-nowrap pb-4 px-2 text-sm md:text-lg font-bold transition-all ${activeTab === 'discovery' ? 'text-primary border-b-4 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Discover (Nearby)
        </button>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-3xl mb-6 md:mb-10 flex flex-col md:flex-row gap-4 shadow-soft">
         <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or mobile..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 md:py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm md:text-base"
            />
         </div>
         {activeTab === 'my-members' && (
            <div className="flex gap-2">
              <div className="relative flex-1 md:flex-none">
                <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <select 
                  value={filterGroup}
                  onChange={(e) => setFilterGroup(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 md:py-4 rounded-2xl border border-gray-100 bg-gray-50 font-bold text-sm md:text-base appearance-none min-w-[160px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Groups</option>
                  {groups.map(g => <option key={g as string} value={g as string}>{g as string}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
         )}
      </div>

      <div className="bg-white rounded-[32px] overflow-hidden shadow-soft border border-gray-50">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Member Name</th>
                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Contact & Location</th>
                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">{activeTab === 'discovery' ? 'Area' : 'Group'}</th>
                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-gray-400 font-bold">
                    <div className="animate-pulse">Loading members...</div>
                  </td>
                </tr>
              ) : filteredMembers.map((member) => (
                <tr key={member._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-black text-sm shadow-lg shadow-primary/20">
                        {member.name.charAt(0)}
                      </div>
                      <span className="font-black text-secondary">{member.name}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-600"><Phone size={14} className="text-primary" /> {member.mobile}</div>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400"><MapPin size={14} /> {member.block}, {member.district}</div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-sm font-black text-secondary/70">
                      {activeTab === 'discovery' ? (member.area || 'N/A') : (member.groupId?.groupName || 'No Group')}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      member.connectionStatus === 'approved' 
                        ? 'bg-green-50 text-green-600 border border-green-100' 
                        : 'bg-gray-50 text-gray-400 border border-gray-100'
                    }`}>
                      {member.connectionStatus || 'Unassigned'}
                    </span>
                  </td>
                  <td className="p-6">
                    {activeTab === 'discovery' ? (
                      <button 
                        onClick={() => handleSendRequest(member.userId)}
                        disabled={!!actionLoading || member.connectionStatus === 'pending_request'}
                        className="px-6 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-primary/20"
                      >
                        {member.connectionStatus === 'pending_request' ? 'Request Sent' : (actionLoading === member.userId ? 'Sending...' : 'Send Request')}
                      </button>
                    ) : (
                      <div className="flex gap-4">
                         <button 
                          onClick={() => setSelectedMember(member)}
                          className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline"
                         >Details</button>
                         {!member.groupId && (
                           <button 
                            onClick={() => handleGroupAssign(member)}
                            className="text-secondary text-[10px] font-black uppercase tracking-widest hover:underline"
                           >+ Group</button>
                         )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-gray-400 font-bold italic">
                    No members found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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

      {assigningMember && (
        <GroupAssignModal 
          member={assigningMember} 
          onClose={(assigned) => {
            setAssigningMember(null);
            if (assigned) fetchMembers();
          }} 
        />
      )}
    </DashboardLayout>
  );
}
