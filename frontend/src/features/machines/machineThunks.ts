import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchMachinesApi,
  fetchMachineByIdApi,
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
