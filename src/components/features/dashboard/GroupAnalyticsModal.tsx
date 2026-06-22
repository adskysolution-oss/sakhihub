import React, { useState, useEffect } from 'react';
import { 
  Users, MapPin, X, Activity, 
  CreditCard, PieChart, ShieldCheck, 
  Wallet, FileText, UserCheck, Calendar,
  Camera, Video, AlertTriangle, Eye, ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import StatCard from '@/components/shared/StatCard';

interface GroupAnalyticsModalProps {
  groupId: string;
  onClose: () => void;
}

export default function GroupAnalyticsModal({ groupId, onClose }: GroupAnalyticsModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'meetings' | 'photos' | 'videos'>('overview');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(`/api/groups/${groupId}/analytics`);
        if (res.data.success) {
          setData(res.data.data);
        } else {
          setError(res.data.message);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    if (groupId) fetchAnalytics();
  }, [groupId]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-[32px] w-full max-w-5xl shadow-2xl overflow-hidden my-auto border border-gray-100"
        >
          {loading ? (
             <div className="p-20 flex flex-col items-center justify-center">
               <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
               <p className="mt-4 text-gray-500 font-bold">Aggregating Group Analytics...</p>
             </div>
          ) : error ? (
             <div className="p-20 text-center text-red-500 font-bold">
               {error}
               <br />
               <button onClick={onClose} className="mt-4 px-6 py-2 bg-gray-100 text-gray-700 rounded-xl">Close</button>
             </div>
          ) : data ? (
             <>
               {/* Header */}
               <div className="bg-gradient-to-r from-secondary-dark to-secondary p-8 text-white relative">
                 <button onClick={onClose} className="absolute right-6 top-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                   <X size={20} />
                 </button>
                 <div className="flex items-center gap-6">
                   <div className="w-20 h-20 bg-white text-secondary rounded-2xl flex items-center justify-center shadow-lg">
                     <PieChart size={36} className="text-primary" />
                   </div>
                   <div>
                     <div className="flex items-center gap-3 mb-2">
                       <h2 className="text-3xl font-black">{data.group.groupName}</h2>
                       <span className="px-3 py-1 bg-green-400 text-secondary text-[10px] font-black uppercase tracking-widest rounded-full">
                         Active Unit
                       </span>
                     </div>
                     <div className="flex flex-wrap gap-4 text-sm font-bold text-white/80">
                       <span className="flex items-center gap-1.5"><MapPin size={16} className="text-primary-light" /> {data.group.village}, {data.group.block}</span>
                       <span className="flex items-center gap-1.5"><UserCheck size={16} className="text-primary-light" /> Ldr: {data.group.leaderName}</span>
                       <span className="flex items-center gap-1.5"><Calendar size={16} className="text-primary-light" /> {new Date(data.group.meetingDate).toLocaleDateString()}</span>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Tabs Navigation */}
               <div className="flex border-b border-gray-100 gap-6 px-8 bg-white overflow-x-auto">
                 {([
                   { id: 'overview', label: 'Overview', icon: PieChart },
                   { id: 'meetings', label: `Meetings (${data?.stats?.totalMeetings || 0})`, icon: Calendar },
                   { id: 'photos', label: `Photos (${data?.stats?.totalPhotos || 0})`, icon: Camera },
                   { id: 'videos', label: `Videos (${data?.stats?.totalVideos || 0})`, icon: Video }
                 ] as const).map(tab => {
                   const Icon = tab.icon;
                   return (
                     <button
                       key={tab.id}
                       onClick={() => setActiveTab(tab.id)}
                       className={`flex items-center gap-2 py-4 px-1 text-xs font-black uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
                         activeTab === tab.id
                           ? 'border-primary text-primary'
                           : 'border-transparent text-gray-400 hover:text-gray-600'
                       }`}
                     >
                       <Icon size={14} />
                       {tab.label}
                     </button>
                   );
                 })}
               </div>

               {/* Body */}
               <div className="p-8 bg-gray-50/30 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-8">
                 
                 {/* Tab 1: Overview */}
                 {activeTab === 'overview' && (
                   <>
                     {/* Core KPIs */}
                     <div>
                       <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                         <Activity size={14} /> Membership Metrics
                       </h4>
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                         <StatCard label="Total Members" value={data.stats.totalMembers} icon={Users} color="bg-blue-50 text-blue-600" />
                         <StatCard label="Paid Members" value={data.stats.paidMembers} icon={ShieldCheck} color="bg-green-50 text-green-600" />
                         <StatCard label="Free Members" value={data.stats.freeMembers} icon={FileText} color="bg-gray-100 text-gray-500" />
                         <StatCard label="Connected Profiles" value={data.stats.connectedMembers} icon={Activity} color="bg-purple-50 text-purple-600" />
                       </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                       {/* Financial & Admin details */}
                       <div className="lg:col-span-1 space-y-8">
                         <div>
                           <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                             <Wallet size={14} /> Financials
                           </h4>
                           <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm text-center">
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Membership Collection</p>
                             <p className="text-4xl font-black text-green-600 mt-2 flex items-center justify-center gap-1">
                               <span className="text-xl">₹</span>{data.stats.totalCollection.toLocaleString('en-IN')}
                             </p>
                             <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between">
                                <div>
                                  <p className="text-[9px] font-bold text-gray-400 uppercase">Verified Txns</p>
                                  <p className="font-black text-secondary">{data.stats.verifiedPayments}</p>
                                </div>
                                <div>
                                  <p className="text-[9px] font-bold text-gray-400 uppercase">Avg per Txn</p>
                                  <p className="font-black text-secondary">₹{data.stats.verifiedPayments > 0 ? Math.round(data.stats.totalCollection / data.stats.verifiedPayments) : 0}</p>
                                </div>
                             </div>
                           </div>
                         </div>

                         <div>
                           <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                             <UserCheck size={14} /> Managed By
                           </h4>
                           <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg">
                                {data.group.createdBy?.fullName?.[0] || 'E'}
                              </div>
                              <div>
                                <p className="font-black text-secondary">{data.group.createdBy?.fullName || 'Unknown'}</p>
                                <p className="text-[9px] font-black text-primary uppercase tracking-widest">{data.group.createdBy?.employeeId || 'Employee'}</p>
                              </div>
                           </div>
                         </div>
                       </div>

                       {/* Recent Members Table */}
                       <div className="lg:col-span-2">
                         <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                           <Users size={14} /> Recent Enrollments
                         </h4>
                         <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                           <table className="w-full text-left">
                             <thead className="bg-gray-50/50">
                               <tr>
                                 <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                                 <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                                 <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined On</th>
                                 <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                               </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-50">
                               {data.recentMembers.length > 0 ? data.recentMembers.map((m: any) => (
                                 <tr key={m._id} className="hover:bg-gray-50/30 transition-colors">
                                   <td className="p-5 font-black text-secondary text-sm">{m.name}</td>
                                   <td className="p-5">
                                     <span className="font-bold text-gray-600 text-xs">{m.mobile}</span>
                                     <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">{m.village}</p>
                                   </td>
                                   <td className="p-5 text-xs text-gray-500 font-bold">{new Date(m.createdAt).toLocaleDateString()}</td>
                                   <td className="p-5">
                                     <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${m.membershipStatus === 'paid' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                       {m.membershipStatus}
                                     </span>
                                   </td>
                                 </tr>
                               )) : (
                                 <tr><td colSpan={4} className="p-10 text-center text-xs font-bold text-gray-400">No members assigned to this unit yet.</td></tr>
                               )}
                             </tbody>
                           </table>
                           {data.recentMembers.length > 0 && (
                             <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
                               <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View All {data.stats.totalMembers} Members</button>
                             </div>
                           )}
                         </div>
                       </div>
                     </div>
                   </>
                 )}

                 {/* Tab 2: Meetings Log */}
                 {activeTab === 'meetings' && (
                   <div className="space-y-6">
                     {data.meetings && data.meetings.length > 0 ? (
                       data.meetings.map((meeting: any) => (
                         <div 
                           key={meeting._id} 
                           className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4"
                         >
                           <div className="flex flex-wrap justify-between items-center gap-4">
                             <div className="flex items-center gap-3">
                               <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                                 <Calendar size={20} />
                               </div>
                               <div>
                                 <h4 className="font-black text-secondary text-sm">
                                   {new Date(meeting.meetingDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                 </h4>
                                 <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                                   Conducted by: {meeting.conductedBy?.fullName || 'Unknown'} ({meeting.conductedBy?.employeeId || 'Employee'})
                                 </p>
                               </div>
                             </div>
                             
                             <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                               meeting.status === 'verified' 
                                 ? 'bg-green-50 text-green-600' 
                                 : meeting.status === 'rejected' 
                                 ? 'bg-red-50 text-red-600' 
                                 : meeting.status === 'submitted' 
                                 ? 'bg-blue-50 text-blue-600' 
                                 : 'bg-gray-100 text-gray-400'
                             }`}>
                               {meeting.status}
                             </span>
                           </div>

                           {meeting.status === 'rejected' && (
                             <div className="flex gap-2 p-4 bg-red-50/50 border border-red-100 rounded-2xl text-red-700 text-xs font-medium">
                               <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                               <div>
                                 <strong className="font-bold">Rejection Reason:</strong>
                                 <p className="mt-1 text-red-600">{meeting.rejectionReason}</p>
                               </div>
                             </div>
                           )}

                           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-50 text-center">
                             <div>
                               <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Attendees</p>
                               <p className="font-black text-secondary text-sm mt-1">{meeting.attendeesCount}</p>
                             </div>
                             <div>
                               <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Photos</p>
                               <p className="font-black text-secondary text-sm mt-1">{meeting.photoCount}</p>
                             </div>
                             <div>
                               <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Videos</p>
                               <p className="font-black text-secondary text-sm mt-1">{meeting.videoCount}</p>
                             </div>
                             <div>
                               <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Village</p>
                               <p className="font-black text-secondary text-sm mt-1 truncate">{meeting.village}</p>
                             </div>
                           </div>

                           {meeting.remarks && (
                             <p className="text-xs text-gray-500 italic pl-3 border-l-2 border-gray-300">
                               "{meeting.remarks}"
                             </p>
                           )}
                         </div>
                       ))
                     ) : (
                       <div className="text-center py-16 bg-white rounded-[32px] border border-gray-100">
                         <Calendar size={40} className="text-gray-300 mx-auto mb-3" />
                         <p className="text-gray-400 text-sm font-bold">No meetings conducted in this group yet.</p>
                       </div>
                     )}
                   </div>
                 )}

                 {/* Tab 3: Photos Gallery */}
                 {activeTab === 'photos' && (
                   <div>
                     {data.media && data.media.filter((m: any) => m.type === 'photo').length > 0 ? (
                       <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                         {data.media.filter((m: any) => m.type === 'photo').map((item: any) => (
                           <div 
                             key={item._id}
                             onClick={() => setLightboxImage(item.url)}
                             className="group relative rounded-2xl overflow-hidden aspect-square border border-gray-100 shadow-sm cursor-pointer"
                           >
                             <img 
                               src={item.url} 
                               alt="Meeting Evidence" 
                               className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                             />
                             <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white">
                               <Eye size={20} />
                             </div>
                           </div>
                         ))}
                       </div>
                     ) : (
                       <div className="text-center py-16 bg-white rounded-[32px] border border-gray-100">
                         <Camera size={40} className="text-gray-300 mx-auto mb-3" />
                         <p className="text-gray-400 text-sm font-bold">No photo evidence uploaded yet.</p>
                       </div>
                     )}
                   </div>
                 )}

                 {/* Tab 4: Videos Stream */}
                 {activeTab === 'videos' && (
                   <div>
                     {data.media && data.media.filter((m: any) => m.type === 'video').length > 0 ? (
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                         {data.media.filter((m: any) => m.type === 'video').map((item: any) => (
                           <div 
                             key={item._id} 
                             className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm"
                           >
                             <div className="relative bg-black aspect-video">
                               <video 
                                 src={item.url} 
                                 controls 
                                 className="w-full h-full"
                                 preload="metadata"
                               />
                             </div>
                             <div className="p-4 space-y-1">
                               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                 Uploaded: {new Date(item.uploadedAt).toLocaleDateString()}
                               </p>
                               {item.duration && (
                                 <p className="text-xs text-primary font-black">
                                   Duration: {Math.round(item.duration)}s
                                 </p>
                               )}
                             </div>
                           </div>
                         ))}
                       </div>
                     ) : (
                       <div className="text-center py-16 bg-white rounded-[32px] border border-gray-100">
                         <Video size={40} className="text-gray-300 mx-auto mb-3" />
                         <p className="text-gray-400 text-sm font-bold">No video evidence uploaded yet.</p>
                       </div>
                     )}
                   </div>
                 )}

               </div>
             </>
          ) : null}
        </motion.div>

        {/* Fullscreen Lightbox Overlay */}
        <AnimatePresence>
          {lightboxImage && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
              <button 
                onClick={() => setLightboxImage(null)} 
                className="absolute right-6 top-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer border-none outline-none"
              >
                <X size={24} />
              </button>
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative max-w-full max-h-full flex items-center justify-center"
              >
                <img 
                  src={lightboxImage} 
                  alt="Evidence View" 
                  className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl" 
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}

