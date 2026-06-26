import React from 'react';
import { Search } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface UnifiedFilterBarProps {
  search: string;
  setSearch: (val: string) => void;
  searchPlaceholder?: string;
  dateFilter: string;
  setDateFilter: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  // Optional filters
  agreementFilter?: string;
  setAgreementFilter?: (val: string) => void;
  offerLetterFilter?: string;
  setOfferLetterFilter?: (val: string) => void;
}

export default function UnifiedFilterBar({
  search,
  setSearch,
  searchPlaceholder = "Search...",
  dateFilter,
  setDateFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  agreementFilter,
  setAgreementFilter,
  offerLetterFilter,
  setOfferLetterFilter
}: UnifiedFilterBarProps) {
  const { t } = useLanguage();

  return (
    <div className="flex gap-4 mb-8 flex-wrap">
      <div className="relative flex-1 min-w-[300px]">
        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
        />
      </div>
      
      <div className="flex gap-2">
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        >
          <option value="all">{t('members.allTime', 'All Time')}</option>
          <option value="today">{t('members.today', 'Today')}</option>
          <option value="yesterday">{t('members.yesterday', 'Yesterday')}</option>
          <option value="custom">{t('members.customDate', 'Custom Date')}</option>
        </select>
 
        {setAgreementFilter && agreementFilter !== undefined && (
          <select
            value={agreementFilter}
            onChange={(e) => setAgreementFilter(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="all">{t('filters.agreementAll', 'Agreement: All')}</option>
            <option value="generated">{t('filters.generated', 'Generated')}</option>
            <option value="not_generated">{t('filters.notGenerated', 'Not Generated')}</option>
          </select>
        )}
 
        {setOfferLetterFilter && offerLetterFilter !== undefined && (
          <select
            value={offerLetterFilter}
            onChange={(e) => setOfferLetterFilter(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="all">{t('filters.offerLetterAll', 'Offer Letter: All')}</option>
            <option value="generated">{t('filters.generated', 'Generated')}</option>
            <option value="not_generated">{t('filters.notGenerated', 'Not Generated')}</option>
          </select>
        )}
 
 
 
        {dateFilter === 'custom' && (
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <span className="text-gray-400 font-bold text-xs">→</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        )}
      </div>
    </div>
  );
}
