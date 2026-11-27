import React from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { SearchInput } from '../../../components/SearchInput';
import { StatusFilter } from '../machineSlice';

interface FilterBarProps {
  statusFilter: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalItems: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  statusFilter,
  onStatusChange,
  searchQuery,
  onSearchChange,
  totalItems,
}) => {
  const statusOptions: { value: StatusFilter; label: string; colorClass: string }[] = [
    { value: 'all', label: 'All Machines', colorClass: 'bg-slate-400' },
    { value: 'running', label: 'Running Units', colorClass: 'bg-emerald-500' },
    { value: 'idle', label: 'Idle / Standby', colorClass: 'bg-amber-500' },
    { value: 'fault', label: 'Fault / Alert', colorClass: 'bg-rose-500' },
  ];

  const currentOption =
    statusOptions.find((opt) => opt.value === statusFilter) || statusOptions[0];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 py-2">
      {/* Status Selection Dropdown */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center">
          <div className="absolute left-3 pointer-events-none flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className={`h-2 w-2 rounded-full ${currentOption.colorClass}`} />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
            aria-label="Filter machines by status"
            className="appearance-none pl-9 pr-9 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer shadow-sm transition-colors"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 pointer-events-none" />
        </div>

        {/* Count Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 shadow-sm">
          <span>{totalItems}</span>
          <span className="font-normal text-slate-500 dark:text-slate-400 text-[11px]">
            {totalItems === 1 ? 'Machine' : 'Machines'}
          </span>
        </span>
      </div>

      {/* Live Search Input */}
      <SearchInput value={searchQuery} onChange={onSearchChange} />
    </div>
  );
};
