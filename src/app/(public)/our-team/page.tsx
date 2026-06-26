'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, MapPin, Search, SlidersHorizontal, LayoutGrid, 
  Network, HelpCircle, ChevronRight, X, Loader2, ArrowRight, 
  Calendar, Award, Maximize2, Minimize2, ZoomIn, ZoomOut, 
  RefreshCw, Briefcase, ChevronDown, CheckCircle
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { ORGANIZATION_PROFILE } from '@/constants/organization';

interface TeamMember {
  userId: string;
  name: string;
  photo: string;
  role: string;
  designation?: string;
  employeeId: string;
  parent: {
    id: string;
    name: string;
    role: string;
  } | null;
  district: string;
  state: string;
  joiningDate: string;
  level: number;
  bio?: string;
  message?: string;
  priority?: number;
}

interface Stats {
  totalTeamMembers: number;
  activeDistricts: number;
  activeStates: number;
  totalGroups: number;
  totalMembers: number;
  vendors: number;
  subVendors: number;
  staff: number;
  employees: number;
  founders: number;
}

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 1.5 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }

    const totalMiliseconds = duration * 1000;
    const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 15);
    
    const timer = setInterval(() => {
      start += Math.ceil(end / (totalMiliseconds / incrementTime));
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count.toLocaleString()}+</span>;
};

