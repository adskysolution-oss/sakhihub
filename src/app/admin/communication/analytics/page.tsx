'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import {
  TrendingUp,
  Mail,
  CheckCircle,
  AlertTriangle,
  Percent,
  RefreshCw,
  BarChart3,
  Calendar,
  Sparkles,
  Award
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function AnalyticsDashboard() {
  const [data, setData] = useState<any>({
    summary: {
      totalSent: 0,
      totalDelivered: 0,
      totalFailed: 0,
      totalOpened: 0,
      totalClicked: 0,
      openRate: 0,
      clickRate: 0,
      deliveryRate: 0
    },
    charts: {
      daily: [],
      weekly: [],
      monthly: []
    },
    topCampaigns: []
  });
  const [loading, setLoading] = useState(true);
  const [chartTab, setChartTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/communication/analytics');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load campaign analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const getActiveChartData = () => {
    switch (chartTab) {
      case 'weekly':
        return data.charts.weekly || [];
      case 'monthly':
        return data.charts.monthly || [];
      case 'daily':
      default:
        return data.charts.daily || [];
    }
  };

  const activeData = getActiveChartData();
  const maxVolume = activeData.reduce((max: number, item: any) => Math.max(max, item.sent || 0), 10);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black text-secondary">Analytics Dashboard</h2>
            <p className="text-gray-400 font-bold mt-1">Review aggregated communication delivery logs, rates, and volume metrics.</p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-secondary border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Analytics
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-soft flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Mail size={22} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Total Emails Sent</p>
              <p className="text-2xl font-black text-secondary mt-1">{(data.summary?.totalSent ?? 0).toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-soft flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
              <CheckCircle size={22} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Delivery Rate</p>
              <p className="text-2xl font-black text-secondary mt-1">
                {data.summary?.deliveryRate ?? 0}%
                <span className="text-[9px] text-gray-400 font-semibold block mt-0.5">({(data.summary?.totalDelivered ?? 0).toLocaleString()} delivered)</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-soft flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Percent size={22} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider font-mono">Open Rate</p>
              <p className="text-2xl font-black text-secondary mt-1">
                {data.summary?.openRate ?? 0}%
                <span className="text-[9px] text-gray-400 font-semibold block mt-0.5">({(data.summary?.totalOpened ?? 0).toLocaleString()} opens)</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-soft flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Click Rate</p>
              <p className="text-2xl font-black text-secondary mt-1">
                {data.summary?.clickRate ?? 0}%
                <span className="text-[9px] text-gray-400 font-semibold block mt-0.5">({(data.summary?.totalClicked ?? 0).toLocaleString()} clicks)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Chart Card & Top Performing list */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Custom SVG Bar Chart (Left section - 8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6 bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-soft">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-50 pb-4">
              <div>
                <h3 className="text-base font-black text-secondary flex items-center gap-2">
                  <BarChart3 size={18} className="text-primary" /> Outgoing Volume Trends
                </h3>
                <p className="text-xs text-gray-400 font-bold mt-0.5">Volume statistics of outbound email dispatches.</p>
              </div>

              {/* Time Switcher */}
              <div className="flex bg-[#e2e8f0]/40 p-0.5 rounded-lg border border-[#e2e8f0]/80">
                {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setChartTab(tab)}
                    className={`px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-all ${chartTab === tab ? 'bg-white text-secondary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="h-[300px] flex items-center justify-center text-gray-400 italic">Computing graph metrics...</div>
            ) : activeData.length > 0 ? (
              <div className="w-full flex flex-col gap-4">
                {/* Custom Responsive SVG Chart */}
                <div className="h-[280px] w-full pt-4 relative">
                  <svg className="w-full h-full" viewBox="0 0 500 240" preserveAspectRatio="none">
                    {/* Horizontal helper grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((val, idx) => {
                      const y = 20 + val * 180;
                      const displayVal = Math.round(maxVolume * (1 - val));
                      return (
                        <g key={idx}>
                          <line x1="40" y1={y} x2="480" y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
                          <text x="32" y={y + 3} textAnchor="end" fill="#94a3b8" fontSize="8" fontWeight="bold">
                            {displayVal}
                          </text>
                        </g>
                      );
                    })}

                    {/* Columns Bars */}
                    {activeData.map((item: any, idx: number) => {
                      const count = activeData.length;
                      const colWidth = Math.min(30, 320 / count);
                      const gap = (400 - (count * colWidth)) / (count + 1);
                      const x = 50 + idx * (colWidth + gap);
                      
                      const barHeight = Math.max(5, (item.sent / maxVolume) * 180);
                      const y = 200 - barHeight;

                      const label = item._id.includes('-') 
                        ? item._id.substring(5) // MM-DD or YYYY-MM
                        : item._id;

                      return (
                        <g key={idx} className="group">
                          {/* Main volume bar */}
                          <rect
                            x={x}
                            y={y}
                            width={colWidth}
                            height={barHeight}
                            rx="4"
                            fill="url(#barGradient)"
                            className="transition-all duration-300 hover:fill-primary-light cursor-pointer"
                          />
                          {/* Label */}
                          <text
                            x={x + colWidth / 2}
                            y="220"
                            textAnchor="middle"
                            fill="#64748b"
                            fontSize="8"
                            fontWeight="bold"
                          >
                            {label}
                          </text>
                          {/* Tooltip detail (renders on hover) */}
                          <title>{`Sent: ${item.sent}\nDelivered: ${item.delivered || 0}`}</title>
                        </g>
                      );
                    })}

                    {/* Bottom axis line */}
                    <line x1="40" y1="200" x2="480" y2="200" stroke="#cbd5e1" strokeWidth="1" />

                    {/* Gradient Definition */}
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff2768" />
                        <stop offset="100%" stopColor="#ff7096" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="flex justify-end gap-4 text-[9px] font-black uppercase tracking-wider text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-primary"></span> Volume Sent
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400 font-semibold italic">
                No dispatch volume data recorded for this time segment.
              </div>
            )}
          </div>

          {/* Top Campaigns List (Right section - 4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6 bg-white p-6 rounded-[32px] border border-gray-100 shadow-soft">
            <div className="border-b border-gray-50 pb-4">
              <h3 className="text-base font-black text-secondary flex items-center gap-2">
                <Award size={18} className="text-primary" /> Top Campaigns
              </h3>
              <p className="text-xs text-gray-400 font-bold mt-0.5">Most active bulk runs by volume.</p>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-400 italic">Calculating performance stats...</div>
            ) : data.topCampaigns.length > 0 ? (
              <div className="flex flex-col gap-4">
                {data.topCampaigns.map((c: any, index: number) => {
                  const rate = c.recipientCount > 0 ? Math.round((c.deliveredCount / c.recipientCount) * 100) : 0;
                  return (
                    <div key={c._id} className="p-4 bg-[#f8f9fa] border border-gray-50 rounded-2xl flex items-center justify-between gap-3 hover:scale-102 transition-all">
                      <div className="min-w-0">
                        <span className="text-[8px] font-black text-primary uppercase tracking-widest">Rank #{index + 1}</span>
                        <h4 className="font-bold text-secondary text-xs truncate mt-0.5" title={c.name}>{c.name}</h4>
                        <p className="text-[9px] text-gray-400 font-semibold mt-1">Sent to: <span className="font-bold text-secondary">{c.recipientCount} targets</span></p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[8px] text-gray-400 font-black uppercase tracking-wider">Success Rate</p>
                        <p className="font-black text-green-600 text-xs mt-0.5">{rate}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 font-semibold italic">
                No completed campaign runs found.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
