'use client';

import React, { useState, useMemo } from 'react';
import { 
  ChevronRight, ChevronDown, User, ShieldCheck, 
  Briefcase, Users, Search, MapPin, Phone, 
  Sparkles, ExternalLink, Filter, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProxiedImageUrl } from '@/utils/imageUrl';

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
}

interface NetworkTreeProps {
  data: Node;
  loading?: boolean;
  viewerRole?: 'super_admin' | 'vendor' | 'sub_vendor' | 'employee';
  onNodeClick?: (node: Node) => void;
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

const TreeNode = ({ node, level, searchTerm, expandedNodes, toggleNode, viewerRole, onNodeClick }: { 
  node: Node; 
  level: number; 
  searchTerm: string;
  expandedNodes: Set<string>;
  toggleNode: (id: string) => void;
  viewerRole?: string;
  onNodeClick?: (node: Node) => void;
}) => {
  const isExpanded = expandedNodes.has(node.id);
  const hasChildren = node.children.length > 0;
  
  // Highlight if matches search
  const isMatch = useMemo(() => {
    if (!searchTerm) return false;
    const s = searchTerm.toLowerCase();
    return (
      node.name.toLowerCase().includes(s) ||
      node.code?.toLowerCase().includes(s) ||
      node.mobile?.toLowerCase().includes(s) ||
      node.location?.toLowerCase().includes(s)
    );
  }, [node, searchTerm]);

  return (
    <div className="flex flex-col">
      <div 
        className={`flex items-center gap-3 py-3 px-4 rounded-2xl transition-all cursor-pointer group ${
          isMatch ? 'bg-primary/5 ring-1 ring-primary/20' : 'hover:bg-gray-50'
        }`}
        style={{ marginLeft: `${level * 24}px` }}
        onClick={() => hasChildren && toggleNode(node.id)}
      >
        <div className="flex items-center gap-2 min-w-[24px]">
          {hasChildren ? (
            <div className="text-gray-400 group-hover:text-primary transition-colors">
              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </div>
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
          <div className="flex items-center gap-2">
            <h4 className={`text-sm font-black truncate ${isMatch ? 'text-primary' : 'text-secondary'}`}>
              {node.name}
            </h4>
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-gray-100 rounded-md text-gray-400 shrink-0">
              {node.role.replace('_', ' ')}
            </span>
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
                node.status === 'active' || node.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
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
        {isExpanded && hasChildren && (
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
                  searchTerm={searchTerm}
                  expandedNodes={expandedNodes}
                  toggleNode={toggleNode}
                  viewerRole={viewerRole}
                  onNodeClick={onNodeClick}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function NetworkTree({ data, loading, viewerRole, onNodeClick }: NetworkTreeProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([data?.id]));

  // Auto-expand parents of matches
  const filteredTree = useMemo(() => {
    if (!searchTerm) return data;
    
    const s = searchTerm.toLowerCase();
    const newExpanded = new Set<string>();

    const filterNode = (node: Node): Node | null => {
      const isMatch = 
        node.name.toLowerCase().includes(s) ||
        node.code?.toLowerCase().includes(s) ||
        node.mobile?.toLowerCase().includes(s) ||
        node.location?.toLowerCase().includes(s);

      const filteredChildren = node.children
        .map(child => filterNode(child))
        .filter(child => child !== null) as Node[];

      if (isMatch || filteredChildren.length > 0) {
        if (filteredChildren.length > 0) {
          newExpanded.add(node.id);
        }
        return { ...node, children: filteredChildren };
      }
      return null;
    };

    const result = filterNode(data);
    setExpandedNodes(prev => new Set([...prev, ...newExpanded]));
    return result;
  }, [data, searchTerm]);

  const toggleNode = (id: string) => {
    const newSet = new Set(expandedNodes);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedNodes(newSet);
  };

  const expandAll = () => {
    const ids = new Set<string>();
    const collectIds = (node: Node) => {
      if (node.children.length > 0) {
        ids.add(node.id);
        node.children.forEach(collectIds);
      }
    };
    if (data) collectIds(data);
    setExpandedNodes(ids);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set([data?.id]));
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
      <div className="flex flex-wrap items-center justify-between gap-6 bg-white p-6 rounded-[32px] border border-gray-100 shadow-soft">
        <div className="relative flex-1 min-w-[300px]">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, code, mobile or location..." 
            className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
          />
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

      <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft min-h-[500px]">
        {!filteredTree ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-black text-secondary">No matches found</h3>
            <p className="text-gray-400 font-bold mt-2">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <TreeNode 
              node={filteredTree} 
              level={0} 
              searchTerm={searchTerm}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              viewerRole={viewerRole}
              onNodeClick={onNodeClick}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
        <Info size={20} className="text-blue-500 shrink-0" />
        <p className="text-xs text-blue-600 font-bold leading-relaxed">
          The network tree shows your entire downstream organization. Click on chevron icons to expand/collapse branches. 
          Use the search bar to instantly find any partner, employee or member across all levels.
        </p>
      </div>
    </div>
  );
}
