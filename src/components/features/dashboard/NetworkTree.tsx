'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ChevronRight, ChevronDown, User, ShieldCheck, 
  Briefcase, Users, Search, MapPin, Phone, 
  Sparkles, ExternalLink, Filter, Info, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { getProxiedImageUrl } from '@/utils/imageUrl';

export interface NetworkNode {
  id: string;
  name: string;
  code: string;
  role: string;
  mobile?: string;
  location?: string;
  status?: string;
  profileImage?: string;
  children: NetworkNode[];
  hasChildren?: boolean;
  counts?: { subVendors: number; employees: number; members: number };
  hasRisk?: boolean;
}

interface NetworkTreeProps {
  data: NetworkNode;
  loading?: boolean;
  viewerRole?: 'super_admin' | 'vendor' | 'sub_vendor' | 'employee';
  onNodeClick?: (node: NetworkNode) => void;
  onExpand?: (nodeId: string) => Promise<void> | void;
  expandedNodes?: Set<string>;
  setExpandedNodes?: React.Dispatch<React.SetStateAction<Set<string>>>;
  loadingNodes?: Set<string>;
  selectedNodeId?: string;
  onSearchResultSelect?: (result: any) => void;
}

const RoleIcon = ({ role, size = 16 }: { role: string; size?: number }) => {
  switch (role) {
    case 'vendor': return <ShieldCheck size={size} className="text-secondary" />;
    case 'sub_vendor': return <Sparkles size={size} className="text-primary" />;
    case 'employee': return <Briefcase size={size} className="text-blue-500" />;
    case 'member': return <User size={size} className="text-amber-500" />;
    default: return <Users size={size} className="text-gray-400" />;
  }
};

