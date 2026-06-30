'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import CreateGroupForm from "@/components/features/dashboard/CreateGroupForm";
import { 
  Users, Plus, MapPin, Calendar, 
  Search, Filter, ArrowRight, ChevronDown, 
  ChevronUp, Loader, User, PlusCircle, LayoutGrid
} from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from 'framer-motion';

export default function EmployeeGroupsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  // Role Detection Rule
  const isDC = user && ['District Coordinator', 'District Project Officer'].includes(user.designation || '');

  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // District Coordinator Specific State
  const [showAllOwnGroups, setShowAllOwnGroups] = useState(false);
  const [coordinators, setCoordinators] = useState<any[]>([]);
  const [coordinatorsPage, setCoordinatorsPage] = useState(1);
  const [hasMoreCoordinators, setHasMoreCoordinators] = useState(false);
  const [coordinatorsLoading, setCoordinatorsLoading] = useState(false);
  
  // Cache dictionary mapping bcId -> { groups: Array, page: Number, hasMore: Boolean, loading: Boolean }
  const [bcCache, setBcCache] = useState<{
    [key: string]: { groups: any[]; page: number; hasMore: boolean; loading: boolean }
  }>({});
  const [expandedBcId, setExpandedBcId] = useState<string | null>(null);
  const [bcSearch, setBcSearch] = useState<{ [key: string]: string }>({});

  const fetchGroups = async () => {
    try {
      const res = await axios.get('/api/groups');
      if (res.data.success) setGroups(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoordinators = async (pageToFetch: number) => {
    setCoordinatorsLoading(true);
    try {
      const res = await axios.get(`/api/employee/my-team?page=${pageToFetch}&limit=10`);
      if (res.data.success) {
        const list = res.data.data.filter((emp: any) => emp.designation === 'Block Coordinator');
        if (pageToFetch === 1) {
          setCoordinators(list);
        } else {
          setCoordinators(prev => [...prev, ...list]);
        }
        // If the API returns fewer than 10 items or no data, there is no more pagination
        setHasMoreCoordinators(res.data.data.length === 10);
      }
    } catch (err) {
      console.error("Failed to fetch coordinators", err);
    } finally {
      setCoordinatorsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
    if (isDC) {
      fetchCoordinators(1);
    }
  }, [isDC]);

  const loadCoordinatorGroups = async (bcId: string, pageToLoad = 1) => {
    setBcCache(prev => ({
      ...prev,
      [bcId]: { ...(prev[bcId] || { groups: [], page: 1, hasMore: false }), loading: true }
    }));
    try {
      const res = await axios.get(`/api/groups?createdBy=${bcId}&page=${pageToLoad}&limit=20`);
      if (res.data.success) {
        const newGroups = res.data.data;
        setBcCache(prev => {
          const current = prev[bcId];
          const combined = pageToLoad === 1 ? newGroups : [...current.groups, ...newGroups];
          return {
            ...prev,
            [bcId]: {
              groups: combined,
              page: pageToLoad,
              hasMore: newGroups.length === 20,
              loading: false
            }
          };
        });
      }
    } catch (err) {
      console.error("Failed to load block coordinator groups", err);
      setBcCache(prev => ({
        ...prev,
        [bcId]: { ...(prev[bcId] || { groups: [], page: 1, hasMore: false }), loading: false }
      }));
    }
  };

  const handleToggleExpand = (bcId: string) => {
    if (expandedBcId === bcId) {
      setExpandedBcId(null);
    } else {
      setExpandedBcId(bcId);
      if (!bcCache[bcId]) {
        loadCoordinatorGroups(bcId, 1);
      }
    }
  };

  const handleLoadMoreBcGroups = (bcId: string) => {
    const current = bcCache[bcId];
    if (current && !current.loading) {
      loadCoordinatorGroups(bcId, current.page + 1);
    }
  };

  const handleBcSearchChange = (bcId: string, val: string) => {
    setBcSearch(prev => ({ ...prev, [bcId]: val }));
  };

  // Cache Synchronization Rule: Invalidate only the affected coordinator cache on group operations
  const handleGroupOperationSuccess = (bcId?: string) => {
    setShowCreate(false);
    fetchGroups(); // Always refresh coordinator's own groups
    if (bcId) {
      setBcCache(prev => {
        const next = { ...prev };
        delete next[bcId];
        return next;
      });
      if (expandedBcId === bcId) {
        loadCoordinatorGroups(bcId, 1);
      }
    }
  };

  // Search filtering logic
  const filteredOwnGroups = groups.filter(g => 
    g.groupName.toLowerCase().includes(search.toLowerCase()) || 
    g.village.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCoordinators = coordinators.filter(bc => 
    bc.fullName.toLowerCase().includes(search.toLowerCase()) ||
    (bc.employeeId || '').toLowerCase().includes(search.toLowerCase()) ||
    (bc.block || '').toLowerCase().includes(search.toLowerCase()) ||
    (bc.workBlock || '').toLowerCase().includes(search.toLowerCase())
  );

  // Group Card Component Helper (Reuses pre-existing UI layout style)
  const renderGroupCard = (group: any) => (
    <div key={group._id} style={{ background: 'white', borderRadius: '24px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f5f5f5' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(106, 27, 154, 0.1)', color: '#6a1b9a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Users size={24} />
        </div>
        <span style={{ padding: '5px 12px', borderRadius: '100px', background: '#f0fdf4', color: '#10b981', fontSize: '0.75rem', fontWeight: '800' }}>
          {t('employeeGroups.active', 'Active')}
        </span>
      </div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '15px' }}>{group.groupName}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666', fontSize: '0.9rem' }}>
          <MapPin size={16} /> {group.village}, {group.block}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666', fontSize: '0.9rem' }}>
          <Calendar size={16} /> {t('employeeGroups.nextMeeting', 'Next Meeting')}: {new Date(group.meetingDate).toLocaleDateString()}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666', fontSize: '0.9rem' }}>
          <Users size={16} /> {t('employeeGroups.leader', 'Leader')}: {group.leaderName}
        </div>
      </div>
      <Link href={`/employee/groups/${group._id}`} style={{ width: '100%' }}>
        <button style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--primary)', background: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          {t('employeeGroups.viewMembers', 'View Members')} <ArrowRight size={16} />
        </button>
      </Link>
    </div>
  );

  if (showCreate) {
    return (
      <DashboardLayout>
        <CreateGroupForm 
          onCancel={() => setShowCreate(false)} 
          onSuccess={() => handleGroupOperationSuccess(user?._id)} 
        />
      </DashboardLayout>
    );
  }

  // UI Backward Compatibility Rule
  if (!isDC) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--secondary)' }}>
              {t('employeeGroups.title', 'My Groups')}
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              {t('employeeGroups.subtitle', 'Manage and view all women groups created by you.')}
            </p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary" style={{ gap: '10px' }}>
            <Plus size={20} /> {t('employeeGroups.createBtn', 'Create New Group')}
          </button>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '20px', marginBottom: '30px', display: 'flex', gap: '15px' }}>
           <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
              <input 
                type="text" 
                placeholder={t('employeeGroups.searchPlaceholder', 'Search groups by name or village...')} 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #eee', outline: 'none' }} 
              />
           </div>
        </div>

        {loading ? (
          <p>{t('employeeGroups.loading', 'Loading groups...')}</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
            {filteredOwnGroups.map((group) => renderGroupCard(group))}
            {filteredOwnGroups.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 20px', background: 'white', borderRadius: '30px' }}>
                 <Users size={60} color="#eee" style={{ marginBottom: '20px' }} />
                 <h3 style={{ color: '#999' }}>
                   {t('employeeGroups.noGroups', 'No groups found. Create your first group today!')}
                 </h3>
              </div>
            )}
          </div>
        )}
      </DashboardLayout>
    );
  }

  // District Coordinator Hierarchical Layout
  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--secondary)' }}>
            My Groups
          </h2>
          <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>
            View your own groups and track child Block Coordinators' groups.
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary" style={{ gap: '10px' }}>
          <Plus size={20} /> Create New Group
        </button>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '25px', marginBottom: '30px', display: 'flex', gap: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
         <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input 
              type="text" 
              placeholder="Search own groups or reporting Block Coordinators..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '15px 15px 15px 45px', borderRadius: '16px', border: '1px solid #f0f0f0', outline: 'none', fontWeight: 'bold' }} 
            />
         </div>
      </div>

      {/* OWN GROUPS SECTION */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <LayoutGrid size={22} className="text-primary" />
          <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--secondary)' }}>My Own Groups</h3>
        </div>
        {loading ? (
          <p>Loading groups...</p>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              {(showAllOwnGroups ? filteredOwnGroups : filteredOwnGroups.slice(0, 6)).map((group) => renderGroupCard(group))}
              {filteredOwnGroups.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '24px', border: '1px dashed #e0e0e0' }}>
                   <Users size={40} color="#ccc" style={{ marginBottom: '15px' }} />
                   <h4 style={{ color: '#888', fontWeight: 'bold' }}>No personal groups created yet.</h4>
                </div>
              )}
            </div>
            {filteredOwnGroups.length > 6 && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button 
                  onClick={() => setShowAllOwnGroups(!showAllOwnGroups)} 
                  className="btn-secondary"
                  style={{ padding: '12px 30px', borderRadius: '14px', fontWeight: '700' }}
                >
                  {showAllOwnGroups ? 'View Less Groups' : `View All Groups (${filteredOwnGroups.length})`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* REPORTING COORDINATORS SECTION */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
          <User size={22} className="text-secondary" />
          <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--secondary)' }}>Reporting Block Coordinators</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {filteredCoordinators.map((bc) => {
            const cache = bcCache[bc._id] || { groups: [], page: 1, hasMore: false, loading: false };
            const isExpanded = expandedBcId === bc._id;
            const queryVal = bcSearch[bc._id] || "";

            // Group search local filter inside expanded coordinator
            const filteredBcGroups = cache.groups.filter((g: any) =>
              g.groupName.toLowerCase().includes(queryVal.toLowerCase()) ||
              g.village.toLowerCase().includes(queryVal.toLowerCase())
            );

            return (
              <div key={bc._id} style={{ background: 'white', borderRadius: '30px', border: '1px solid #f0f0f0', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.015)' }}>
                {/* Coordinator Header Card */}
                <div style={{ padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'linear-gradient(to right, var(--primary), var(--secondary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {bc.fullName.charAt(0)}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '900', margin: 0, color: 'var(--secondary)' }}>{bc.fullName}</h4>
                      <p style={{ fontSize: '0.8rem', color: '#999', margin: '4px 0 0 0', fontWeight: '700' }}>
                        ID: {bc.employeeId || 'N/A'} | Block: {bc.workBlock || bc.block || 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '900', padding: '6px 14px', borderRadius: '100px', background: '#f5f5f5', color: '#666' }}>
                      {bc.totalGroups || 0} Groups
                    </span>
                    <button 
                      onClick={() => handleToggleExpand(bc._id)}
                      style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #eee', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: 'var(--secondary)' }}
                    >
                      {isExpanded ? (
                        <>Collapse <ChevronUp size={16} /></>
                      ) : (
                        <>Expand <ChevronDown size={16} /></>
                      )}
                    </button>
                  </div>
                </div>

                {/* Lazy Loaded Groups Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ borderTop: '1px solid #f8f8f8', padding: '25px', background: '#fafafa' }}
                    >
                      {/* Search inside Coordinator groups */}
                      <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '400px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                        <input 
                          type="text" 
                          placeholder="Search groups under this coordinator..." 
                          value={queryVal}
                          onChange={(e) => handleBcSearchChange(bc._id, e.target.value)}
                          style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '10px', border: '1px solid #e5e5e5', outline: 'none', fontSize: '0.85rem', fontWeight: 'bold' }} 
                        />
                      </div>

                      {cache.loading && cache.groups.length === 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666', fontWeight: '700', padding: '20px 0' }}>
                          <Loader size={18} className="animate-spin text-primary" /> Loading groups...
                        </div>
                      ) : (
                        <div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {filteredBcGroups.map((group) => renderGroupCard(group))}
                          </div>

                          {filteredBcGroups.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '20px', border: '1px dashed #e0e0e0' }}>
                              <Users size={30} color="#ccc" style={{ marginBottom: '10px' }} />
                              <h5 style={{ color: '#888', fontWeight: 'bold', margin: 0 }}>No groups found.</h5>
                            </div>
                          )}

                          {/* Load More Button for Independent Pagination */}
                          {cache.hasMore && (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '25px' }}>
                              <button 
                                disabled={cache.loading}
                                onClick={() => handleLoadMoreBcGroups(bc._id)}
                                className="btn-primary"
                                style={{ padding: '10px 25px', fontSize: '0.85rem', borderRadius: '12px' }}
                              >
                                {cache.loading ? 'Loading...' : 'Load More Groups'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {filteredCoordinators.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '30px' }}>
               <User size={50} color="#eee" style={{ marginBottom: '15px' }} />
               <h4 style={{ color: '#999' }}>No reporting coordinators matched search filter.</h4>
            </div>
          )}

          {/* Coordinators List Pagination */}
          {hasMoreCoordinators && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <button 
                disabled={coordinatorsLoading}
                onClick={() => {
                  setCoordinatorsPage(prev => prev + 1);
                  fetchCoordinators(coordinatorsPage + 1);
                }}
                className="btn-primary"
                style={{ padding: '12px 30px' }}
              >
                {coordinatorsLoading ? 'Loading Coordinators...' : 'Load More Coordinators'}
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
