import React, { useEffect, useCallback } from 'react';
import { RefreshCw, Radio } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchMachines, fetchMachineById, acknowledgeFault } from '../features/machines/machineThunks';
import {
  selectAllMachines,
  selectMachinesLoading,
  selectMachinesError,
  selectStatusFilter,
  selectSearchQuery,
  selectTheme,
  selectLastFetched,
  selectPagination,
  selectSelectedMachine,
  selectSelectedLoading,
  selectSelectedError,
  selectActionLoading,
  selectActionSuccessMessage,
} from '../features/machines/machineSelectors';
import {
  setStatusFilter,
  setSearchQuery,
  setPage,
  setLimit,
  toggleTheme,
  clearSelectedMachine,
  StatusFilter,
} from '../features/machines/machineSlice';
import { FilterBar } from '../features/machines/components/FilterBar';
import { MachineGrid } from '../features/machines/components/MachineGrid';
import { MachineDetailModal } from '../features/machines/components/MachineDetailModal';
import { PaginationControls } from '../components/PaginationControls';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { ThemeToggle } from '../components/ThemeToggle';

export const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();

  const machines = useAppSelector(selectAllMachines);
  const loading = useAppSelector(selectMachinesLoading);
  const error = useAppSelector(selectMachinesError);
  const statusFilter = useAppSelector(selectStatusFilter);
  const searchQuery = useAppSelector(selectSearchQuery);
  const theme = useAppSelector(selectTheme);
  const lastFetched = useAppSelector(selectLastFetched);
  const pagination = useAppSelector(selectPagination);

  const selectedMachine = useAppSelector(selectSelectedMachine);
  const selectedLoading = useAppSelector(selectSelectedLoading);
  const selectedError = useAppSelector(selectSelectedError);
  const actionLoading = useAppSelector(selectActionLoading);
  const actionSuccessMessage = useAppSelector(selectActionSuccessMessage);

  const loadData = useCallback(() => {
    dispatch(
      fetchMachines({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter,
        search: searchQuery,
      })
    );
  }, [dispatch, pagination.page, pagination.limit, statusFilter, searchQuery]);

  // Initial fetch on mount and whenever user changes pagination / filters
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-Time Server-Sent Events (SSE) Stream
  useEffect(() => {
    const sseUrl = 'http://localhost:5000/api/machines/stream';
    const eventSource = new EventSource(sseUrl);

    // React immediately when machines.json or any machine status is changed
    eventSource.addEventListener('machine_update', () => {
      loadData();
    });

    return () => {
      eventSource.close();
    };
  }, [loadData]);

  const handleSelectMachine = (id: string) => {
    dispatch(fetchMachineById(id));
  };

  const handleAcknowledgeFault = (id: string, supervisorId: string, notes?: string) => {
    dispatch(acknowledgeFault({ id, supervisorId, notes }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            IIoT Machine Monitoring Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {lastFetched && (
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-400">
              <Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
              {new Date(lastFetched).toLocaleTimeString()}
            </span>
          )}

          <button
            onClick={loadData}
            disabled={loading}
            aria-label="Refresh telemetry data"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-blue-500' : ''}`} />
            Refresh
          </button>

          <ThemeToggle theme={theme} onToggle={() => dispatch(toggleTheme())} />
        </div>
      </header>

      {/* Error Banner */}
      {error && <ErrorMessage message={error} onRetry={loadData} />}

      {/* Search & Filter Bar */}
      <FilterBar
        statusFilter={statusFilter}
        onStatusChange={(status: StatusFilter) => dispatch(setStatusFilter(status))}
        searchQuery={searchQuery}
        onSearchChange={(q: string) => dispatch(setSearchQuery(q))}
        totalItems={pagination.totalItems}
      />

      {/* Machine Grid or Loading state */}
      {loading && machines.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <>
          <MachineGrid machines={machines} onSelectMachine={handleSelectMachine} />

          {/* Reusable Pagination Controls */}
          <PaginationControls
            pagination={pagination}
            onPageChange={(p) => dispatch(setPage(p))}
            onLimitChange={(l) => dispatch(setLimit(l))}
            pageSizeOptions={[4, 8, 12, 16]}
          />
        </>
      )}

      {/* Machine Detail Diagnostic Modal */}
      {(selectedMachine || selectedLoading || selectedError) && (
        <MachineDetailModal
          machine={selectedMachine}
          loading={selectedLoading}
          error={selectedError}
          actionLoading={actionLoading}
          actionSuccessMessage={actionSuccessMessage}
          onClose={() => dispatch(clearSelectedMachine())}
          onAcknowledgeFault={handleAcknowledgeFault}
        />
      )}
    </div>
  );
};