const TreeNode = ({ 
  node, 
  level, 
  expandedNodes, 
  toggleNode, 
  viewerRole, 
  onNodeClick,
  loadingNodes,
  selectedNodeId
}: { 
  node: NetworkNode; 
  level: number; 
  expandedNodes: Set<string>;
  toggleNode: (id: string, hasChildren: boolean, childrenCount: number) => void;
  viewerRole?: string;
  onNodeClick?: (node: NetworkNode) => void;
  loadingNodes?: Set<string>;
  selectedNodeId?: string;
}) => {
  const isExpanded = expandedNodes.has(node.id);
  const hasChildren = node.hasChildren || (node.children && node.children.length > 0);
  const isLoading = loadingNodes?.has(node.id);
  const isSelected = selectedNodeId === node.id;

  return (
    <div className="flex flex-col">
      <div 
        className={`flex items-center gap-3 py-3 px-4 rounded-2xl transition-all cursor-pointer group ${
          isSelected ? 'bg-primary/5 ring-1 ring-primary/20' : 'hover:bg-gray-50'
        }`}
        style={{ marginLeft: `${level * 24}px` }}
        onClick={() => onNodeClick?.(node)}
      >
        <div className="flex items-center gap-2 min-w-[24px]">
          {isLoading ? (
            <div className="w-[18px] h-[18px] border-2 border-gray-200 border-t-primary rounded-full animate-spin shrink-0" />
          ) : hasChildren ? (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id, !!node.hasChildren, node.children ? node.children.length : 0);
              }}
              className="text-gray-400 hover:text-primary transition-colors p-1 rounded-md hover:bg-gray-100"
            >
              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
          ) : (
            <div className="w-[18px]" />
          )}
        </div>

        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm overflow-hidden ${
          node.role === 'vendor' ? 'bg-secondary text-white' :
          node.role === 'sub_vendor' ? 'bg-primary text-white' :
          node.role === 'employee' ? 'bg-blue-50 text-blue-500' :
          'bg-amber-50 text-amber-500'
        }`}>
          {node.profileImage ? (
            <img src={getProxiedImageUrl(node.profileImage)} alt={node.name} className="w-full h-full object-cover" />
          ) : (
            <RoleIcon role={node.role} size={20} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={`text-sm font-black truncate ${isSelected ? 'text-primary' : 'text-secondary'}`}>
              {node.name}
            </h4>
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-gray-100 rounded-md text-gray-400 shrink-0">
              {node.role.replace('_', ' ')}
            </span>
            {node.counts && (
              <span className="text-[9px] font-bold text-primary/70 bg-primary/5 px-2 py-0.5 rounded-md shrink-0">
                {node.role === 'vendor' && `${node.counts.subVendors} SV | ${node.counts.employees} EMP | ${node.counts.members} MEM`}
                {node.role === 'sub_vendor' && `${node.counts.employees} EMP | ${node.counts.members} MEM`}
                {node.role === 'employee' && `${node.counts.members} MEM`}
              </span>
            )}
            {node.hasRisk && (
              <span className="relative flex h-2.5 w-2.5" title="Risk flags detected on this node">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 overflow-hidden">
            <span className="text-[10px] font-bold text-gray-400 truncate">{node.code}</span>
            {node.mobile && (viewerRole === 'super_admin' || node.role !== 'member') && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 shrink-0">
                <Phone size={8} /> {node.mobile}
              </span>
            )}
            {node.location && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 truncate">
                <MapPin size={8} /> {node.location}
              </span>
            )}
            {viewerRole === 'super_admin' && node.status && (
              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                node.status === 'active' || node.status === 'paid' || node.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
              }`}>
                {node.status}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
          {onNodeClick && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onNodeClick(node);
              }}
              className="p-2 bg-secondary text-white rounded-lg shadow-lg hover:scale-110 transition-transform"
              title="View Details"
            >
              <ExternalLink size={14} />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && hasChildren && node.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="ml-[19px] border-l-2 border-gray-100 pl-1 mt-1">
              {node.children.map(child => (
                <TreeNode 
                  key={child.id} 
                  node={child} 
                  level={0}
                  expandedNodes={expandedNodes}
                  toggleNode={toggleNode}
                  viewerRole={viewerRole}
                  onNodeClick={onNodeClick}
                  loadingNodes={loadingNodes}
                  selectedNodeId={selectedNodeId}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function NetworkTree({ 
  data, 
  loading, 
  viewerRole, 
  onNodeClick,
  onExpand,
  expandedNodes,
  setExpandedNodes,
  loadingNodes,
  selectedNodeId,
  onSearchResultSelect
}: NetworkTreeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Local state for expanded nodes if not controlled
  const [localExpandedNodes, setLocalExpandedNodes] = useState<Set<string>>(new Set(['root', data?.id]));
  const activeExpandedNodes = expandedNodes || localExpandedNodes;
  const activeSetExpandedNodes = setExpandedNodes || setLocalExpandedNodes;

  // Debounced search query
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const delay = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await axios.get(`/api/admin/network/search?q=${searchQuery}`);
        if (res.data.success) {
          setSearchResults(res.data.data);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as any)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleNode = async (id: string, hasChildren: boolean, childrenCount: number) => {
    const isExpanded = activeExpandedNodes.has(id);
    if (!isExpanded && hasChildren && childrenCount === 0 && onExpand) {
      await onExpand(id);
    }
    const newSet = new Set(activeExpandedNodes);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    activeSetExpandedNodes(newSet);
  };

  const expandAll = () => {
    const ids = new Set<string>();
    const collectIds = (node: NetworkNode) => {
      if (node.hasChildren || (node.children && node.children.length > 0)) {
        ids.add(node.id);
        if (node.children) node.children.forEach(collectIds);
      }
    };
    if (data) collectIds(data);
    activeSetExpandedNodes(ids);
  };

  const collapseAll = () => {
    activeSetExpandedNodes(new Set([data?.id]));
  };

  if (loading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-primary rounded-full animate-spin"></div>
        <p className="text-gray-400 font-bold animate-pulse uppercase tracking-widest text-[10px]">Assembling Network Tree...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-6">
      <div 
        ref={searchRef}
        className="relative flex flex-wrap items-center justify-between gap-6 bg-white p-6 rounded-[32px] border border-gray-100 shadow-soft"
      >
        <div className="relative flex-1 min-w-[300px]">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search by name, code, mobile or location..." 
            className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
          />
          {searching && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {/* Search suggestions dropdown */}
          <AnimatePresence>
            {showDropdown && searchResults.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar"
              >
                {searchResults.map((result) => (
                  <div 
                    key={result.id}
                    onClick={() => {
                      setSearchQuery('');
                      setShowDropdown(false);
                      onSearchResultSelect?.(result);
                    }}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs uppercase ${
                        result.role === 'vendor' ? 'bg-secondary text-white' :
                        result.role === 'sub_vendor' ? 'bg-primary text-white' :
                        result.role === 'employee' ? 'bg-blue-50 text-blue-500' :
                        'bg-amber-50 text-amber-500'
                      }`}>
                        {result.role[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-secondary">{result.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold">
                          {result.code} • <span className="uppercase">{result.role.replace('_', ' ')}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary px-3 py-1 bg-primary/5 rounded-lg">
                      Select
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={expandAll}
            className="px-6 py-4 bg-secondary/5 text-secondary rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-secondary hover:text-white transition-all"
          >
            Expand All
          </button>
          <button 
            onClick={collapseAll}
            className="px-6 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all"
          >
            Collapse
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft min-h-[500px] overflow-x-auto">
        <div className="flex flex-col gap-1 min-w-[600px]">
          <TreeNode 
            node={data} 
            level={0} 
            expandedNodes={activeExpandedNodes}
            toggleNode={toggleNode}
            viewerRole={viewerRole}
            onNodeClick={onNodeClick}
            loadingNodes={loadingNodes}
            selectedNodeId={selectedNodeId}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
        <Info size={20} className="text-blue-500 shrink-0" />
        <p className="text-xs text-blue-600 font-bold leading-relaxed">
          The network tree displays live child counters. Click on expand chevrons to load children dynamically. 
          Use the search bar to search across all levels and auto-expand paths.
        </p>
      </div>
    </div>
  );
}