export default function OurTeamPage() {
  const { t, language } = useLanguage();

  // View States
  const [viewMode, setViewMode] = useState<'grid' | 'hierarchy' | 'chain'>('grid');
  
  // API Data States
  const [stats, setStats] = useState<Stats>({
    totalTeamMembers: 0,
    activeDistricts: 0,
    activeStates: 0,
    totalGroups: 0,
    totalMembers: 0,
    vendors: 0,
    subVendors: 0,
    staff: 0,
    employees: 0,
    founders: 0
  });
  
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  
  // Grid Members State
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [coreMembers, setCoreMembers] = useState<TeamMember[]>([]);
  const [founderProfile, setFounderProfile] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Hierarchy Tree State
  const [treeData, setTreeData] = useState<any>(null);
  const [loadingTree, setLoadingTree] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['founder_root']));

  // Reporting Chain State
  const [selectedChainNode, setSelectedChainNode] = useState<TeamMember | null>(null);
  const [reportingChain, setReportingChain] = useState<any[]>([]);

  // Filter States
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // UI Detail Drawer State
  const [activeDrawerUser, setActiveDrawerUser] = useState<TeamMember | null>(null);

  // Tree Viewport Zoom / Drag States
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const treeContainerRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Load Global Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/public/team/stats');
        if (res.data.success) {
          setStats(res.data.data.stats);
          setStates(res.data.data.activeStates);
          setDistricts(res.data.data.activeDistricts);
        }
      } catch (err) {
        console.error('Failed to load team stats', err);
      }
    };
    fetchStats();
  }, []);

  // Fetch Members List (for Grid View)
  const fetchMembers = async (pageNumber: number, append: boolean = false) => {
    if (pageNumber === 1) setLoadingMembers(true);
    else setLoadingMore(true);

    try {
      const params = new URLSearchParams({
        page: pageNumber.toString(),
        limit: '12',
        search: debouncedSearch,
        role,
        state: selectedState,
        district: selectedDistrict,
        level: selectedLevel
      });

      const res = await axios.get(`/api/public/team/members?${params.toString()}`);
      if (res.data.success) {
        if (append) {
          setMembers(prev => [...prev, ...res.data.data.users]);
        } else {
          setMembers(res.data.data.users);
          if (res.data.data.coreMembers) {
            setCoreMembers(res.data.data.coreMembers);
            const foundFounder = res.data.data.coreMembers.find((u: any) => u.priority === 1) || 
                                 res.data.data.coreMembers.find((u: any) => u.role === 'founder');
            setFounderProfile(foundFounder || null);
          }
        }
        setTotalPages(res.data.data.pagination.totalPages);
        setPage(pageNumber);
      }
    } catch (err) {
      console.error('Failed to fetch team members', err);
    } finally {
      setLoadingMembers(false);
      setLoadingMore(false);
    }
  };

  // Re-fetch members when filter conditions change
  useEffect(() => {
    fetchMembers(1, false);
  }, [debouncedSearch, role, selectedState, selectedDistrict, selectedLevel]);

  // Fetch complete tree hierarchy when switching to hierarchy / reporting views
  const fetchHierarchyTree = async () => {
    if (treeData) return; // Already loaded
    setLoadingTree(true);
    try {
      const res = await axios.get('/api/public/team/hierarchy');
      if (res.data.success) {
        setTreeData(res.data.data);
        
        // Auto expand top 2 levels
        const roots = new Set<string>(['founder_root']);
        if (res.data.data.children) {
          res.data.data.children.forEach((c: any) => {
            roots.add(c.userId);
          });
        }
        setExpandedNodes(roots);
      }
    } catch (err) {
      console.error('Failed to load team hierarchy', err);
    } finally {
      setLoadingTree(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'hierarchy' || viewMode === 'chain') {
      fetchHierarchyTree();
    }
  }, [viewMode]);

  // Handle building Reporting Chain
  const selectChainMember = (member: TeamMember) => {
    setSelectedChainNode(member);
    
    // Construct chain path recursively from list
    const chain = [];
    let current: any = member;
    
    while (current) {
      chain.unshift(current);
      if (current.parent) {
        // Find parent object in members list or tree data to continue mapping
        const parentId = current.parent.id;
        const parentNode = members.find(m => m.employeeId === parentId);
        if (parentNode) {
          current = parentNode;
        } else if (parentId === 'FDR000001****') {
          // Point to Founder
          current = {
            userId: 'founder_root',
            name: ORGANIZATION_PROFILE.founderName,
            photo: ORGANIZATION_PROFILE.founderPhoto,
            role: 'founder',
            designation: ORGANIZATION_PROFILE.founderDesignation,
            employeeId: 'FDR000001****',
            district: ORGANIZATION_PROFILE.founderDistrict,
            state: ORGANIZATION_PROFILE.founderState,
            joiningDate: `${ORGANIZATION_PROFILE.founderSince}-01-01`,
            level: 1,
            bio: ORGANIZATION_PROFILE.founderBio
          };
        } else {
          // If parent is not loaded in current slice, construct minimal parent node
          current = {
            userId: 'unknown',
            name: current.parent.name,
            role: current.parent.role,
            employeeId: current.parent.id,
            level: current.level - 1,
            parent: null
          };
        }
      } else {
        // Parent is null, stop traversal (node reports to none)
        current = null;
      }
    }
    
    // Ensure Founder is ALWAYS at the root if we got a vendor or staff reporting to none
    if (chain.length > 0 && chain[0].role !== 'founder') {
      chain.unshift({
        userId: 'founder_root',
        name: ORGANIZATION_PROFILE.founderName,
        photo: ORGANIZATION_PROFILE.founderPhoto,
        role: 'founder',
        designation: ORGANIZATION_PROFILE.founderDesignation,
        employeeId: 'FDR000001****',
        district: ORGANIZATION_PROFILE.founderDistrict,
        state: ORGANIZATION_PROFILE.founderState,
        joiningDate: `${ORGANIZATION_PROFILE.founderSince}-01-01`,
        level: 1,
        bio: ORGANIZATION_PROFILE.founderBio
      });
    }

    setReportingChain(chain);
  };

  // Toggle Node expansion in hierarchy tree
  const toggleExpand = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Expand all tree nodes recursively
  const expandAll = () => {
    if (!treeData) return;
    const ids = new Set<string>();
    const recurse = (node: any) => {
      ids.add(node.userId);
      if (node.children) node.children.forEach(recurse);
    };
    recurse(treeData);
    setExpandedNodes(ids);
  };

  // Collapse all tree nodes except founder
  const collapseAll = () => {
    setExpandedNodes(new Set(['founder_root']));
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.15, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.15, 0.4));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Drag Panning Event Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!treeContainerRef.current) return;
    if (!isFullscreen) {
      if (treeContainerRef.current.requestFullscreen) {
        treeContainerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Role Styling Mapping
  const roleConfig: Record<string, { label: string; bg: string; text: string; border: string; accentBg: string }> = {
    founder: { label: 'Founder & Chair', bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-400', accentBg: 'bg-amber-50' },
    vendor: { label: 'Vendor Partner', bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-400', accentBg: 'bg-blue-50' },
    sub_vendor: { label: 'Sub-Vendor Partner', bg: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-400', accentBg: 'bg-purple-50' },
    staff: { label: 'Office Staff', bg: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-400', accentBg: 'bg-orange-50' },
    employee: { label: 'Field Associate', bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-400', accentBg: 'bg-emerald-50' }
  };

  // Helper component to render a tree branch recursively
  const renderTreeBranch = (node: any) => {
    const isExpanded = expandedNodes.has(node.userId);
    const hasChildren = node.children && node.children.length > 0;
    const config = roleConfig[node.role] || { label: 'Member', bg: 'bg-gray-500', text: 'text-gray-600', border: 'border-gray-300', accentBg: 'bg-gray-50' };

    return (
      <li key={node.userId}>
        <div 
          onClick={() => {
            setActiveDrawerUser(node);
          }}
          className={`inline-block p-5 rounded-3xl border bg-white shadow-soft text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-medium cursor-pointer relative group ${config.border}`}
          style={{ minWidth: '240px' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-sm shrink-0 bg-gray-50 flex items-center justify-center relative">
              {node.photo ? (
                <img src={node.photo} alt={node.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-black text-secondary">{node.name[0]}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-gray-800 truncate flex items-center gap-1.5">
                {node.name}
                {node.role === 'founder' && <span className="text-xs text-amber-500">👑</span>}
              </div>
              <div className={`inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mt-1 ${config.accentBg} ${config.text}`}>
                {config.label}
              </div>
              <div className="text-[10px] font-mono text-gray-400 mt-1 font-semibold">{node.employeeId}</div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-50 text-[10px] text-gray-500 flex items-center gap-1">
            <MapPin size={10} className="text-primary" />
            <span className="truncate">{node.district ? `${node.district}, ${node.state}` : node.state || 'India'}</span>
          </div>

          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.userId);
              }}
              className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-medium hover:bg-gray-50 hover:scale-110 active:scale-95 transition-all z-20"
            >
              {isExpanded ? (
                <ChevronDown size={14} className="text-secondary rotate-180 transition-transform duration-300" />
              ) : (
                <ChevronDown size={14} className="text-secondary transition-transform duration-300" />
              )}
            </button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <ul>
            {node.children.map((child: any) => renderTreeBranch(child))}
          </ul>
        )}
      </li>
    );
  };

  // Define spotlight variables cleanly
  const spotlightUser = coreMembers.find((m: any) => m.priority === 1) || founderProfile || null;
  const spotlightName = spotlightUser ? spotlightUser.name : ORGANIZATION_PROFILE.founderName;
  const spotlightDesignation = spotlightUser ? (spotlightUser.designation || '') : ORGANIZATION_PROFILE.founderDesignation;
  const spotlightPhoto = spotlightUser ? (spotlightUser.photo || '') : ORGANIZATION_PROFILE.founderPhoto;
  
  // Clean fallbacks: no sub-field fallback to ORGANIZATION_PROFILE if a database record is found.
  const spotlightMessage = spotlightUser ? (spotlightUser.message || '') : ORGANIZATION_PROFILE.founderMessage;
  const spotlightBio = spotlightUser ? (spotlightUser.bio || '') : ORGANIZATION_PROFILE.founderBio;
  
  // Card renderer helper
  const renderMemberCard = (m: TeamMember) => {
    const style = roleConfig[m.role] || { 
      label: m.role.replace(/_/g, ' '), 
      bg: 'bg-violet-500', 
      text: 'text-violet-600', 
      border: 'border-violet-300', 
      accentBg: 'bg-violet-50' 
    };
    return (
      <motion.div
        key={m.userId}
        whileHover={{ y: -6 }}
        className={`bg-white rounded-[24px] border ${style.border} p-6 shadow-soft hover:shadow-medium cursor-pointer transition-all flex flex-col justify-between`}
        onClick={() => setActiveDrawerUser(m)}
      >
        <div className="space-y-4">
          {/* Photo and Badge */}
          <div className="flex justify-between items-start">
            <div className="w-16 h-16 rounded-[20px] overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
              {m.photo ? (
                <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-secondary">{m.name[0]}</span>
              )}
            </div>
            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${style.accentBg} ${style.text}`}>
              {style.label}
            </span>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-bold text-lg text-gray-800 line-clamp-1 flex items-center gap-1">
              {m.name}
              {m.role === 'founder' && <span className="text-amber-500">👑</span>}
            </h3>
            <p className="text-xs font-mono text-gray-400 mt-0.5">{m.employeeId}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 font-medium">
          <span className="flex items-center gap-1">
            <MapPin size={12} className="text-primary" /> {m.district || m.state}
          </span>
          <span className="text-[10px] text-gray-400">
            Joined {new Date(m.joiningDate).getFullYear()}
          </span>
        </div>
      </motion.div>
    );
  };

  // Group members dynamically
  const vendors = members.filter(m => m.role === 'vendor');
  const subVendors = members.filter(m => m.role === 'sub_vendor');
  const others = members.filter(m => m.role !== 'vendor' && m.role !== 'sub_vendor');
  


  return (
    <div className="min-h-screen bg-bg-light relative overflow-x-hidden">
      {/* Background Blobs */}
      <div className="shape-blob bg-primary w-[300px] h-[300px] top-10 left-[-100px] opacity-10"></div>
      <div className="shape-blob bg-secondary w-[400px] h-[400px] top-[20%] right-[-150px] opacity-10"></div>
      
      {/* 1. Hero Banner Section */}
      <section className="relative overflow-hidden pt-12 pb-16 bg-gradient-to-br from-secondary-dark via-secondary to-primary text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08)_0%,transparent_80%)]"></div>
        <div className="container relative z-10 px-4">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest text-primary-light">
              {t('team.tag', 'Our Workforce')}
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              {t('team.title', 'Our Dedicated Team')}
            </h1>
            <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              Meet the community leaders, executives, and field heroes driving sanitation awareness, health education, and self-reliance at the grass-roots across India.
            </p>
          </div>

          {/* Animated Statistics Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
            <div className="glass-card bg-white/5 border-white/10 p-6 rounded-[24px] text-center shadow-lg hover:bg-white/10 hover:-translate-y-1 transition-all">
              <p className="text-3xl md:text-4xl font-black text-primary-light">
                <AnimatedCounter value={stats.totalTeamMembers} />
              </p>
              <p className="text-xs font-bold uppercase text-white/70 tracking-widest mt-2">Team Members</p>
            </div>
            <div className="glass-card bg-white/5 border-white/10 p-6 rounded-[24px] text-center shadow-lg hover:bg-white/10 hover:-translate-y-1 transition-all">
              <p className="text-3xl md:text-4xl font-black text-primary-light">
                <AnimatedCounter value={stats.activeDistricts} />
              </p>
              <p className="text-xs font-bold uppercase text-white/70 tracking-widest mt-2">Active Districts</p>
            </div>
            <div className="glass-card bg-white/5 border-white/10 p-6 rounded-[24px] text-center shadow-lg hover:bg-white/10 hover:-translate-y-1 transition-all">
              <p className="text-3xl md:text-4xl font-black text-primary-light">
                <AnimatedCounter value={stats.activeStates} />
              </p>
              <p className="text-xs font-bold uppercase text-white/70 tracking-widest mt-2">Active States</p>
            </div>
            <div className="glass-card bg-white/5 border-white/10 p-6 rounded-[24px] text-center shadow-lg hover:bg-white/10 hover:-translate-y-1 transition-all">
              <p className="text-3xl md:text-4xl font-black text-primary-light">
                <AnimatedCounter value={stats.totalGroups} />
              </p>
              <p className="text-xs font-bold uppercase text-white/70 tracking-widest mt-2">Women Groups</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Founder Spotlight Section */}
      <section className="section-padding !py-12 bg-white relative">
        <div className="container px-4">
          <div className="glass-card !bg-grad-soft border border-primary/10 rounded-[36px] overflow-hidden p-8 md:p-12 shadow-soft hover:shadow-medium hover:translate-y-0 transition-all">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
              <div className="relative shrink-0">
                <div className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-white shadow-medium bg-white flex items-center justify-center relative">
                  {spotlightPhoto ? (
                    <img 
                      src={spotlightPhoto} 
                      alt={spotlightName} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-5xl md:text-7xl font-black select-none">
                      {spotlightName ? spotlightName.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                </div>
                <div className="absolute top-2 right-2 w-10 h-10 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center shadow-md animate-bounce">
                  <span className="text-white text-base">👑</span>
                </div>
              </div>

              <div className="text-center lg:text-left flex-1 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider">
                  <Award size={14} /> Founder Spotlight
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-secondary-dark">{spotlightName}</h2>
                {spotlightDesignation && (
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">{spotlightDesignation}</h3>
                )}
                
                <div className="h-px bg-gray-200/60 my-2"></div>
                
                {spotlightMessage && (
                  <p className="text-secondary italic font-medium text-lg leading-relaxed max-w-xl">
                    &ldquo;{spotlightMessage}&rdquo;
                  </p>
                )}
                {spotlightBio && (
                  <p className="text-gray-600 text-sm leading-relaxed max-w-2xl pt-2">
                    {spotlightBio}
                  </p>
                )}
                

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Organization Statistics Dashboard (Breakdown) */}
      <section className="section-padding !py-8 bg-bg-light">
        <div className="container px-4">
          <div className="section-title !mb-8">
            <span>Core Statistics</span>
            <h2 className="text-secondary-dark">Operational Strength Breakdown</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="bg-white border border-gray-100 p-6 rounded-3xl text-center shadow-soft hover:shadow-medium hover:-translate-y-1 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <span className="text-lg">👑</span>
              </div>
              <p className="text-2xl font-black text-gray-800">{stats.founders}</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">Founder</p>
            </div>
            
            <div className="bg-white border border-gray-100 p-6 rounded-3xl text-center shadow-soft hover:shadow-medium hover:-translate-y-1 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Briefcase size={20} />
              </div>
              <p className="text-2xl font-black text-gray-800">{stats.vendors}</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">Vendor Partners</p>
            </div>

            <div className="bg-white border border-gray-100 p-6 rounded-3xl text-center shadow-soft hover:shadow-medium hover:-translate-y-1 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
              <p className="text-2xl font-black text-gray-800">{stats.subVendors}</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">Sub-Vendors</p>
            </div>

            <div className="bg-white border border-gray-100 p-6 rounded-3xl text-center shadow-soft hover:shadow-medium hover:-translate-y-1 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
              <p className="text-2xl font-black text-gray-800">{stats.employees}</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">Field Associates</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3.5 Dynamic Core Leadership Section */}
      {coreMembers && coreMembers.filter((m: any) => m.userId !== spotlightUser?.userId && m.photo && m.photo.trim() !== '').length > 0 && (
        <section className="section-padding !py-12 bg-white relative border-b border-gray-100/50">
          <div className="container px-4">
            <div className="section-title !mb-12">
              <span>Core Leadership</span>
              <h2 className="text-secondary-dark">Meet Our Project Leaders & Trainers</h2>
              <p className="text-gray-500 text-sm mt-2 max-w-2xl mx-auto text-center">
                The coordinators, trainers, and visionaries managing grassroots operations, training modules, and local community initiatives.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {coreMembers.filter((m: any) => m.userId !== spotlightUser?.userId && m.photo && m.photo.trim() !== '').map(m => {
                const style = roleConfig[m.role] || { 
                  label: m.role.replace(/_/g, ' '), 
                  bg: 'bg-violet-500', 
                  text: 'text-violet-600', 
                  border: 'border-violet-300', 
                  accentBg: 'bg-violet-50' 
                };
                return (
                  <motion.div
                    key={m.userId}
                    whileHover={{ y: -6 }}
                    className={`bg-white rounded-[24px] border ${style.border} p-6 shadow-soft hover:shadow-medium cursor-pointer transition-all flex flex-col justify-between`}
                    onClick={() => setActiveDrawerUser(m)}
                  >
                    <div className="space-y-4">
                      {/* Photo and Badge */}
                      <div className="flex justify-between items-start">
                        <div className="w-16 h-16 rounded-[20px] overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
                          {m.photo ? (
                            <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl font-black text-secondary">{m.name[0]}</span>
                          )}
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${style.accentBg} ${style.text}`}>
                          {style.label}
                        </span>
                      </div>

                      {/* Info */}
                      <div>
                        <h3 className="font-bold text-lg text-gray-800 line-clamp-1 flex items-center gap-1">
                          {m.name}
                          {m.role === 'founder' && <span className="text-amber-500">👑</span>}
                        </h3>
                        {m.designation && <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">{m.designation}</p>}
                        {m.employeeId && <p className="text-[10px] font-mono text-gray-400 mt-0.5">{m.employeeId}</p>}
                      </div>

                      {/* Bio Statement */}
                      {m.bio && (
                        <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed border-t border-gray-50 pt-3">
                          {m.bio}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 font-medium">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-primary" /> {m.district || m.state}
                      </span>
                      {m.joiningDate && (
                        <span className="text-[10px] text-gray-400">
                          Joined {new Date(m.joiningDate).getFullYear()}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 4. Controls, Filters and Views */}
      <section className="section-padding !py-12 bg-white relative">
        <div className="container px-4">
          
          {/* View Toggles & Header */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-gray-100 pb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-secondary-dark">Explore Team Directory</h2>
              <p className="text-gray-500 text-sm mt-1">Search and filter through our active workforce.</p>
            </div>
          </div>

          {/* Filters Bar (Only applicable to Grid View) */}
          {viewMode === 'grid' && (
            <div className="mt-8 bg-gray-50 border border-gray-100 p-6 rounded-[28px] shadow-sm space-y-6">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-primary animate-pulse" />
                  <span className="font-black text-sm text-secondary-dark uppercase tracking-wider">Search & Filters</span>
                </div>
                <button
                  suppressHydrationWarning
                  onClick={() => {
                    setSearch('');
                    setRole('all');
                    setSelectedState('all');
                    setSelectedDistrict('all');
                    setSelectedLevel('all');
                  }}
                  className="text-xs font-semibold text-gray-400 hover:text-primary transition-colors flex items-center gap-1"
                >
                  <RefreshCw size={12} /> Reset Filters
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search field */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    suppressHydrationWarning
                    type="text"
                    placeholder="Search name, ID, parent..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:border-primary transition-colors shadow-sm"
                  />
                </div>

                {/* Role select */}
                <div className="relative">
                  <select
                    suppressHydrationWarning
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:border-primary appearance-none transition-colors shadow-sm"
                  >
                    <option value="all">All Roles</option>
                    <option value="founder">Founder</option>
                    <option value="vendor">Vendor Partner</option>
                    <option value="sub_vendor">Sub-Vendor</option>
                    <option value="staff">Staff</option>
                    <option value="employee">Field Associate</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>

                {/* State select */}
                <div className="relative">
                  <select
                    suppressHydrationWarning
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:border-primary appearance-none transition-colors shadow-sm"
                  >
                    <option value="all">All States</option>
                    {states.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>

                {/* District select */}
                <div className="relative">
                  <select
                    suppressHydrationWarning
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:border-primary appearance-none transition-colors shadow-sm"
                  >
                    <option value="all">All Districts</option>
                    {districts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>

                {/* Hierarchy Level select */}
                <div className="relative">
                  <select
                    suppressHydrationWarning
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:border-primary appearance-none transition-colors shadow-sm"
                  >
                    <option value="all">All Levels</option>
                    <option value="1">Level 1 (Founder)</option>
                    <option value="2">Level 2 (Roots)</option>
                    <option value="3">Level 3</option>
                    <option value="4">Level 4</option>
                    <option value="5">Level 5</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
            </div>
          )}

          {/* Render Contents Based on View Mode */}
          
          {/* GRID VIEW */}
          {viewMode === 'grid' && (
            <div className="mt-12 space-y-12">
              {loadingMembers ? (
                <div className="py-24 text-center">
                  <Loader2 className="animate-spin mx-auto text-primary mb-4" size={40} />
                  <p className="text-gray-500 font-bold text-sm">Fetching team directory...</p>
                </div>
              ) : members.length > 0 ? (
                <>
                  <div className="space-y-12">
                    {/* Delivery Partners Section */}
                    {vendors.length > 0 && (
                      <div className="space-y-6">
                        <div className="border-b border-gray-100 pb-4">
                          <h2 className="text-2xl md:text-3xl font-black text-secondary-dark">
                            {t('team.vendorPartners', 'Vendor Partners')}
                          </h2>
                          <p className="text-gray-500 text-sm mt-1">Our certified vendor and distribution network partners.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {vendors.map(renderMemberCard)}
                        </div>
                      </div>
                    )}

                    {/* Sub-Vendor Partners Section */}
                    {subVendors.length > 0 && (
                      <div className="space-y-6">
                        <div className="border-b border-gray-100 pb-4">
                          <h2 className="text-2xl md:text-3xl font-black text-secondary-dark">
                            {t('team.subVendorPartners', 'Sub-Vendor Partners')}
                          </h2>
                          <p className="text-gray-500 text-sm mt-1">Local hubs and secondary sub-distribution partners.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {subVendors.map(renderMemberCard)}
                        </div>
                      </div>
                    )}

                    {/* Other Team Members Section */}
                    {others.length > 0 && (
                      <div className="space-y-6">
                        <div className="border-b border-gray-100 pb-4">
                          <h2 className="text-2xl md:text-3xl font-black text-secondary-dark">
                            {t('team.otherMembers', 'Other Team Members')}
                          </h2>
                          <p className="text-gray-500 text-sm mt-1">Office staff, field associates, and project coordinators.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {others.map(renderMemberCard)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Load More Pagination */}
                  {page < totalPages && (
                    <div className="text-center pt-8">
                      <button
                        onClick={() => fetchMembers(page + 1, true)}
                        disabled={loadingMore}
                        className="btn-primary"
                      >
                        {loadingMore ? (
                          <>
                            <Loader2 className="animate-spin" size={16} /> Loading...
                          </>
                        ) : (
                          <>
                            Load More Team Members <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-24 text-center bg-gray-50 rounded-[32px] border border-dashed border-gray-200">
                  <p className="text-gray-500 font-bold">No team members match the selected filters.</p>
                </div>
              )}
            </div>
          )}

          {/* HIERARCHY TREE VIEW */}
          {viewMode === 'hierarchy' && (
            <div className="mt-12 space-y-6">
              {loadingTree ? (
                <div className="py-32 text-center bg-gray-50 border border-gray-100 rounded-[36px]">
                  <Loader2 className="animate-spin mx-auto text-primary mb-4" size={44} />
                  <p className="text-gray-500 font-bold text-sm">Building organizational hierarchy tree...</p>
                </div>
              ) : treeData ? (
                <div 
                  ref={treeContainerRef}
                  className={`relative overflow-hidden rounded-[36px] bg-slate-50 border border-gray-200/80 shadow-medium ${isFullscreen ? 'w-screen h-screen fixed inset-0 z-[9999]' : 'h-[600px] w-full'}`}
                >
                  {/* Viewport controls overlay */}
                  <div className="absolute top-6 left-6 z-30 flex flex-wrap gap-2">
                    <button
                      onClick={handleZoomIn}
                      className="p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-soft text-gray-600 border border-gray-100 transition-all hover:scale-105 active:scale-95"
                      title="Zoom In"
                    ><ZoomIn size={16} /></button>
                    <button
                      onClick={handleZoomOut}
                      className="p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-soft text-gray-600 border border-gray-100 transition-all hover:scale-105 active:scale-95"
                      title="Zoom Out"
                    ><ZoomOut size={16} /></button>
                    <button
                      onClick={handleResetZoom}
                      className="p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-soft text-gray-600 border border-gray-100 transition-all hover:scale-105 active:scale-95"
                      title="Reset View"
                    ><RefreshCw size={16} /></button>
                    <button
                      onClick={toggleFullscreen}
                      className="p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-soft text-gray-600 border border-gray-100 transition-all hover:scale-105 active:scale-95"
                      title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    >
                      {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                  </div>

                  <div className="absolute top-6 right-6 z-30 flex gap-2">
                    <button
                      onClick={expandAll}
                      className="px-4 py-2.5 bg-white hover:bg-gray-50 rounded-2xl shadow-soft text-secondary border border-gray-100 font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
                    >Expand All</button>
                    <button
                      onClick={collapseAll}
                      className="px-4 py-2.5 bg-white hover:bg-gray-50 rounded-2xl shadow-soft text-gray-500 border border-gray-100 font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
                    >Collapse All</button>
                  </div>

                  {/* Help banner */}
                  <div className="absolute bottom-6 left-6 z-30 bg-secondary/80 backdrop-blur-sm text-white px-4 py-2.5 rounded-2xl shadow-soft text-xs flex items-center gap-2">
                    <HelpCircle size={14} /> Drag the canvas to pan. Click nodes for details. Toggles ± expand branch.
                  </div>

                  {/* Drag Viewport */}
                  <div 
                    className="w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden flex items-center justify-center"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <div 
                      className="org-tree-container origin-center"
                      style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.1, 0.8, 0.25, 1)'
                      }}
                    >
                      <style dangerouslySetInnerHTML={{ __html: `
                        .org-tree-container ul {
                          padding-top: 30px;
                          position: relative;
                          transition: all 0.3s;
                          display: flex;
                          justify-content: center;
                          gap: 32px;
                        }
                        .org-tree-container li {
                          text-align: center;
                          list-style-type: none;
                          position: relative;
                          padding: 30px 10px 0 10px;
                          transition: all 0.3s;
                          display: flex;
                          flex-direction: column;
                          align-items: center;
                        }
                        .org-tree-container li::before, .org-tree-container li::after {
                          content: '';
                          position: absolute;
                          top: 0;
                          right: 50%;
                          border-top: 2px solid #D6BCFA;
                          width: 50%;
                          height: 30px;
                        }
                        .org-tree-container li::after {
                          right: auto;
                          left: 50%;
                          border-left: 2px solid #D6BCFA;
                        }
                        .org-tree-container li:only-child::after, .org-tree-container li:only-child::before {
                          display: none;
                        }
                        .org-tree-container li:only-child {
                          padding-top: 0;
                        }
                        .org-tree-container li:first-child::before, .org-tree-container li:last-child::after {
                          border: 0 none;
                        }
                        .org-tree-container li:last-child::before {
                          border-right: 2px solid #D6BCFA;
                          border-radius: 0 12px 0 0;
                        }
                        .org-tree-container li:first-child::after {
                          border-radius: 12px 0 0 0;
                        }
                        .org-tree-container ul ul::before {
                          content: '';
                          position: absolute;
                          top: 0;
                          left: 50%;
                          border-left: 2px solid #D6BCFA;
                          width: 0;
                          height: 30px;
                        }
                      `}} />
                      <ul>
                        {renderTreeBranch(treeData)}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-24 text-center bg-gray-50 rounded-[32px] border border-dashed border-gray-200">
                  <p className="text-gray-500 font-bold">Failed to render tree hierarchy data.</p>
                </div>
              )}
            </div>
          )}

          {/* REPORTING CHAIN VIEW */}
          {viewMode === 'chain' && (
            <div className="mt-12 max-w-4xl mx-auto space-y-8">
              <div className="bg-slate-50 border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="font-bold text-lg text-secondary-dark">Select Team Member</h3>
                  <p className="text-xs text-gray-500 mt-1">Search and select an active partner to trace their exact line of reportage from the Chairperson.</p>
                </div>

                {/* Dropdown selector */}
                <div className="relative">
                  <select
                    onChange={(e) => {
                      const selected = members.find(m => m.userId === e.target.value);
                      if (selected) selectChainMember(selected);
                    }}
                    className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-200 text-sm font-bold text-gray-700 focus:outline-none focus:border-primary appearance-none transition-colors shadow-sm"
                  >
                    <option value="">Select a member to view reporting chain...</option>
                    {members.filter(m => m.role !== 'founder').map(m => (
                      <option key={m.userId} value={m.userId}>
                        {m.name} ({m.role.replace('_', ' ').toUpperCase()} • {m.employeeId})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Timeline Output */}
              {selectedChainNode && reportingChain.length > 0 ? (
                <div className="bg-white border border-primary/5 rounded-[36px] p-8 md:p-12 shadow-soft space-y-10 relative">
                  <div className="absolute top-10 right-10 flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] text-emerald-600 font-black uppercase tracking-wider">
                    <CheckCircle size={10} /> Active Chain
                  </div>

                  <h3 className="text-center font-black text-xl text-secondary-dark mb-10 tracking-tight">
                    Reporting Path: {selectedChainNode.name}
                  </h3>

                  <div className="relative border-l-4 border-dashed border-primary/20 ml-6 md:ml-12 pl-8 md:pl-16 space-y-12 py-4">
                    {reportingChain.map((node, index) => {
                      const config = roleConfig[node.role] || { label: 'Member', bg: 'bg-gray-500', text: 'text-gray-600', border: 'border-gray-300', accentBg: 'bg-amber-50' };
                      return (
                        <div key={node.userId} className="relative group">
                          {/* Left dot */}
                          <div className={`absolute -left-[45px] md:-left-[79px] top-6 w-8 h-8 rounded-full border-4 border-white shadow-md flex items-center justify-center font-black text-xs text-white ${config.bg}`}>
                            {index + 1}
                          </div>

                          <div 
                            onClick={() => setActiveDrawerUser(node)}
                            className="bg-gray-50/70 border border-gray-100 rounded-3xl p-6 hover:bg-white hover:shadow-medium hover:border-primary/20 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border-2 border-white shadow-sm bg-white flex items-center justify-center">
                                {node.photo ? (
                                  <img src={node.photo} alt={node.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-lg font-black text-secondary">{node.name[0]}</span>
                                )}
                              </div>
                              <div>
                                <h4 className="font-bold text-base text-gray-800 flex items-center gap-1.5">
                                  {node.name}
                                  {node.role === 'founder' && <span className="text-amber-500 text-sm">👑</span>}
                                </h4>
                                <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mt-1 ${config.accentBg} ${config.text}`}>
                                  {config.label}
                                </span>
                                <div className="text-[10px] font-mono text-gray-400 mt-1 font-semibold">{node.employeeId}</div>
                              </div>
                            </div>

                            <div className="text-left md:text-right text-xs text-gray-500 space-y-1">
                              <div>📍 {node.district ? `${node.district}, ${node.state}` : node.state}</div>
                              <div className="text-[10px] text-gray-400 font-semibold">Level {node.level} • Joined {new Date(node.joiningDate).getFullYear()}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-24 text-center bg-gray-50 rounded-[32px] border border-dashed border-gray-200">
                  <HelpCircle className="mx-auto text-gray-300 mb-2" size={32} />
                  <p className="text-gray-500 font-bold text-sm">Please select a team member from the dropdown above to map their reporting chain.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      {/* 5. PROFILE DRAWER PANEL */}
      <AnimatePresence>
        {activeDrawerUser && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveDrawerUser(null)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            ></motion.div>

            {/* Sliding Drawer Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-white z-[60] shadow-2xl flex flex-col justify-between overflow-y-auto no-scrollbar border-l border-gray-100"
            >
              {/* Drawer Top Header Banner */}
              <div className="bg-gradient-to-r from-secondary-dark to-secondary p-8 text-white relative">
                <button
                  onClick={() => setActiveDrawerUser(null)}
                  className="absolute right-6 top-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all text-white"
                  title="Close Profile"
                >
                  <X size={20} />
                </button>

                <div className="flex gap-5 items-center mt-6">
                  <div className="w-20 h-20 rounded-[24px] bg-white border-2 border-white/25 overflow-hidden flex items-center justify-center shrink-0">
                    {activeDrawerUser.photo ? (
                      <img src={activeDrawerUser.photo} alt={activeDrawerUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-black text-secondary">{activeDrawerUser.name[0]}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black flex items-center gap-1.5">
                      {activeDrawerUser.name}
                      {activeDrawerUser.role === 'founder' && <span className="text-lg text-yellow-500">👑</span>}
                    </h3>
                    <div className="inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-white/20 rounded-md mt-1.5 border border-white/15">
                      {roleConfig[activeDrawerUser.role]?.label || activeDrawerUser.role}
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Body details list */}
              <div className="p-8 flex-1 space-y-6">
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                    Basic Identification
                  </h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase">Public Identification ID</p>
                        <p className="font-mono font-bold text-secondary text-sm mt-0.5">{activeDrawerUser.employeeId}</p>
                      </div>
                      <span className="text-xs text-gray-400">🛡️ Public Protected</span>
                    </div>

                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase">Hierarchy Hierarchy Level</p>
                        <p className="font-bold text-secondary text-sm mt-0.5">Level {activeDrawerUser.level}</p>
                      </div>
                      <span className="text-xs text-gray-400">🌳 Node Depth</span>
                    </div>

                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase">Joined Date</p>
                        <p className="font-bold text-secondary text-sm mt-0.5">
                          {new Date(activeDrawerUser.joiningDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">📅 Calendar</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 my-2"></div>

                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                    Reporting Relationships
                  </h4>
                  <div className="p-4 bg-slate-50 border border-gray-100 rounded-2xl space-y-4">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase">Reports To Manager</p>
                      <p className="font-bold text-gray-800 text-sm mt-0.5">
                        {activeDrawerUser.parent ? activeDrawerUser.parent.name : '—'}
                      </p>
                    </div>
                    {activeDrawerUser.parent && (
                      <div className="grid grid-cols-2 gap-4 text-xs border-t border-gray-200/50 pt-3">
                        <div>
                          <p className="text-[8px] font-black text-gray-400 uppercase">Parent Role</p>
                          <p className="font-bold text-gray-600 mt-0.5">
                            {roleConfig[activeDrawerUser.parent.role]?.label || activeDrawerUser.parent.role}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-gray-400 uppercase">Parent Masked ID</p>
                          <p className="font-mono font-bold text-gray-600 mt-0.5">{activeDrawerUser.parent.id}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-100 my-2"></div>

                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                    Regional Assignment
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                      <p className="text-[9px] font-black text-gray-400 uppercase">District</p>
                      <p className="font-bold text-secondary text-sm mt-0.5">{activeDrawerUser.district || '—'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                      <p className="text-[9px] font-black text-gray-400 uppercase">State</p>
                      <p className="font-bold text-secondary text-sm mt-0.5">{activeDrawerUser.state || '—'}</p>
                    </div>
                  </div>
                </div>

                {activeDrawerUser.bio && (
                  <>
                    <div className="border-t border-gray-100 my-2"></div>
                    <div>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                        Biography & Statement
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line bg-amber-50/50 border border-amber-100/50 p-4 rounded-2xl">
                        {activeDrawerUser.bio}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Drawer Bottom Footer */}
              <div className="p-8 border-t border-gray-100 bg-gray-50 flex gap-3 shrink-0">
                <button
                  onClick={() => setActiveDrawerUser(null)}
                  className="btn-secondary w-full text-center py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider border border-gray-200"
                  style={{ justifyContent: 'center' }}
                >
                  Close Profile
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
