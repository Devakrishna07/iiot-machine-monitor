import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { MachineApiModel } from '../../api/machineApi';

export const selectMachineState = (state: RootState) => state.machines;

export const selectAllMachines = (state: RootState) => state.machines.items;
export const selectMachinesLoading = (state: RootState) => state.machines.loading;
export const selectMachinesError = (state: RootState) => state.machines.error;
export const selectStatusFilter = (state: RootState) => state.machines.statusFilter;
export const selectSearchQuery = (state: RootState) => state.machines.searchQuery;
export const selectTheme = (state: RootState) => state.machines.theme;
export const selectLastFetched = (state: RootState) => state.machines.lastFetched;
export const selectPagination = (state: RootState) => state.machines.pagination;

export const selectSelectedMachine = (state: RootState) => state.machines.selectedMachine;
export const selectSelectedLoading = (state: RootState) => state.machines.selectedLoading;
export const selectSelectedError = (state: RootState) => state.machines.selectedError;
export const selectActionLoading = (state: RootState) => state.machines.actionLoading;
export const selectActionSuccessMessage = (state: RootState) => state.machines.actionSuccessMessage;

export const selectMachineStats = createSelector(
  [selectAllMachines, selectPagination],
  (machines: MachineApiModel[], pagination) => {
    const total = pagination.totalItems || machines.length;
    const running = machines.filter((m) => m.status === 'running').length;
    const idle = machines.filter((m) => m.status === 'idle').length;
    const fault = machines.filter((m) => m.status === 'fault').length;

    const avgTemperature =
      machines.length > 0
        ? Number((machines.reduce((acc, m) => acc + m.temperature, 0) / machines.length).toFixed(1))
        : 0;

    return {
      total,
      running,
      idle,
      fault,
      avgTemperature,
    };
  }
);
