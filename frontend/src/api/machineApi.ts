import { apiClient } from './client';
import { ApiPaginatedResponse, ApiSuccessResponse } from './types';

export type MachineStatus = 'running' | 'idle' | 'fault';

export interface FaultDetails {
  code: string;
  reason: string;
  triggeredAt: string;
  isAcknowledged: boolean;
  acknowledgedBy?: string | null;
  acknowledgedAt?: string | null;
}

export interface TelemetryPoint {
  timestamp: string;
  temperature: number;
  vibration: number;
}

export interface MachineApiModel {
  id: string;
  name: string;
  status: MachineStatus;
  temperature: number;
  vibration: number;
  lastUpdated: string;
}

export interface MachineDetailModel extends MachineApiModel {
  type: string;
  location: string;
  operatingHours: number;
  fault: FaultDetails | null;
  telemetryHistory: TelemetryPoint[];
}

export interface FetchMachinesParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export const fetchMachinesApi = async (
  params?: FetchMachinesParams
): Promise<ApiPaginatedResponse<MachineApiModel>> => {
  const response = await apiClient.get<ApiPaginatedResponse<MachineApiModel>>('/machines', {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 8,
      ...(params?.status && params.status !== 'all' ? { status: params.status } : {}),
      ...(params?.search ? { search: params.search } : {}),
    },
  });
  return response.data;
};

export const fetchMachineByIdApi = async (id: string): Promise<MachineDetailModel> => {
  const response = await apiClient.get<ApiSuccessResponse<MachineDetailModel>>(`/machines/${id}`);
  return response.data.data;
};
