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

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedEmp, setSelectedEmp] = useState<any>(null);

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
      <div style={{ padding: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--secondary)' }}>Employee Command Center</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Verify, approve, and manage your field force operations.</p>
          </div>
          <button className="btn-primary" style={{ padding: '15px 30px' }}>
            <Plus size={20} /> Add New Staff
          </button>
        </div>

        <div className="glass-card" style={{ padding: '30px', background: 'white', borderRadius: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', marginBottom: '30px' }}>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
              <Search size={18} style={{ position: 'absolute', left: '15px', top: '16px', color: '#999' }} />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, ID, mobile or email..." 
                style={{ padding: '15px 15px 15px 45px', borderRadius: '15px', border: '1px solid #eee', width: '100%', fontSize: '1rem', outline: 'none' }} 
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
               {['all', 'pending', 'active', 'rejected'].map((s) => (
                 <button 
                  key={s}
                  onClick={() => setStatus(s)}
                  style={{ 
                    padding: '10px 20px', 
                    borderRadius: '12px', 
                    border: '1px solid',
                    borderColor: status === s ? 'var(--primary)' : '#eee',
                    background: status === s ? '#FFF5F8' : 'white',
                    color: status === s ? 'var(--primary)' : '#666',
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    transition: '0.2s'
                  }}
                 >
                   {s}
                 </button>
               ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f8f9fa' }}>
                  <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Employee Profile</th>
                  <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Region & Role</th>
                  <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Joined On</th>
                  <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Fetching data from database...</td></tr>
                ) : employees.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No employees found matching the criteria.</td></tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp._id} style={{ borderBottom: '1px solid #f8f9fa', transition: '0.2s' }} className="table-row">
                      <td style={{ padding: '15px 20px' }}>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                          <div style={{ width: '45px', height: '45px', borderRadius: '14px', background: 'var(--grad-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.1rem' }}>
                            {emp.fullName[0]}
                          </div>
                          <div>
                            <p style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--secondary)', margin: 0 }}>{emp.fullName}</p>
                            <p style={{ fontSize: '0.8rem', color: '#999', margin: '2px 0 0' }}>ID: {emp.employeeId || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--secondary)' }}>{emp.designation || 'Field Staff'}</span>
                          <span style={{ fontSize: '0.8rem', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} color="var(--primary)" /> {emp.block}, {emp.district}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <span style={{ 
                          padding: '6px 12px', 
                          borderRadius: '8px', 
                          fontSize: '0.75rem', 
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          background: emp.status === 'active' ? '#ecfdf5' : emp.status === 'pending' ? '#fffbeb' : '#fef2f2',
                          color: emp.status === 'active' ? '#059669' : emp.status === 'pending' ? '#d97706' : '#ef4444'
                        }}>
                          {emp.status}
                        </span>
                      </td>
                      <td style={{ padding: '15px 20px', color: '#666', fontSize: '0.85rem' }}>
                        {new Date(emp.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button 
                            onClick={() => setSelectedEmp(emp)}
                            style={{ padding: '8px 12px', borderRadius: '10px', background: '#f8f9fa', border: '1px solid #eee', color: 'var(--secondary)', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
                          >Details</button>
                          {emp.status === 'pending' && (
                            <button 
                              onClick={() => handleStatusUpdate(emp._id, 'active')}
                              style={{ padding: '8px 12px', borderRadius: '10px', background: 'var(--grad-primary)', border: 'none', color: 'white', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
                            >Quick Approve</button>
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
      </div>
      <style jsx>{`
        .table-row:hover { background: #fffcfd !important; cursor: pointer; }
      `}</style>
    </DashboardLayout>
  );
}
