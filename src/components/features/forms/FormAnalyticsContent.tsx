'use client';

import React, { useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import { 
  ChevronLeft, BarChart3, Users, MapPin, 
  Download, RefreshCw, Calendar, PieChart, 
  TrendingUp, FileText, CheckCircle, HelpCircle, Save 
} from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { toast } from 'sonner';
import { useAuth } from "@/hooks/useAuth";

export default function FormAnalyticsContent() {
  const { user: currentUser } = useAuth();
  const params = useParams();
  const pathname = usePathname();
  const id = params ? params.id : null;
  
  const basePath = pathname?.startsWith('/admin') ? '/admin/forms' : '/portal/forms';

  const canExport = currentUser?.role === 'super_admin' || 
    (Array.isArray(currentUser?.permissions) && currentUser.permissions.includes('forms.export'));

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchAnalytics();
      fetchReports();
    }
  }, [id]);

  const fetchAnalytics = async (refresh = false) => {
    try {
      const res = await axios.get(`/api/admin/forms/${id}/analytics${refresh ? '?refresh=true' : ''}`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await axios.get(`/api/admin/forms/${id}/reports`);
      if (res.data.success) {
        setReports(res.data.data);
      }
    } catch (err) {}
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchAnalytics(true);
      toast.success('Analytics triggered refresh');
    } finally {
      setRefreshing(false);
    }
  };

  const triggerExport = (format: 'csv' | 'excel' | 'pdf') => {
    window.open(`/api/admin/forms/${id}/export?format=${format}`, '_blank');
    toast.success(`${format.toUpperCase()} export started.`);
  };

  if (loading) {
    return (
      <div className="text-center py-24">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-400 font-bold tracking-widest text-xs uppercase">Loading analytics framework...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white p-12 rounded-[24px] shadow-sm border border-gray-100 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-500 mb-6">We couldn't compile analytics for this form.</p>
        <Link href={basePath} className="text-primary font-bold hover:underline">Back to Forms</Link>
      </div>
    );
  }

  const isBuilding = data.analyticsStatus === 'building';
  const total = data.totalResponses || 0;

  // Demographics mapping
  const gender = data.demographics?.gender || { male: 0, female: 0, unspecified: 0 };
  const age = data.demographics?.ageGroups || { under18: 0, y18_25: 0, y26_45: 0, above45: 0 };
  const roles = data.demographics?.userTypes || {};

  // Locations mapping
  const locationStates = data.locationStats?.states || {};
  const locationDistricts = data.locationStats?.districts || {};
  const locationBlocks = data.locationStats?.blocks || {};

  // Custom SVG Bar Chart metrics
  const maxGender = Math.max(gender.male, gender.female, gender.unspecified, 1);
  const maxAge = Math.max(age.under18, age.y18_25, age.y26_45, age.above45, 1);

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div>
        <Link href={basePath} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary mb-6 transition-colors">
          <ChevronLeft size={16} /> Back to Forms
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h2 className="text-3xl font-black text-secondary">Form Analytics Dashboard</h2>
            <p className="text-gray-400 font-bold mt-1 text-xs uppercase tracking-widest">Version v{data.formVersion} snapshot metrics</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing || isBuilding}
              className="flex items-center gap-2 px-5 py-3 bg-white text-secondary border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:scale-105 transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing || isBuilding ? 'animate-spin' : ''} />
              {isBuilding ? 'Syncing Stats...' : 'Refresh'}
            </button>
            {canExport && (
              <div className="relative group">
                <button className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                  <Download size={14} /> Export Report
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl hidden group-hover:block z-55 overflow-hidden">
                  <button onClick={() => triggerExport('csv')} className="w-full px-4 py-3 text-left text-xs font-bold text-gray-700 hover:bg-gray-50 border-b border-gray-100">Export CSV</button>
                  <button onClick={() => triggerExport('excel')} className="w-full px-4 py-3 text-left text-xs font-bold text-gray-700 hover:bg-gray-50 border-b border-gray-100">Export Excel</button>
                  <button onClick={() => triggerExport('pdf')} className="w-full px-4 py-3 text-left text-xs font-bold text-gray-700 hover:bg-gray-50">Export PDF Report</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rebuild Banner */}
      {isBuilding && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex items-center gap-4 text-amber-800 animate-pulse">
          <RefreshCw size={24} className="animate-spin text-amber-600 shrink-0" />
          <div>
            <h4 className="font-black text-sm uppercase tracking-wider">Syncing Form Cache</h4>
            <p className="text-xs font-medium text-amber-700 mt-0.5">We are currently compiling new entries in the background. The metrics displayed below will update shortly.</p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><FileText size={22} /></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Total Responses</p>
            <p className="text-2xl font-black text-secondary mt-1">{total}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0"><CheckCircle size={22} /></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Submitted</p>
            <p className="text-2xl font-black text-secondary mt-1">{data.statusBreakdown?.submitted || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><PieChart size={22} /></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Reviewed</p>
            <p className="text-2xl font-black text-secondary mt-1">{data.statusBreakdown?.reviewed || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0"><HelpCircle size={22} /></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Rejected</p>
            <p className="text-2xl font-black text-secondary mt-1">{data.statusBreakdown?.rejected || 0}</p>
          </div>
        </div>
      </div>

      {/* Demographics & Geography */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Demographics Chart (Custom SVG) */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[32px] border border-gray-100 shadow-soft flex flex-col gap-6">
          <div className="border-b border-gray-50 pb-4">
            <h3 className="text-base font-black text-secondary flex items-center gap-2"><Users size={18} className="text-primary" /> Demographics Breakdown</h3>
            <p className="text-xs text-gray-400 font-bold mt-0.5">Submitters profiling based on associated user accounts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Gender chart */}
            <div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Gender Distribution</h4>
              <div className="h-[180px] w-full pt-4 relative">
                <svg className="w-full h-full" viewBox="0 0 250 140" preserveAspectRatio="none">
                  {/* Bars */}
                  {[
                    { label: 'Male', val: gender.male, color: '#4f46e5' },
                    { label: 'Female', val: gender.female, color: '#ec4899' },
                    { label: 'Other', val: gender.unspecified, color: '#94a3b8' }
                  ].map((item, idx) => {
                    const barHeight = Math.max(5, (item.val / maxGender) * 80);
                    const y = 100 - barHeight;
                    const x = 30 + idx * 70;
                    return (
                      <g key={idx}>
                        <rect x={x} y={y} width="30" height={barHeight} rx="3" fill={item.color} />
                        <text x={x + 15} y="115" textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold">{item.label}</text>
                        <text x={x + 15} y={y - 8} textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="black">{item.val}</text>
                      </g>
                    );
                  })}
                  <line x1="10" y1="100" x2="230" y2="100" stroke="#cbd5e1" strokeWidth="1" />
                </svg>
              </div>
            </div>

            {/* Age groups */}
            <div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Age Profile</h4>
              <div className="h-[180px] w-full pt-4 relative">
                <svg className="w-full h-full" viewBox="0 0 250 140" preserveAspectRatio="none">
                  {/* Bars */}
                  {[
                    { label: '<18', val: age.under18, color: '#f59e0b' },
                    { label: '18-25', val: age.y18_25, color: '#3b82f6' },
                    { label: '26-45', val: age.y26_45, color: '#10b981' },
                    { label: '45+', val: age.above45, color: '#6366f1' }
                  ].map((item, idx) => {
                    const barHeight = Math.max(5, (item.val / maxAge) * 80);
                    const y = 100 - barHeight;
                    const x = 20 + idx * 55;
                    return (
                      <g key={idx}>
                        <rect x={x} y={y} width="24" height={barHeight} rx="3" fill={item.color} />
                        <text x={x + 12} y="115" textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold">{item.label}</text>
                        <text x={x + 12} y={y - 8} textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="black">{item.val}</text>
                      </g>
                    );
                  })}
                  <line x1="10" y1="100" x2="240" y2="100" stroke="#cbd5e1" strokeWidth="1" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Spatial Geography (Right 4 cols) */}
        <div className="lg:col-span-4 bg-white p-8 rounded-[32px] border border-gray-100 shadow-soft flex flex-col gap-6">
          <div className="border-b border-gray-50 pb-4">
            <h3 className="text-base font-black text-secondary flex items-center gap-2"><MapPin size={18} className="text-primary" /> Spatial Scoping</h3>
            <p className="text-xs text-gray-400 font-bold mt-0.5">Top regional locations of submissions.</p>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Top States</h4>
              <div className="space-y-2">
                {Object.entries(locationStates).length === 0 ? (
                  <p className="text-[10px] text-gray-400 italic">No state data loaded</p>
                ) : (
                  Object.entries(locationStates).slice(0, 3).map(([st, cnt]: any) => (
                    <div key={st} className="flex justify-between items-center bg-gray-50 px-3.5 py-2 rounded-xl text-xs font-bold text-secondary">
                      <span>{st}</span>
                      <span className="text-primary">{cnt}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Top Districts</h4>
              <div className="space-y-2">
                {Object.entries(locationDistricts).length === 0 ? (
                  <p className="text-[10px] text-gray-400 italic">No district data loaded</p>
                ) : (
                  Object.entries(locationDistricts).slice(0, 3).map(([dist, cnt]: any) => (
                    <div key={dist} className="flex justify-between items-center bg-gray-50 px-3.5 py-2 rounded-xl text-xs font-bold text-secondary">
                      <span>{dist}</span>
                      <span className="text-primary">{cnt}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Question Analytics Block */}
      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-soft flex flex-col gap-6">
        <div className="border-b border-gray-50 pb-4">
          <h3 className="text-base font-black text-secondary flex items-center gap-2"><BarChart3 size={18} className="text-primary" /> Question Metrics Analysis</h3>
          <p className="text-xs text-gray-400 font-bold mt-0.5">Aggregated answer counts for fields enabled in form configuration.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {Object.entries(data.fieldAnalytics || {}).length === 0 ? (
            <div className="col-span-2 text-center text-gray-400 font-bold italic py-8">No fields enabled for analytics in Form Builder configurations.</div>
          ) : (
            Object.entries(data.fieldAnalytics).map(([fieldId, fieldData]: any) => {
              const type = fieldData.type;
              
              return (
                <div key={fieldId} className="bg-gray-50 p-6 rounded-[24px] border border-gray-100 flex flex-col gap-4">
                  <div>
                    <span className="text-[8px] font-black text-primary uppercase tracking-widest">{type} question</span>
                    <h4 className="font-black text-secondary text-sm leading-snug mt-1">{fieldData.label}</h4>
                  </div>

                  {/* Rendering select, radio, checkbox answers */}
                  {['select', 'radio', 'checkbox'].includes(type) && (
                    <div className="space-y-3">
                      {Object.entries(fieldData.options || {}).length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No selections logged.</p>
                      ) : (
                        Object.entries(fieldData.options).map(([opt, val]: any) => {
                          const rate = total > 0 ? Math.round((val / total) * 100) : 0;
                          return (
                            <div key={opt} className="space-y-1">
                              <div className="flex justify-between text-xs font-bold text-secondary">
                                <span>{opt}</span>
                                <span>{val} ({rate}%)</span>
                              </div>
                              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${rate}%` }}></div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* Rendering toggle */}
                  {type === 'toggle' && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-bold text-secondary">
                        <span>Yes</span>
                        <span>{fieldData.yes} ({total > 0 ? Math.round((fieldData.yes / total) * 100) : 0}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full" style={{ width: `${total > 0 ? (fieldData.yes / total) * 100 : 0}%` }}></div>
                      </div>

                      <div className="flex justify-between text-xs font-bold text-secondary">
                        <span>No</span>
                        <span>{fieldData.no} ({total > 0 ? Math.round((fieldData.no / total) * 100) : 0}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-rose-400 h-full" style={{ width: `${total > 0 ? (fieldData.no / total) * 100 : 0}%` }}></div>
                      </div>
                    </div>
                  )}

                  {/* Rendering numeric bounds */}
                  {type === 'number' && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white p-3.5 rounded-xl border border-gray-200/60 text-center">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">MIN</span>
                        <p className="text-lg font-black text-secondary mt-1">{fieldData.min ?? '-'}</p>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-gray-200/60 text-center">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">MAX</span>
                        <p className="text-lg font-black text-secondary mt-1">{fieldData.max ?? '-'}</p>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-gray-200/60 text-center">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">AVG</span>
                        <p className="text-lg font-black text-primary mt-1">{fieldData.avg ?? '-'}</p>
                      </div>
                    </div>
                  )}

                  {/* Timeline date distribution */}
                  {type === 'date' && (
                    <div className="space-y-2">
                      {Object.entries(fieldData.dates || {}).length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No dates binned.</p>
                      ) : (
                        Object.entries(fieldData.dates).map(([timelineKey, val]: any) => (
                          <div key={timelineKey} className="flex justify-between items-center text-xs font-bold text-secondary bg-white px-3.5 py-1.5 rounded-lg border border-gray-200/60">
                            <span>{timelineKey}</span>
                            <span className="text-primary font-black">{val}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Standard text questions */}
                  {!['select', 'radio', 'checkbox', 'toggle', 'number', 'date'].includes(type) && (
                    <div className="bg-white p-3.5 rounded-xl border border-gray-250/50 flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-500">Filled Responses</span>
                      <span className="text-primary font-black text-base">{fieldData.count || 0}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Saved Reports Module */}
      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-soft flex flex-col gap-6">
        <div className="border-b border-gray-50 pb-4">
          <h3 className="text-base font-black text-secondary flex items-center gap-2"><Save size={18} className="text-primary" /> Reports History Log</h3>
          <p className="text-xs text-gray-400 font-bold mt-0.5">Historical generated exports archive center.</p>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-8 text-gray-400 font-bold italic text-xs">No reports generated for archive yet. Exports generated via the top download links will download directly.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((rep) => (
              <div key={rep._id} className="bg-gray-50 p-4 border border-gray-100 rounded-2xl flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[8px] font-black text-primary uppercase tracking-widest">Version v{rep.formVersion} | {rep.reportType}</span>
                  <h5 className="font-bold text-secondary text-xs truncate mt-0.5" title={rep.fileUrl}>Generated by {rep.generatedBy?.fullName || 'System'}</h5>
                  <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-widest">{new Date(rep.createdAt).toLocaleDateString()}</p>
                </div>
                <a href={rep.fileUrl} target="_blank" rel="noreferrer" className="bg-white hover:bg-primary hover:text-white text-secondary p-2 rounded-xl transition-all border border-gray-150 shadow-sm shrink-0">
                  <Download size={14} />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
