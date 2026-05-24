'use client';

import React from 'react';
import {
  X, User, Phone, MapPin, Calendar,
  Heart, Briefcase, Users, ShieldCheck,
  Clock, IndianRupee, CheckCircle2, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MemberDetailsModalProps {
  member: any;
  onClose: () => void;
}

import axios from 'axios';
import { toast } from 'sonner';

export default function MemberDetailsModal({ member, onClose }: MemberDetailsModalProps) {
  const [groups, setGroups] = React.useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [assigning, setAssigning] = React.useState(false);

  React.useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get('/api/groups');
        if (res.data.success) setGroups(res.data.data);
      } catch (err) {
        console.error("Failed to fetch groups", err);
      }
    };
    fetchGroups();
  }, []);

  const handleAssign = async () => {
    if (!selectedGroup) return;
    setAssigning(true);
    try {
      const res = await axios.patch(`/api/member/${member._id}/group-assign`, { groupId: selectedGroup });
      if (res.data.success) {
        toast.success("Member assigned to group successfully");
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign group");
    } finally {
      setAssigning(false);
    }
  };

  if (!member) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[1000] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-5xl rounded-[40px] h-[95vh] md:h-auto md:max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col mx-auto"
      >
        {/* Header Section */}
        <section className="bg-gradient-to-br from-primary to-secondary-dark p-8 md:p-14 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 md:right-10 md:top-10 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-xl rounded-full flex items-center justify-center transition-all group"
          >
            <X size={24} className="group-hover:rotate-90 transition-transform" />
          </button>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 text-center md:text-left mt-4 md:mt-0">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-[32px] flex items-center justify-center text-4xl md:text-6xl font-bold text-primary shadow-2xl shadow-black/20">
              {member?.name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-4 break-words">{member.name}</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] md:text-xs font-semibold tracking-widest uppercase flex items-center gap-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                  <Users size={14} className="shrink-0" /> {member.groupId?.groupName || 'No Group'}
                </span>
                <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] md:text-xs font-semibold tracking-widest uppercase flex items-center gap-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                  <MapPin size={14} className="shrink-0" /> {member.village}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 md:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">

            {/* Left Column: Profile Details */}
            <div className="flex flex-col gap-10 md:gap-14">
              <div className="bg-white rounded-3xl">
                <SectionTitle icon={User} title="Personal Information" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 mt-8">
                  <InfoItem label="Full Name" value={member.name} />
                  <InfoItem label="Mobile" value={member.mobile} />
                  <InfoItem label="Age" value={member.age ? `${member.age} Years` : 'N/A'} />
                  <InfoItem label="Marital Status" value={member.maritalStatus} />
                  <div className="sm:col-span-2">
                    <InfoItem label="Occupation" value={member.occupation} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl">
                <SectionTitle icon={Heart} title="Interests" />
                <div className="flex flex-wrap gap-2 md:gap-3 mt-8">
                  {member.interests && member.interests.length > 0 ? (
                    member.interests.map((interest: string, i: number) => (
                      <span key={i} className="bg-primary/5 text-primary px-5 py-2.5 rounded-2xl text-[11px] font-semibold uppercase tracking-widest border border-primary/10 shadow-sm transition-all hover:bg-primary/10">
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs font-bold text-gray-300 italic pl-2">No interests listed</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Location & Status */}
            <div className="flex flex-col gap-10 md:gap-14">
              <div className="bg-white rounded-3xl">
                <SectionTitle icon={MapPin} title="Geography" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 mt-8">
                  <InfoItem label="Village" value={member.village} />
                  <InfoItem label="Block" value={member.block} />
                  <div className="sm:col-span-2">
                    <InfoItem label="District" value={member.district} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl">
                <SectionTitle icon={ShieldCheck} title="Membership Status" />
                <div className={`mt-8 p-8 rounded-[32px] border-2 flex flex-col gap-6 transition-all ${member.membershipStatus === 'paid'
                    ? 'bg-green-50/50 border-green-100 text-green-700'
                    : 'bg-amber-50/50 border-amber-100 text-amber-700'
                  }`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Activation Status</p>
                      <h4 className="text-xl md:text-2xl font-black leading-tight break-words">
                        {member.membershipStatus === 'paid' ? 'Verified Member' : 'Pending Verification'}
                      </h4>
                    </div>
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${member.membershipStatus === 'paid' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                      {member.membershipStatus === 'paid' ? <CheckCircle2 size={26} /> : <Clock size={26} />}
                    </div>
                  </div>
                  <p className="text-xs font-bold leading-relaxed opacity-90 border-t border-current/10 pt-4">
                    {member.membershipStatus === 'paid'
                      ? 'This member has completed the registration and paid the required fee. They are now an active part of the SakhiHub community.'
                      : 'Initial registration is complete. Please collect and verify the ₹100 membership fee to activate their account features.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 py-6 border-y border-gray-100">
                <div className="flex items-center gap-3 text-xs font-semibold text-gray-400">
                  <Calendar size={14} className="text-primary" /> Joined on {new Date(member.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold text-gray-400">
                  <Users size={14} className="text-primary" /> Created By: <span className="text-secondary font-semibold">{member.createdBy?.fullName || 'Self Registration'}</span>
                </div>
              </div>

              {!member.groupId && (
                <div className="p-8 bg-secondary/5 rounded-[32px] border border-dashed border-secondary/30">
                  <SectionTitle icon={Users} title="Assign to Group" />
                  <p className="text-xs font-semibold text-gray-400 mt-4 leading-relaxed">This member is not assigned to any group. Select a group to connect them.</p>
                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <div className="relative flex-1">
                      <select
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        className="w-full p-4 rounded-2xl bg-white border border-secondary/20 font-semibold text-xs text-secondary appearance-none focus:outline-none focus:ring-2 focus:ring-secondary/20"
                      >
                        <option value="">Select a Group...</option>
                        {groups.map(g => (
                          <option key={g._id} value={g._id}>
                            {g.groupName} ({g.village})
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
                    </div>
                    <button
                      onClick={handleAssign}
                      disabled={!selectedGroup || assigning}
                      className="btn-primary py-4 px-10 text-[10px] font-semibold uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50"
                    >
                      {assigning ? 'Assigning...' : 'Assign'}
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <SectionTitle icon={IndianRupee} title="Payment Details" />
                <div className="mt-6 p-6 bg-gray-50 rounded-3xl flex justify-between items-center border border-gray-100">
                  <div>
                    <p className="text-sm font-bold text-secondary">Membership Fee</p>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">One-time Registration</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${member.membershipStatus === 'paid' ? 'text-green-600' : 'text-secondary'}`}>₹100.00</p>
                    <p className={`text-[10px] font-bold tracking-widest uppercase mt-1 ${member.membershipStatus === 'paid' ? 'text-green-600' : 'text-amber-500'}`}>
                      {member.membershipStatus === 'paid' ? 'PAID' : 'PENDING'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: any, title: string }) {
  return (
    <div className="flex items-center gap-4 text-lg md:text-xl font-black text-secondary uppercase tracking-tighter border-b border-gray-50 pb-4">
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
        <Icon size={22} />
      </div>
      {title}
    </div>
  );
}

function InfoItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col gap-2 p-4 md:p-6 bg-gray-50/50 rounded-3xl border border-transparent hover:border-gray-100 transition-all group">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 group-hover:text-primary transition-colors">{label}</p>
      <p className="text-sm md:text-lg font-black text-secondary leading-tight break-words">{value || 'N/A'}</p>
    </div>
  );
}
