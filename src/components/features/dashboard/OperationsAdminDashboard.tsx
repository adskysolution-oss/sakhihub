'use client';

import React from 'react';
import { 
  FileText, ShieldCheck, ClipboardList, 
  Clock, CheckCircle, BarChart3, AlertCircle, Award
} from 'lucide-react';
import { motion } from 'framer-motion';

interface OperationsAdminDashboardProps {
  stats: any;
}

export default function OperationsAdminDashboard({ stats: data }: OperationsAdminDashboardProps) {
  const stats = data?.stats || {};
  const recentLogs = data?.recentLogs || [];

  const cards = [
    {
      label: 'Pending Documents',
      value: stats.pendingDocuments ?? 0,
      icon: FileText,
      color: '#e91e63',
      description: 'Document uploads awaiting review'
    },
    {
      label: 'Pending KYC Verifications',
      value: stats.pendingVerifications ?? 0,
      icon: ShieldCheck,
      color: '#ef6c00',
      description: 'Aadhaar/PAN verification queue'
    },
    {
      label: 'Pending Agreements',
      value: stats.pendingAgreements ?? 0,
      icon: CheckCircle,
      color: '#2e7d32',
      description: 'Partners needing MOU/agreements'
    },
    {
      label: 'Pending Offer Letters',
      value: stats.pendingOfferLetters ?? 0,
      icon: Award,
      color: '#7b1fa2',
      description: 'Employees awaiting offer letters'
    },
    {
      label: 'Daily Field Reports',
      value: stats.pendingReports ?? 0,
      icon: ClipboardList,
      color: '#0288d1',
      description: 'Submitted field force reports'
    }
  ];

  return (
    <div className="flex flex-col gap-6 md:gap-10">
      {/* Overview Stats */}
      <div>
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-l-4 border-primary pl-4 mb-6">
          Pending Operations Queue
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-soft relative overflow-hidden group hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ background: `${card.color}15`, color: card.color }}
                >
                  <card.icon size={24} />
                </div>
              </div>
              <div className="mt-5">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">
                  {card.label}
                </p>
                <h3 className="text-2xl md:text-3xl font-black text-secondary mt-2">
                  {card.value}
                </h3>
                <p className="text-[9px] text-gray-400 font-bold uppercase mt-2 tracking-wider">
                  {card.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        {/* Weekly Productivity Ledger */}
        <div className="lg:col-span-5 bg-white rounded-[30px] border border-gray-100 shadow-soft p-6 sm:p-8 md:p-10">
          <h3 className="text-xl font-bold text-secondary mb-6 flex items-center gap-3">
            <BarChart3 size={22} className="text-primary" /> Action Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100/50 text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Today's Actions
              </p>
              <h4 className="text-4xl font-black text-primary mt-2">
                {stats.todayActions ?? 0}
              </h4>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100/50 text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Weekly Actions
              </p>
              <h4 className="text-4xl font-black text-secondary mt-2">
                {stats.weeklyActions ?? 0}
              </h4>
            </div>
          </div>
          <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-3">
            <AlertCircle size={16} className="text-primary shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-secondary leading-relaxed">
              Your actions are logged for compliance monitoring. Keep the verification queue updated daily to ensure field force onboarding stays smooth.
            </p>
          </div>
        </div>

        {/* Action Logs Feed */}
        <div className="lg:col-span-7 bg-white rounded-[30px] border border-gray-100 shadow-soft p-6 sm:p-8 md:p-10">
          <h3 className="text-xl font-bold text-secondary mb-6 flex items-center gap-3">
            <Clock size={22} className="text-primary" /> Your Recent Activity
          </h3>
          <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-2">
            {recentLogs.length > 0 ? (
              recentLogs.map((log: any) => (
                <div
                  key={log._id}
                  className="flex items-center justify-between p-4 bg-[#fafafa] rounded-2xl border border-gray-50 hover:border-primary/20 transition-all"
                >
                  <div>
                    <p className="text-sm font-bold text-secondary capitalize">
                      {log.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-1">
                      {log.targetUser ? `Target: ${log.targetUser.fullName} (${log.targetUser.role})` : 'System Action'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-[9px] text-gray-300 font-bold uppercase tracking-wider mt-0.5">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400 font-semibold italic border-2 border-dashed border-gray-100 rounded-3xl">
                No recent activity logs found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
