'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { Search, Save, Edit, X, Users, MapPin, Briefcase, Settings } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function HRMSEmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected employee edit state
  const [selectedEmp, setSelectedEmp] = useState<any | null>(null);
  const [isHrmsEnabled, setIsHrmsEnabled] = useState(false);
  const [department, setDepartment] = useState('');
  const [reportingManager, setReportingManager] = useState('');
  const [employeeType, setEmployeeType] = useState('Permanent');
  const [employmentStatus, setEmploymentStatus] = useState('Active');
  
  // Villages list builder
  const [assignedVillages, setAssignedVillages] = useState<string[]>([]);
  const [newVillage, setNewVillage] = useState('');

  const [saving, setSaving] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/hrms/employees?search=${search}&status=${statusFilter}`);
      if (res.data.success) {
        setEmployees(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load employees list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [statusFilter]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenEdit = (emp: any) => {
    setSelectedEmp(emp);
    setIsHrmsEnabled(emp.isHrmsEnabled || false);
    setDepartment(emp.department || '');
    setReportingManager(emp.reportingManager?._id || emp.reportingManager || '');
    setEmployeeType(emp.employeeType || 'Permanent');
    setEmploymentStatus(emp.employmentStatus || 'Active');
    setAssignedVillages(emp.assignedVillages || []);
    setNewVillage('');
  };

  const handleAddVillage = () => {
    const trimmed = newVillage.trim();
    if (!trimmed) return;
    if (assignedVillages.includes(trimmed)) {
      toast.error('Village already added.');
      return;
    }
    setAssignedVillages([...assignedVillages, trimmed]);
    setNewVillage('');
  };

  const handleRemoveVillage = (villageName: string) => {
    setAssignedVillages(assignedVillages.filter(v => v !== villageName));
  };

  const handleSave = async () => {
    if (!selectedEmp) return;

    setSaving(true);
    try {
      const res = await axios.patch(`/api/hrms/employees/${selectedEmp._id}`, {
        isHrmsEnabled,
        department,
        reportingManager: reportingManager || null,
        employeeType,
        employmentStatus,
        assignedVillages
      });

      if (res.data.success) {
        toast.success(`HRMS details updated for ${selectedEmp.fullName}`);
        setSelectedEmp(null);
        fetchEmployees();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update details.');
    } finally {
      setSaving(false);
    }
  };

  // Compile list of potential reporting managers (exclude the selected employee themselves)
  const potentialManagers = employees.filter(
    e => selectedEmp && e._id !== selectedEmp._id
  );

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Header */}
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--secondary)' }}>Employee Master Directory</h2>
          <p style={{ color: '#888' }}>View all staff profiles, toggle HRMS access, and update assigned village boundaries.</p>
        </div>

        {/* Filters Row */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }} className="max-sm:flex-col max-sm:items-stretch">
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              type="text"
              placeholder="Search by name, email, employee ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 46px', borderRadius: '16px', border: '1px solid #eee', background: 'white', fontSize: '0.9rem' }}
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '12px 20px', borderRadius: '16px', border: '1px solid #eee', background: 'white', fontSize: '0.9rem', fontWeight: '800', color: 'var(--secondary)' }}
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
              <option value="Suspended">Suspended Only</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        <div style={{ padding: '30px', background: 'white', borderRadius: '32px', border: '1px solid #f5f5f5', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
          {loading ? (
            <p>Loading directory list...</p>
          ) : employees.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
              <Users size={48} style={{ color: '#eee', marginBottom: '15px' }} />
              <p style={{ fontStyle: 'italic' }}>No employee or staff users found matching filters.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f5f5f5', textAlign: 'left' }}>
                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: '800', color: '#aaa', textTransform: 'uppercase' }}>Employee Profile</th>
                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: '800', color: '#aaa', textTransform: 'uppercase' }}>ID / Designation</th>
                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: '800', color: '#aaa', textTransform: 'uppercase' }}>Territory (Block)</th>
                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: '800', color: '#aaa', textTransform: 'uppercase' }}>HRMS Enable</th>
                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: '800', color: '#aaa', textTransform: 'uppercase' }}>Manager</th>
                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: '800', color: '#aaa', textTransform: 'uppercase' }}>Department</th>
                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: '800', color: '#aaa', textTransform: 'uppercase' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp._id} style={{ borderBottom: '1px solid #fafafa' }}>
                      <td style={{ padding: '15px 12px' }}>
                        <div>
                          <p style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--secondary)' }}>{emp.fullName}</p>
                          <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>{emp.email || emp.mobile}</p>
                        </div>
                      </td>
                      <td style={{ padding: '15px 12px' }}>
                        <div>
                          <p style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary)' }}>{emp.employeeId || 'STF-Pending'}</p>
                          <p style={{ fontSize: '0.75rem', color: '#555', marginTop: '2px' }}>{emp.designation || 'Staff Member'}</p>
                        </div>
                      </td>
                      <td style={{ padding: '15px 12px' }}>
                        <div>
                          <p style={{ fontSize: '0.85rem', color: '#555', fontWeight: '700' }}>{emp.block || '-'}</p>
                          <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>{emp.district}, {emp.state}</p>
                        </div>
                      </td>
                      <td style={{ padding: '15px 12px' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: '800',
                          padding: '5px 10px',
                          borderRadius: '8px',
                          textTransform: 'uppercase',
                          background: emp.isHrmsEnabled ? '#e8f5e9' : '#fafafa',
                          color: emp.isHrmsEnabled ? '#2e7d32' : '#888'
                        }}>
                          {emp.isHrmsEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </td>
                      <td style={{ padding: '15px 12px', fontSize: '0.85rem', color: '#666' }}>
                        {emp.reportingManager?.fullName || emp.reportingManager || <span style={{ color: '#ccc' }}>Not Assigned</span>}
                      </td>
                      <td style={{ padding: '15px 12px', fontSize: '0.85rem', color: '#666' }}>
                        {emp.department || <span style={{ color: '#ccc' }}>Not Set</span>}
                      </td>
                      <td style={{ padding: '15px 12px' }}>
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '5px' }}
                        >
                          <Edit size={12} /> Edit HRMS
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Slide Drawer */}
        <AnimatePresence>
          {selectedEmp && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedEmp(null)}
                style={{ position: 'fixed', inset: 0, background: 'black', zIndex: 40 }}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: '100%', maxWidth: '580px', background: 'white', zIndex: 50, boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}
              >
                {/* Header */}
                <div style={{ padding: '30px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--secondary)' }}>HRMS Assignment Panel</h3>
                    <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>Target: {selectedEmp.fullName} ({selectedEmp.designation})</p>
                  </div>
                  <button onClick={() => setSelectedEmp(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#999' }}>
                    <X size={20} />
                  </button>
                </div>

                {/* Form content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Enable HRMS Toggle */}
                  <div style={{ padding: '20px', background: '#fafafa', borderRadius: '20px', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--secondary)' }}>Activate HRMS Portal Access</p>
                      <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>Grants employee check-in, reports, and leave features.</p>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        checked={isHrmsEnabled}
                        onChange={(e) => setIsHrmsEnabled(e.target.checked)}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                    </div>
                  </div>

                  {/* Department */}
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--secondary)', display: 'block', marginBottom: '8px' }}>Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Field Operations, Marketing"
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '14px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                    />
                  </div>

                  {/* Reporting Manager */}
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--secondary)', display: 'block', marginBottom: '8px' }}>Reporting Manager</label>
                    <select
                      value={reportingManager}
                      onChange={(e) => setReportingManager(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '14px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                    >
                      <option value="">Select Reporting Manager</option>
                      {potentialManagers.map(m => (
                        <option key={m._id} value={m._id}>{m.fullName} ({m.designation || m.role})</option>
                      ))}
                    </select>
                  </div>

                  {/* Employee Type & Status Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--secondary)', display: 'block', marginBottom: '8px' }}>Employee Type</label>
                      <select
                        value={employeeType}
                        onChange={(e) => setEmployeeType(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '14px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                      >
                        <option value="Permanent">Permanent</option>
                        <option value="Contract">Contract</option>
                        <option value="Intern">Intern</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--secondary)', display: 'block', marginBottom: '8px' }}>Employment Status</label>
                      <select
                        value={employmentStatus}
                        onChange={(e) => setEmploymentStatus(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '14px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>
                  </div>

                  {/* Villages Coverage Area builder */}
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--secondary)', display: 'block', marginBottom: '8px' }}>Assigned Village Coverage Area</label>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <input
                        type="text"
                        value={newVillage}
                        onChange={(e) => setNewVillage(e.target.value)}
                        placeholder="Add village name..."
                        style={{ flex: 1, padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '0.85rem' }}
                      />
                      <button type="button" onClick={handleAddVillage} className="btn-secondary" style={{ padding: '10px 15px', fontSize: '0.8rem' }}>Add</button>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {assignedVillages.map(v => (
                        <div key={v} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: '#f0f0f0', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--secondary)' }}>
                          <span>{v}</span>
                          <button type="button" onClick={() => handleRemoveVillage(v)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#999', fontSize: '10px', padding: '2px' }}>×</button>
                        </div>
                      ))}
                      {assignedVillages.length === 0 && (
                        <span style={{ fontSize: '0.8rem', color: '#999', fontStyle: 'italic' }}>No villages assigned. Coverages defaults to block level.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Save */}
                <div style={{ padding: '30px', borderTop: '1px solid #f5f5f5', display: 'flex', gap: '15px', justifyContent: 'flex-end', background: '#fafafa' }}>
                  <button onClick={() => setSelectedEmp(null)} className="btn-secondary" style={{ padding: '12px 20px' }}>Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ padding: '12px 25px', gap: '6px' }}>
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
