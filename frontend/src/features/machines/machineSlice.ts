import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MachineApiModel, MachineDetailModel, MachineStatus } from '../../api/machineApi';
import { PaginationMeta } from '../../api/types';
import { fetchMachines, fetchMachineById, acknowledgeFault } from './machineThunks';

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
  actionLoading: boolean;
  actionSuccessMessage: string | null;
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
  actionLoading: false,
  actionSuccessMessage: null,
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
      state.actionSuccessMessage = null;
    },
    clearActionMessage: (state) => {
      state.actionSuccessMessage = null;
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
        state.actionSuccessMessage = null;
      })
      .addCase(fetchMachineById.fulfilled, (state, action) => {
        state.selectedLoading = false;
        state.selectedMachine = action.payload;
      })
      .addCase(fetchMachineById.rejected, (state, action) => {
        state.selectedLoading = false;
        state.selectedError = action.payload || 'Failed to load machine details';
      })
      // Acknowledge Fault
      .addCase(acknowledgeFault.pending, (state) => {
        state.actionLoading = true;
        state.selectedError = null;
      })
      .addCase(acknowledgeFault.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.selectedMachine = action.payload;
        state.actionSuccessMessage = `Fault on ${action.payload.name} successfully acknowledged.`;

        // Optimistically update the item in the list array
        const idx = state.items.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx] = {
            id: action.payload.id,
            name: action.payload.name,
            status: action.payload.status,
            temperature: action.payload.temperature,
            vibration: action.payload.vibration,
            lastUpdated: action.payload.lastUpdated,
          };
        }
      })
      .addCase(acknowledgeFault.rejected, (state, action) => {
        state.actionLoading = false;
        state.selectedError = action.payload || 'Failed to acknowledge fault';
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
  clearActionMessage,
} = machineSlice.actions;

export default machineSlice.reducer;
