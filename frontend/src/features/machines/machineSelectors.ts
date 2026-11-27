import { RootState } from '../../store';

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
