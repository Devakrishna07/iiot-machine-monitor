import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchMachinesApi,
  fetchMachineByIdApi,
  acknowledgeMachineFaultApi,
  FetchMachinesParams,
  MachineApiModel,
  MachineDetailModel,
} from '../../api/machineApi';
import { ApiPaginatedResponse } from '../../api/types';

export const fetchMachines = createAsyncThunk<
  ApiPaginatedResponse<MachineApiModel>,
  FetchMachinesParams | undefined,
  { rejectValue: string }
>('machines/fetchMachines', async (params, { rejectWithValue }) => {
  try {
    const response = await fetchMachinesApi(params);
    return response;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue('An unexpected error occurred while fetching machines');
  }
});

export const fetchMachineById = createAsyncThunk<
  MachineDetailModel,
  string,
  { rejectValue: string }
>('machines/fetchMachineById', async (id, { rejectWithValue }) => {
  try {
    const data = await fetchMachineByIdApi(id);
    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue('Failed to fetch machine details');
  }
});

export interface AcknowledgeFaultPayload {
  id: string;
  supervisorId: string;
  notes?: string;
}

export const acknowledgeFault = createAsyncThunk<
  MachineDetailModel,
  AcknowledgeFaultPayload,
  { rejectValue: string }
>('machines/acknowledgeFault', async ({ id, supervisorId, notes }, { rejectWithValue }) => {
  try {
    const data = await acknowledgeMachineFaultApi(id, supervisorId, notes);
    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue('Failed to acknowledge machine fault');
  }
});
