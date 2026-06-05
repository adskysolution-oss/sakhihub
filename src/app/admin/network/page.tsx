'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import NetworkTree from '@/components/features/dashboard/NetworkTree';
import { 
  MapPin, RefreshCw, Sparkles, User, ShieldCheck, 
  Briefcase, Users, Network, LayoutDashboard, Trophy, 
  Globe, DollarSign, ShieldAlert, AlertCircle, CheckCircle, 
  ArrowRight, Calendar, Award
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import HierarchyDetailView from '@/components/features/dashboard/HierarchyDetailView';

interface Node {
  id: string;
  name: string;
  code: string;
  role: string;
  mobile?: string;
  location?: string;
  status?: string;
  profileImage?: string;
  children: Node[];
  hasChildren?: boolean;
  counts?: { subVendors: number; employees: number; members: number };
  hasRisk?: boolean;
}

export default function AdminNetworkPage() {
  const [activeTab, setActiveTab] = useState<'explorer' | 'analytics' | 'leaderboard'>('explorer');

  // Network Explorer Tree & Sidebar States
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));
  const [loadingNodes, setLoadingNodes] = useState<Set<string>>(new Set());

  // Selected Node & Localized Stats Panel States
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [statsData, setStatsData] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Modal / Verification Portal States
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [hierarchyDetail, setHierarchyDetail] = useState<any>(null);

  // Platform Analytics Tab States
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // Leaderboard Tab States
  const [leaderboardData, setLeaderboardData] = useState<any>(null);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Recursive tree updater helper
  const updateNodeInTree = (node: any, targetId: string, children: any[]): any => {
    if (node.id === targetId) {
      return { ...node, children };
    }
    if (node.children) {
      return {
        ...node,
        children: node.children.map((child: any) => updateNodeInTree(child, targetId, children))
      };
    }
    return node;
  };

  // Fetch initial tree root
  const fetchNetwork = async () => {
    setLoading(true);
    setError(null);
    setSelectedNode(null);
    setStatsData(null);
    try {
      const res = await axios.get('/api/admin/network/lazy?parentId=root');
      if (res.data.success) {
        const vendors = res.data.data;
        setData({
          id: 'root',
          name: 'SakhiHub Network',
          code: 'ROOT',
          role: 'admin',
          children: vendors,
          hasChildren: vendors.length > 0
        });
      } else {
        setError(res.data.message || 'Failed to fetch network');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while fetching network');
    } finally {
      setLoading(false);
    }
  };

  // Lazy expand node callback
  const handleExpandNode = async (nodeId: string) => {
    if (loadingNodes.has(nodeId)) return;
    setLoadingNodes(prev => new Set([...prev, nodeId]));
    try {
      const res = await axios.get(`/api/admin/network/lazy?parentId=${nodeId}`);
      if (res.data.success) {
        const children = res.data.data;
        setData((prevData: any) => {
          if (!prevData) return prevData;
          return updateNodeInTree(prevData, nodeId, children);
        });
      }
    } catch (err) {
      console.error("Failed to load children dynamically", err);
    } finally {
      setLoadingNodes(prev => {
        const copy = new Set(prev);
        copy.delete(nodeId);
        return copy;
      });
    }
  };

  // Search autocomplete select handler
  const handleSearchResultSelect = async (result: any) => {
    const path = result.path;
    if (!path || path.length === 0) return;

    let currentTree = data;
    const newExpanded = new Set(expandedNodes);

    // Iteratively fetch path nodes to make sure children are loaded
    for (let i = 0; i < path.length - 1; i++) {
      const parentId = path[i];
      const nextChildId = path[i + 1];
      newExpanded.add(parentId);

      const findNode = (node: any): any | null => {
        if (node.id === parentId) return node;
        if (node.children) {
          for (const child of node.children) {
            const found = findNode(child);
            if (found) return found;
          }
        }
        return null;
      };

      const parentNode = findNode(currentTree);
      if (parentNode) {
        const childExists = parentNode.children && parentNode.children.some((c: any) => c.id === nextChildId);
        if (!childExists) {
          setLoadingNodes(prev => new Set([...prev, parentId]));
          try {
            const res = await axios.get(`/api/admin/network/lazy?parentId=${parentId}`);
            if (res.data.success) {
              const fetchedChildren = res.data.data;
              currentTree = updateNodeInTree(currentTree, parentId, fetchedChildren);
              setData(currentTree);
            }
          } catch (err) {
            console.error("Failed to load path segment node", parentId, err);
          } finally {
            setLoadingNodes(prev => {
              const copy = new Set(prev);
              copy.delete(parentId);
              return copy;
            });
          }
        }
      }
    }

    setExpandedNodes(newExpanded);

    // Highlight and select the leaf node
    const findLeafNode = (node: any): any | null => {
      if (node.id === result.id) return node;
      if (node.children) {
        for (const child of node.children) {
          const found = findLeafNode(child);
          if (found) return found;
        }
      }
      return null;
    };

    const leafNode = findLeafNode(currentTree);
    if (leafNode) {
      setSelectedNode(leafNode);
    } else {
      setSelectedNode(result);
    }
  };

  // Fetch dashboard overview stats
  const fetchDashboardData = async () => {
    setLoadingDashboard(true);
    try {
      const res = await axios.get('/api/admin/network/dashboard');
      if (res.data.success) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard statistics", err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  // Fetch performance leaderboards
  const fetchLeaderboardData = async () => {
    setLoadingLeaderboard(true);
    try {
      let url = '/api/admin/network/leaderboard';
      const params: string[] = [];
      if (startDate) params.push(`startDate=${startDate}`);
      if (endDate) params.push(`endDate=${endDate}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await axios.get(url);
      if (res.data.success) {
        setLeaderboardData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load leaderboard data", err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  // Switch tabs
  const handleTabChange = (tab: 'explorer' | 'analytics' | 'leaderboard') => {
    setActiveTab(tab);
    if (tab === 'analytics') {
      fetchDashboardData();
    } else if (tab === 'leaderboard') {
      fetchLeaderboardData();
    }
  };

  // Initial load
  useEffect(() => {
    fetchNetwork();
  }, []);

  // Fetch localized statistics for the selected node
  useEffect(() => {
    if (!selectedNode || selectedNode.id === 'root') {
      setStatsData(null);
      return;
    }
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const res = await axios.get(`/api/admin/network/stats?nodeId=${selectedNode.id}`);
        if (res.data.success) {
          setStatsData(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch node stats", err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [selectedNode]);

  // Open detailed management portal modal
  const handleOpenDetailedPortal = async () => {
    if (!selectedNode || selectedNode.role === 'member') return;
    setLoadingDetail(true);
    setShowDetailModal(true);
    try {
      const res = await axios.get(`/api/admin/users/${selectedNode.id}/hierarchy`);
      if (res.data.success) {
        setHierarchyDetail(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch hierarchy detail", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Action status update callback inside detailed workspace
  const handleStatusUpdate = async (id: string, newStatus: string, remarks?: string) => {
     try {
       const res = await axios.patch(`/api/admin/employees/${id}/status`, { 
         status: newStatus,
         remarks 
       });
       if (res.data.success) {
         // Refresh modal details
         if (selectedNode?.id === id) {
           const freshRes = await axios.get(`/api/admin/users/${id}/hierarchy`);
           if (freshRes.data.success) {
             setHierarchyDetail(freshRes.data.data);
           }
         }
         // Sync explorer tree node and reload stats
         const resStats = await axios.get(`/api/admin/network/stats?nodeId=${id}`);
         if (resStats.data.success) {
           setStatsData(resStats.data.data);
         }
         // Soft refresh top tree
         fetchNetwork();
       }
     } catch (err) {
       console.error("Failed to update status", err);
     }
  };

  const handleSyncClick = () => {
    if (activeTab === 'explorer') {
      fetchNetwork();
    } else if (activeTab === 'analytics') {
      fetchDashboardData();
    } else {
      fetchLeaderboardData();
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-gray-100 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                <Network size={24} />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-secondary">Network Intelligence Center</h1>
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] ml-13">
              Platform-wide hierarchy, real-time analytics & performance insights
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            {/* Tab Selection */}
            <div className="flex bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200/50">
              <button
                onClick={() => handleTabChange('explorer')}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === 'explorer' 
                    ? 'bg-white text-secondary shadow-sm' 
                    : 'text-gray-500 hover:text-secondary'
                }`}
              >
                <Network size={14} /> Explorer
              </button>
              <button
                onClick={() => handleTabChange('analytics')}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === 'analytics' 
                    ? 'bg-white text-secondary shadow-sm' 
                    : 'text-gray-500 hover:text-secondary'
                }`}
              >
                <LayoutDashboard size={14} /> Platform Analytics
              </button>
              <button
                onClick={() => handleTabChange('leaderboard')}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === 'leaderboard' 
                    ? 'bg-white text-secondary shadow-sm' 
                    : 'text-gray-500 hover:text-secondary'
                }`}
              >
                <Trophy size={14} /> Leaderboard
              </button>
            </div>

            <button 
              onClick={handleSyncClick}
              disabled={loading || loadingDashboard || loadingLeaderboard}
              className="flex items-center gap-2 px-6 py-3.5 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-soft hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading || loadingDashboard || loadingLeaderboard ? 'animate-spin' : ''} /> Sync
            </button>
          </div>
        </header>

        {error ? (
          <div className="bg-red-50 p-8 rounded-[32px] border border-red-100 text-center">
            <h3 className="text-red-500 font-black text-lg">Unable to compile Network Data</h3>
            <p className="text-red-400 font-bold mt-2">{error}</p>
            <button onClick={fetchNetwork} className="btn-primary px-8 py-3 mt-6 text-[10px]">Retry Compilation</button>
          </div>
        ) : (
          <div>
            {/* Tab 1: Network Explorer */}
            {activeTab === 'explorer' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side: Network Tree */}
                <div className="lg:col-span-2">
                  <NetworkTree 
                    data={data} 
                    loading={loading} 
                    viewerRole="super_admin" 
                    onNodeClick={setSelectedNode}
                    onExpand={handleExpandNode}
                    expandedNodes={expandedNodes}
                    setExpandedNodes={setExpandedNodes}
                    loadingNodes={loadingNodes}
                    selectedNodeId={selectedNode?.id}
                    onSearchResultSelect={handleSearchResultSelect}
                  />
                </div>

                {/* Right side: Sidebar analytics panel */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft p-6 min-h-[500px] flex flex-col sticky top-8">
                    {!selectedNode || selectedNode.id === 'root' ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4">
                          <Network size={28} />
                        </div>
                        <h4 className="text-base font-black text-secondary">Hierarchy Analytics Panel</h4>
                        <p className="text-xs text-gray-400 font-bold mt-2 max-w-[240px] leading-relaxed">
                          Select any Vendor, Sub-Vendor, or Employee from the explorer tree to load real-time branch statistics and compliance flags.
                        </p>
                      </div>
                    ) : loadingStats ? (
                      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
                        <div className="w-10 h-10 border-4 border-gray-100 border-t-primary rounded-full animate-spin"></div>
                        <p className="text-xs text-gray-400 font-bold animate-pulse uppercase tracking-widest text-center">Compiling Downstream Stats...</p>
                      </div>
                    ) : statsData ? (
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="space-y-6">
                          {/* Header block */}
                          <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg uppercase shadow-sm shrink-0 ${
                              statsData.role === 'vendor' ? 'bg-secondary text-white' :
                              statsData.role === 'sub_vendor' ? 'bg-primary text-white' :
                              statsData.role === 'employee' ? 'bg-blue-50 text-blue-500' :
                              'bg-amber-50 text-amber-500'
                            }`}>
                              {statsData.role[0]}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-base font-black text-secondary truncate">{statsData.name}</h4>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className="text-[9px] font-black uppercase bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">
                                  {statsData.role.replace('_', ' ')}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400">
                                  {selectedNode.code}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Sizes grid */}
                          <div>
                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Branch Size Summary</h5>
                            <div className="grid grid-cols-3 gap-3">
                              {statsData.role === 'vendor' && (
                                <div className="bg-gray-50 p-3 rounded-2xl text-center">
                                  <p className="text-lg font-black text-secondary">{statsData.counts.subVendors}</p>
                                  <p className="text-[8px] font-bold text-gray-400 uppercase">Sub-Vendors</p>
                                </div>
                              )}
                              <div className="bg-gray-50 p-3 rounded-2xl text-center flex-1">
                                <p className="text-lg font-black text-secondary">{statsData.counts.employees}</p>
                                <p className="text-[8px] font-bold text-gray-400 uppercase">Employees</p>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-2xl text-center flex-1">
                                <p className="text-lg font-black text-secondary">{statsData.counts.members}</p>
                                <p className="text-[8px] font-bold text-gray-400 uppercase">Members</p>
                              </div>
                            </div>
                          </div>

                          {/* Geo stats */}
                          <div>
                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                              <Globe size={10} className="text-gray-400" /> Geography Coverage
                            </h5>
                            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-50 text-xs space-y-2">
                              <div className="flex justify-between font-bold text-gray-500">
                                <span>States</span>
                                <span className="text-secondary">{statsData.geography.states}</span>
                              </div>
                              <div className="flex justify-between font-bold text-gray-500">
                                <span>Districts</span>
                                <span className="text-secondary">{statsData.geography.districts}</span>
                              </div>
                              <div className="flex justify-between font-bold text-gray-500">
                                <span>Blocks</span>
                                <span className="text-secondary">{statsData.geography.blocks}</span>
                              </div>
                              <div className="flex justify-between font-bold text-gray-500">
                                <span>Villages/Areas</span>
                                <span className="text-secondary">{statsData.geography.areas}</span>
                              </div>
                            </div>
                          </div>

                          {/* Collections Summary */}
                          <div>
                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                              <DollarSign size={10} className="text-gray-400" /> Financial Intelligence
                            </h5>
                            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-50 space-y-3">
                              <div className="flex justify-between items-end">
                                <div>
                                  <p className="text-[9px] font-bold text-gray-400 uppercase">Total Paid Collections</p>
                                  <p className="text-xl font-black text-green-600">₹{statsData.collections.paid.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[9px] font-bold text-gray-400 uppercase">Pending/In-flight</p>
                                  <p className="text-xs font-bold text-amber-500">₹{statsData.collections.pending.toLocaleString()}</p>
                                </div>
                              </div>
                              <div className="border-t border-gray-100 pt-2 grid grid-cols-3 gap-2 text-[9px] text-gray-400 font-bold uppercase">
                                <div>
                                  <span>Memberships</span>
                                  <p className="text-[10px] font-black text-secondary">₹{statsData.collections.split.membership.toLocaleString()}</p>
                                </div>
                                <div>
                                  <span>Deposits</span>
                                  <p className="text-[10px] font-black text-secondary">₹{statsData.collections.split.deposit.toLocaleString()}</p>
                                </div>
                                <div>
                                  <span>Subs</span>
                                  <p className="text-[10px] font-black text-secondary">₹{statsData.collections.split.subscription.toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Operational Risk flags */}
                          <div>
                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                              <ShieldAlert size={10} className="text-red-500 animate-pulse" /> Downstream Risk Flags
                            </h5>
                            {statsData.riskFlags.length > 0 ? (
                              <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                                {statsData.riskFlags.map((risk: string, i: number) => (
                                  <div key={i} className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-100 rounded-xl">
                                    <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                                    <span className="text-[10px] text-red-600 font-bold leading-normal">{risk}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-2xl">
                                <CheckCircle size={16} className="text-green-600 shrink-0" />
                                <span className="text-[10px] text-green-700 font-bold">No risk flags detected.</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {selectedNode.role !== 'member' && (
                          <button
                            onClick={handleOpenDetailedPortal}
                            className="w-full mt-6 py-4 bg-secondary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-secondary-dark hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg"
                          >
                            Open Agreements & Docs <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Platform Analytics Dashboard */}
            {activeTab === 'analytics' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {loadingDashboard ? (
                  <div className="p-20 flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-gray-100 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-xs text-gray-400 font-bold animate-pulse uppercase tracking-widest">Compiling Platform Stats...</p>
                  </div>
                ) : (
                  <>
                    {/* Global Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-soft">
                        <div className="w-10 h-10 rounded-xl bg-secondary/5 text-secondary flex items-center justify-center mb-4">
                          <ShieldCheck size={20} />
                        </div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Vendors</p>
                        <h3 className="text-2xl font-black text-secondary mt-1">{dashboardData?.counts.vendors || 0}</h3>
                        <p className="text-[9px] text-green-500 font-bold mt-2">+{dashboardData?.growth.vendors || 0} Last 30 days</p>
                      </div>

                      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-soft">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center mb-4">
                          <Sparkles size={20} />
                        </div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sub-Vendors</p>
                        <h3 className="text-2xl font-black text-secondary mt-1">{dashboardData?.counts.subVendors || 0}</h3>
                        <p className="text-[9px] text-green-500 font-bold mt-2">+{dashboardData?.growth.subVendors || 0} Last 30 days</p>
                      </div>

                      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-soft">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
                          <Briefcase size={20} />
                        </div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Employees</p>
                        <h3 className="text-2xl font-black text-secondary mt-1">{dashboardData?.counts.employees || 0}</h3>
                        <p className="text-[9px] text-green-500 font-bold mt-2">+{dashboardData?.growth.employees || 0} Last 30 days</p>
                      </div>

                      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-soft">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
                          <Users size={20} />
                        </div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Members</p>
                        <h3 className="text-2xl font-black text-secondary mt-1">{dashboardData?.counts.members || 0}</h3>
                        <p className="text-[9px] text-green-500 font-bold mt-2">+{dashboardData?.growth.members || 0} Last 30 days</p>
                      </div>
                    </div>

                    {/* Financial and Activity layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Financial Collection Summary */}
                      <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft lg:col-span-2 space-y-6">
                        <div>
                          <h4 className="text-lg font-black text-secondary">Financial Overview</h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Platform collection distributions</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50/20 p-6 rounded-[32px] border border-green-100/50">
                            <p className="text-xs font-bold text-gray-400 uppercase">Total Paid Revenue</p>
                            <h3 className="text-3xl font-black text-green-600 mt-2">₹{dashboardData?.collections.total.toLocaleString() || 0}</h3>
                            <p className="text-[9px] text-gray-400 font-bold mt-3">Excludes pending manual verification requests.</p>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5">
                                <span>Membership Fees</span>
                                <span>₹{dashboardData?.collections.membership.toLocaleString() || 0}</span>
                              </div>
                              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-green-500 h-full rounded-full" 
                                  style={{ width: `${dashboardData?.collections.total ? (dashboardData.collections.membership / dashboardData.collections.total) * 100 : 0}%` }}
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5">
                                <span>Security Deposits</span>
                                <span>₹{dashboardData?.collections.deposit.toLocaleString() || 0}</span>
                              </div>
                              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-primary h-full rounded-full" 
                                  style={{ width: `${dashboardData?.collections.total ? (dashboardData.collections.deposit / dashboardData.collections.total) * 100 : 0}%` }}
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5">
                                <span>Manual Subscriptions</span>
                                <span>₹{dashboardData?.collections.subscription.toLocaleString() || 0}</span>
                              </div>
                              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-blue-500 h-full rounded-full" 
                                  style={{ width: `${dashboardData?.collections.total ? (dashboardData.collections.subscription / dashboardData.collections.total) * 100 : 0}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* platform health / recent activity */}
                      <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft lg:col-span-1 space-y-6">
                        <div>
                          <h4 className="text-lg font-black text-secondary">Verification Activity</h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Platform Verification State</p>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-4 bg-green-50/50 border border-green-100 rounded-2xl">
                            <span className="text-xs font-bold text-green-700">Active/Approved Records</span>
                            <span className="text-base font-black text-green-600">{dashboardData?.status.active || 0}</span>
                          </div>

                          <div className="flex justify-between items-center p-4 bg-amber-50/50 border border-amber-100 rounded-2xl">
                            <span className="text-xs font-bold text-amber-700">Pending Approvals</span>
                            <span className="text-base font-black text-amber-600">{dashboardData?.status.pending || 0}</span>
                          </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                          <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Recent Registrations</h5>
                          <div className="space-y-3">
                            {dashboardData?.recentActivity.map((act: any, i: number) => (
                              <div key={i} className="flex justify-between items-start text-xs border-b border-gray-50 pb-2.5 last:border-b-0 last:pb-0">
                                <div>
                                  <p className="font-bold text-secondary">{act.name}</p>
                                  <p className="text-[9px] text-gray-400 font-black uppercase mt-0.5">{act.role.replace('_', ' ')}</p>
                                </div>
                                <span className="text-[9px] font-bold text-gray-400">{new Date(act.time).toLocaleDateString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Tab 3: Performance Leaderboard */}
            {activeTab === 'leaderboard' && (
              <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex flex-wrap items-center justify-between gap-6 border-b border-gray-50 pb-6">
                  <div>
                    <h4 className="text-lg font-black text-secondary">Top Performers Leaderboard</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Rankings based on Member Growth & Collections</p>
                  </div>

                  {/* Date Filter Bar */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-2 rounded-2xl">
                      <Calendar size={14} className="text-gray-400" />
                      <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                        className="bg-transparent text-xs font-bold text-secondary focus:outline-none cursor-pointer"
                      />
                      <span className="text-gray-400 text-xs px-1">to</span>
                      <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                        className="bg-transparent text-xs font-bold text-secondary focus:outline-none cursor-pointer"
                      />
                    </div>
                    <button
                      onClick={fetchLeaderboardData}
                      className="px-6 py-3 bg-secondary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-secondary-dark transition-all"
                    >
                      Apply Filter
                    </button>
                  </div>
                </div>

                {loadingLeaderboard ? (
                  <div className="p-20 flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-4 border-gray-100 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-xs text-gray-400 font-bold animate-pulse uppercase tracking-widest">Compiling rankings...</p>
                  </div>
                ) : leaderboardData ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Column 1: Top Vendors */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                        <Award size={18} className="text-secondary" />
                        <h5 className="text-sm font-black text-secondary uppercase tracking-wider">Top Vendors</h5>
                      </div>
                      <div className="space-y-3">
                        {leaderboardData.vendors.length > 0 ? leaderboardData.vendors.map((item: any, idx: number) => (
                          <div key={item.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between hover:border-secondary transition-all">
                            <div className="flex items-center gap-3">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                                idx === 0 ? 'bg-amber-400 text-white shadow-sm' :
                                idx === 1 ? 'bg-gray-300 text-white shadow-sm' :
                                idx === 2 ? 'bg-amber-600 text-white shadow-sm' :
                                'bg-gray-200 text-gray-500'
                              }`}>
                                {idx + 1}
                              </span>
                              <div>
                                <p className="font-bold text-secondary text-sm">{item.name}</p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase">{item.code}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-black text-green-600">+{item.memberGrowth} members</p>
                              <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">₹{item.collections.toLocaleString()} • {item.activationRate}% Act</p>
                            </div>
                          </div>
                        )) : (
                          <p className="text-xs text-gray-400 italic">No registrations within this range.</p>
                        )}
                      </div>
                    </div>

                    {/* Column 2: Top Sub-Vendors */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                        <Award size={18} className="text-primary" />
                        <h5 className="text-sm font-black text-secondary uppercase tracking-wider">Top Sub-Vendors</h5>
                      </div>
                      <div className="space-y-3">
                        {leaderboardData.subVendors.length > 0 ? leaderboardData.subVendors.map((item: any, idx: number) => (
                          <div key={item.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between hover:border-primary transition-all">
                            <div className="flex items-center gap-3">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                                idx === 0 ? 'bg-amber-400 text-white shadow-sm' :
                                idx === 1 ? 'bg-gray-300 text-white shadow-sm' :
                                idx === 2 ? 'bg-amber-600 text-white shadow-sm' :
                                'bg-gray-200 text-gray-500'
                              }`}>
                                {idx + 1}
                              </span>
                              <div>
                                <p className="font-bold text-secondary text-sm">{item.name}</p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase">{item.code}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-black text-green-600">+{item.memberGrowth} members</p>
                              <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">₹{item.collections.toLocaleString()} • {item.activationRate}% Act</p>
                            </div>
                          </div>
                        )) : (
                          <p className="text-xs text-gray-400 italic">No registrations within this range.</p>
                        )}
                      </div>
                    </div>

                    {/* Column 3: Top Employees */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                        <Award size={18} className="text-blue-500" />
                        <h5 className="text-sm font-black text-secondary uppercase tracking-wider">Top Field Staff</h5>
                      </div>
                      <div className="space-y-3">
                        {leaderboardData.employees.length > 0 ? leaderboardData.employees.map((item: any, idx: number) => (
                          <div key={item.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between hover:border-blue-400 transition-all">
                            <div className="flex items-center gap-3">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                                idx === 0 ? 'bg-amber-400 text-white shadow-sm' :
                                idx === 1 ? 'bg-gray-300 text-white shadow-sm' :
                                idx === 2 ? 'bg-amber-600 text-white shadow-sm' :
                                'bg-gray-200 text-gray-500'
                              }`}>
                                {idx + 1}
                              </span>
                              <div>
                                <p className="font-bold text-secondary text-sm">{item.name}</p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase">{item.code}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-black text-green-600">+{item.memberGrowth} members</p>
                              <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">₹{item.collections.toLocaleString()} • {item.activationRate}% Act</p>
                            </div>
                          </div>
                        )) : (
                          <p className="text-xs text-gray-400 italic">No registrations within this range.</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}

        {/* Node Detail Modal */}
        <AnimatePresence>
          {showDetailModal && selectedNode && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 overflow-hidden">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => {
                  setShowDetailModal(false);
                  setHierarchyDetail(null);
                }}
                className="absolute inset-0 bg-secondary/60 backdrop-blur-md" 
              />
              <motion.div 
                initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
                className="relative bg-white w-full max-w-6xl md:max-h-[90vh] rounded-t-[40px] md:rounded-[40px] overflow-y-auto custom-scrollbar shadow-2xl z-10"
              >
                {loadingDetail ? (
                  <div className="h-[600px] flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-gray-100 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-gray-400 font-bold animate-pulse">Fetching Hierarchy Intelligence...</p>
                  </div>
                ) : hierarchyDetail ? (
                  <HierarchyDetailView 
                    data={hierarchyDetail} 
                    onClose={() => {
                      setShowDetailModal(false);
                      setHierarchyDetail(null);
                    }}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ) : (
                  <div className="p-20 text-center">
                    <p className="text-red-500 font-bold">Failed to load node details.</p>
                    <button onClick={() => { setShowDetailModal(false); setHierarchyDetail(null); }} className="btn-primary px-8 py-3 mt-4">Close</button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
