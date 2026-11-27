export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiSuccessResponse<T> {
  success: true;
  status: string;
  data: T;
  message?: string;
}

export interface ApiPaginatedResponse<T> {
  success: true;
  status: string;
  data: T[];
  pagination: PaginationMeta;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  status: string;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiPaginatedResponse<T> | ApiErrorResponse;
