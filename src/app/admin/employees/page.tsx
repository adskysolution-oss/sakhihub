'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { 
  UserCircle, MapPin, TrendingUp, Search, Plus, 
  Edit2, Trash2, ShieldCheck, ShieldAlert,
  Phone, Mail, Calendar, Filter, X
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import RegisterPartnerModal from "@/components/features/dashboard/RegisterPartnerModal";

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/employees?status=${status}&search=${search}`);
      if (res.data.success) setEmployees(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, status]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await axios.patch(`/api/admin/employees/${id}/status`, { status: newStatus });
      if (res.data.success) {
        fetchEmployees();
        setSelectedEmp(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-start flex-wrap gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-secondary">Employee Command Center</h1>
            <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">Verify, approve, and manage your field force operations.</p>
          </div>
          <button 
            onClick={() => setShowRegisterModal(true)}
            className="btn-primary py-4 px-8"
          >
            <Plus size={20} /> Add New Staff
          </button>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft">
          <div className="flex gap-4 mb-8 flex-wrap">
            <div className="relative flex-1 min-w-[300px]">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, ID, mobile or email..." 
                className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
            <div className="flex gap-2 bg-gray-50 p-1.5 rounded-2xl">
               {['all', 'pending', 'active', 'rejected'].map((s) => (
                 <button 
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${status === s ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                   {s}
                 </button>
               ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr className="text-left border-b-2 border-gray-50">
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee Profile</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Region & Role</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined On</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                   <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-bold italic">Syncing with field records...</td></tr>
                ) : employees.length === 0 ? (
                   <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-bold italic">No field staff found matching the criteria.</td></tr>
                ) : (
                   employees.map((emp) => (
                    <tr key={emp._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer group">
                      <td className="p-5">
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-xl shadow-lg">
                            {emp.fullName[0]}
                          </div>
                          <div>
                            <p className="font-black text-secondary leading-tight">{emp.fullName}</p>
                            <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">Joined {new Date(emp.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col gap-1">
                          <span className="font-black text-secondary text-sm">{emp.designation || 'Field Staff'}</span>
                          <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
                            <MapPin size={10} className="text-primary" /> {emp.block}, {emp.district}
                          </span>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${emp.status === 'active' ? 'bg-green-100 text-green-600' : emp.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="p-5 text-gray-400 font-bold text-xs uppercase tracking-widest">
                        {new Date(emp.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-5">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setSelectedEmp(emp)}
                            className="px-5 py-2.5 rounded-xl border border-gray-100 bg-white text-secondary font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all"
                          >Details</button>
                          {emp.status === 'pending' && (
                            <button 
                              onClick={() => handleStatusUpdate(emp._id, 'active')}
                              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                            >Approve</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Employee Detail Modal */}
        <AnimatePresence>
          {selectedEmp && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedEmp(null)}
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }} 
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                style={{ 
                  position: 'relative', background: 'white', width: '100%', maxWidth: '800px', borderRadius: '35px', 
                  overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' 
                }}
              >
                <div style={{ background: 'var(--grad-primary)', padding: '40px', color: 'white', position: 'relative' }}>
                  <button 
                    onClick={() => setSelectedEmp(null)}
                    style={{ position: 'absolute', right: '20px', top: '20px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: 'white', cursor: 'pointer' }}
                  ><X size={20} /></button>
                  <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)' }}>
                      {selectedEmp.fullName[0]}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '2rem', fontWeight: '900', margin: 0 }}>{selectedEmp.fullName}</h3>
                      <p style={{ fontSize: '1.1rem', opacity: 0.9, margin: '5px 0' }}>{selectedEmp.designation || 'Field Employee Application'}</p>
                      <span style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '800' }}>{selectedEmp.status.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ padding: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                  <div>
                    <h4 style={{ color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '15px' }}>Contact Details</h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <p style={{ margin: 0, fontWeight: '700', display: 'flex', gap: '10px' }}><Phone size={18} color="var(--primary)" /> {selectedEmp.mobile}</p>
                      <p style={{ margin: 0, fontWeight: '700', display: 'flex', gap: '10px' }}><Mail size={18} color="var(--primary)" /> {selectedEmp.email || 'No email provided'}</p>
                      <p style={{ margin: 0, fontWeight: '700', display: 'flex', gap: '10px' }}><MapPin size={18} color="var(--primary)" /> {selectedEmp.address || 'Address N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <h4 style={{ color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '15px' }}>Assignment & ID</h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <p style={{ margin: 0, fontWeight: '700' }}>Block: {selectedEmp.block || 'N/A'}</p>
                      <p style={{ margin: 0, fontWeight: '700' }}>District: {selectedEmp.district || 'N/A'}</p>
                      <p style={{ margin: 0, fontWeight: '700' }}>Qualification: {selectedEmp.qualification || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '0 40px 40px', display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                   {selectedEmp.status === 'pending' ? (
                     <>
                        <button 
                          onClick={() => handleStatusUpdate(selectedEmp._id, 'rejected')}
                          style={{ padding: '15px 30px', borderRadius: '15px', border: '1px solid #ef4444', color: '#ef4444', fontWeight: '800', cursor: 'pointer' }}
                        >Reject Application</button>
                        <button 
                          onClick={() => handleStatusUpdate(selectedEmp._id, 'active')}
                          style={{ padding: '15px 40px', borderRadius: '15px', border: 'none', background: 'var(--grad-primary)', color: 'white', fontWeight: '800', cursor: 'pointer' }}
                        >Approve & Activate</button>
                     </>
                   ) : selectedEmp.status === 'active' ? (
                     <button 
                       onClick={() => handleStatusUpdate(selectedEmp._id, 'inactive')}
                       style={{ padding: '15px 30px', borderRadius: '15px', border: '1px solid #ef4444', color: '#ef4444', fontWeight: '800', cursor: 'pointer' }}
                     >Deactivate Staff</button>
                   ) : (
                     <button 
                       onClick={() => handleStatusUpdate(selectedEmp._id, 'active')}
                       style={{ padding: '15px 30px', borderRadius: '15px', border: 'none', background: 'var(--grad-primary)', color: 'white', fontWeight: '800', cursor: 'pointer' }}
                     >Re-activate Staff</button>
                   )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        <RegisterPartnerModal 
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onSuccess={() => fetchEmployees()}
          role="employee"
        />
      </div>
    </DashboardLayout>
  );
}
