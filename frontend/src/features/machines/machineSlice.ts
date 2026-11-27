import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MachineApiModel, MachineDetailModel, MachineStatus } from '../../api/machineApi';
import { PaginationMeta } from '../../api/types';
import { fetchMachines, fetchMachineById } from './machineThunks';

export type StatusFilter = 'all' | MachineStatus;
export type ThemeMode = 'dark' | 'light';

export interface MachineState {
  items: MachineApiModel[];
  pagination: PaginationMeta;
  loading: boolean;
  error: string | null;
  statusFilter: StatusFilter;
  searchQuery: string;
  theme: ThemeMode;
  lastFetched: string | null;
  selectedMachine: MachineDetailModel | null;
  selectedLoading: boolean;
  selectedError: string | null;
}

const initialState: MachineState = {
  items: [],
  pagination: {
    page: 1,
    limit: 8,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
  loading: false,
  error: null,
  statusFilter: 'all',
  searchQuery: '',
  theme: 'dark',
  lastFetched: null,
  selectedMachine: null,
  selectedLoading: false,
  selectedError: null,
};

export const machineSlice = createSlice({
  name: 'machines',
  initialState,
  reducers: {
    setStatusFilter: (state, action: PayloadAction<StatusFilter>) => {
      state.statusFilter = action.payload;
      state.pagination.page = 1;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.pagination.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
      state.pagination.page = 1;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
    clearSelectedMachine: (state) => {
      state.selectedMachine = null;
      state.selectedError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all machines
      .addCase(fetchMachines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMachines.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchMachines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch machines';
      })
      // Fetch machine by ID
      .addCase(fetchMachineById.pending, (state) => {
        state.selectedLoading = true;
        state.selectedError = null;
      })
      .addCase(fetchMachineById.fulfilled, (state, action) => {
        state.selectedLoading = false;
        state.selectedMachine = action.payload;
      })
      .addCase(fetchMachineById.rejected, (state, action) => {
        state.selectedLoading = false;
        state.selectedError = action.payload || 'Failed to load machine details';
      });
  },
});

export const {
  setStatusFilter,
  setSearchQuery,
  setPage,
  setLimit,
  toggleTheme,
  clearSelectedMachine,
} = machineSlice.actions;

export default machineSlice.reducer;
