import React from 'react';
import { SearchInput } from '../../../components/SearchInput';
import { StatusFilter } from '../machineSlice';

interface FilterBarProps {
  statusFilter: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  counts: {
    all: number;
    running: number;
    idle: number;
    fault: number;
  };
}

export const FilterBar: React.FC<FilterBarProps> = ({
  statusFilter,
  onStatusChange,
  searchQuery,
  onSearchChange,
  counts,
}) => {
  const tabs: { id: StatusFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All Units', count: counts.all },
    { id: 'running', label: 'Running', count: counts.running },
    { id: 'idle', label: 'Idle', count: counts.idle },
    { id: 'fault', label: 'Fault', count: counts.fault },
  ];

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 py-2">
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onStatusChange(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <SearchInput value={searchQuery} onChange={onSearchChange} />
    </div>
  );
};
