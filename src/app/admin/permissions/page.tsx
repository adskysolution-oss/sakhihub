'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { Shield, Check, Save, User, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function PermissionsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<any | null>(null);
  const [selectedPermKeys, setSelectedPermKeys] = useState<string[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [loadingPerms, setLoadingPerms] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoadingAdmins(true);
    setLoadingPerms(true);
    try {
      const adminsRes = await axios.get('/api/admin/operations-admins');
      if (adminsRes.data.success) {
        const adminData = adminsRes.data.data || [];
        setAdmins(adminData);
        if (adminData.length > 0) {
          setSelectedAdmin(adminData[0]);
          setSelectedPermKeys(adminData[0].permissions || []);
        }
      }

      const permsRes = await axios.get('/api/admin/permissions');
      if (permsRes.data.success) {
        setPermissions(permsRes.data.data || []);
      }
    } catch (err: any) {
      toast.error('Failed to load permission systems');
    } finally {
      setLoadingAdmins(false);
      setLoadingPerms(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectAdmin = (admin: any) => {
    setSelectedAdmin(admin);
    setSelectedPermKeys(admin.permissions || []);
  };

  const handleTogglePermission = (key: string) => {
    if (selectedPermKeys.includes(key)) {
      setSelectedPermKeys(selectedPermKeys.filter(k => k !== key));
    } else {
      setSelectedPermKeys([...selectedPermKeys, key]);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedAdmin) return;
    setSaving(true);
    try {
      const res = await axios.post('/api/admin/permissions', {
        userId: selectedAdmin._id,
        permissions: selectedPermKeys
      });
      if (res.data.success) {
        toast.success(`Permissions for ${selectedAdmin.fullName} saved successfully`);
        // Update local admin state
        setAdmins(admins.map(a => a._id === selectedAdmin._id ? { ...a, permissions: selectedPermKeys } : a));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc: any, val: any) => {
    acc[val.module] = acc[val.module] || [];
    acc[val.module].push(val);
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-black text-secondary">Operational Permissions</h2>
          <p className="text-gray-400 font-bold mt-1">Configure individual permission rules for operations administrators.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Admin List Column */}
          <div className="lg:col-span-4 bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-[#fafafa]">
              <h3 className="text-xs font-black text-secondary uppercase tracking-widest">Select Administrator</h3>
            </div>
            <div className="flex flex-col max-h-[500px] overflow-y-auto">
              {loadingAdmins ? (
                <p className="p-6 text-center text-gray-400 italic text-sm">Loading...</p>
              ) : admins.length > 0 ? (
                admins.map(admin => {
                  const isSelected = selectedAdmin?._id === admin._id;
                  return (
                    <button
                      key={admin._id}
                      onClick={() => handleSelectAdmin(admin)}
                      className={`p-5 text-left border-b border-gray-50 flex items-center justify-between transition-colors ${
                        isSelected ? 'bg-primary/5 text-primary' : 'bg-transparent text-secondary hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                          isSelected ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {admin.fullName[0].toUpperCase()}
                        </div>
                        <div>
                          <p className={`text-xs font-black ${isSelected ? 'text-primary' : 'text-secondary'}`}>
                            {admin.fullName}
                          </p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5 tracking-wider">
                            {admin.designation || 'Operations Admin'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={14} className={isSelected ? 'text-primary' : 'text-gray-300'} />
                    </button>
                  );
                })
              ) : (
                <p className="p-6 text-center text-gray-400 italic text-sm">No operations admins found.</p>
              )}
            </div>
          </div>

          {/* Permissions Matrix Column */}
          <div className="lg:col-span-8 bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-50 bg-[#fafafa] flex justify-between items-center">
              <div>
                <h3 className="text-xs font-black text-secondary uppercase tracking-widest">
                  Permission Mapping
                </h3>
                {selectedAdmin && (
                  <p className="text-[10px] text-primary font-black uppercase mt-1 tracking-wider">
                    Target: {selectedAdmin.fullName}
                  </p>
                )}
              </div>
              <button
                disabled={!selectedAdmin || saving}
                onClick={handleSavePermissions}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                <Save size={14} /> {saving ? 'Saving...' : 'Save Permissions'}
              </button>
            </div>

            <div className="p-8 grid gap-8 max-h-[600px] overflow-y-auto">
              {loadingPerms ? (
                <p className="text-center text-gray-400 italic text-sm py-10">Loading permissions...</p>
              ) : selectedAdmin ? (
                Object.keys(groupedPermissions).map(moduleName => (
                  <div key={moduleName} className="flex flex-col gap-3">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-l-4 border-primary pl-3">
                      {moduleName}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                      {groupedPermissions[moduleName].map((perm: any) => {
                        const isChecked = selectedPermKeys.includes(perm.key);
                        return (
                          <div
                            key={perm.key}
                            onClick={() => handleTogglePermission(perm.key)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                              isChecked
                                ? 'border-primary/20 bg-primary/5 text-primary'
                                : 'border-gray-100 bg-white text-secondary hover:border-gray-200'
                            }`}
                          >
                            <div>
                              <p className="text-xs font-black">{perm.name}</p>
                              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{perm.key}</p>
                            </div>
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                              isChecked ? 'bg-primary border-primary text-white' : 'border-gray-200 bg-white'
                            }`}>
                              {isChecked && <Check size={12} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-gray-400 font-semibold italic">
                  Select an administrator to configure their system permission rules.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
