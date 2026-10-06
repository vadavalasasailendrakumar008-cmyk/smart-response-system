import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { EmergencyCategory, PriorityLevel, IncidentStatus } from '../../shared/types';

interface IncidentFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedPriority: string;
  onPriorityChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  onReset: () => void;
}

export const IncidentFilterBar: React.FC<IncidentFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedPriority,
  onPriorityChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  onReset,
}) => {
  const priorities: (PriorityLevel | 'ALL')[] = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  const categories: (EmergencyCategory | 'ALL')[] = [
    'ALL',
    'MEDICAL',
    'ACCIDENT',
    'FIRE',
    'CRIME',
    'DISASTER',
    'MISSING',
    'OTHER',
  ];

  const statuses: (IncidentStatus | 'ALL')[] = [
    'ALL',
    'Reported',
    'Under Review',
    'Responder Assigned',
    'Responder En Route',
    'Assistance Arrived',
    'Resolved',
  ];

  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search incident title, description, or address..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Priority Filter Badges */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1.5 shrink-0">
            Priority:
          </span>
          {priorities.map((p) => {
            const isSelected = selectedPriority === p;
            const badgeColor = {
              ALL: 'hover:border-slate-500',
              CRITICAL: 'hover:border-red-500 text-red-400',
              HIGH: 'hover:border-orange-500 text-orange-400',
              MEDIUM: 'hover:border-amber-500 text-amber-400',
              LOW: 'hover:border-slate-500 text-slate-400',
            }[p];

            return (
              <button
                key={p}
                type="button"
                onClick={() => onPriorityChange(p)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border shrink-0 ${
                  isSelected
                    ? p === 'CRITICAL'
                      ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/20'
                      : p === 'HIGH'
                      ? 'bg-orange-500 text-white border-orange-500'
                      : p === 'MEDIUM'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-slate-700 text-white border-slate-600'
                    : `bg-slate-900/80 border-slate-800 text-slate-300 ${badgeColor}`
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Row: Category & Status Dropdowns */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Selector */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Selector */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset button */}
        <button
          type="button"
          onClick={onReset}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 text-xs flex items-center space-x-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>
    </div>
  );
};
