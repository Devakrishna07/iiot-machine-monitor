import { Response } from 'express';
import { PaginationMeta } from '../domain/Pagination.js';

const STATUS_TEXT_MAP: Record<number, string> = {
  200: '200 OK',
  201: '201 CREATED',
  204: '204 NO_CONTENT',
  400: '400 BAD_REQUEST',
  401: '401 UNAUTHORIZED',
  403: '403 FORBIDDEN',
  404: '404 NOT_FOUND',
  409: '409 CONFLICT',
  422: '422 UNPROCESSABLE_ENTITY',
  500: '500 INTERNAL_SERVER_ERROR',
};

function getStatusText(code: number, isError = false): string {
  return STATUS_TEXT_MAP[code] || `${code} ${isError ? 'ERROR' : 'OK'}`;
}

export interface ApiSuccessEnvelope<T> {
  success: true;
  status: string;
  data: T;
  message?: string;
}

export interface ApiPaginatedEnvelope<T> {
  success: true;
  status: string;
  data: T[];
  pagination: PaginationMeta;
  message?: string;
}

export interface ApiErrorEnvelope {
  success: false;
  status: string;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export class ApiResponse {
  public static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode = 200
  ): void {
    const payload: ApiSuccessEnvelope<T> = {
      success: true,
      status: getStatusText(statusCode, false),
      data,
      ...(message ? { message } : {}),
    };
    res.status(statusCode).json(payload);
  }

  public static paginated<T>(
    res: Response,
    data: T[],
    pagination: PaginationMeta,
    message?: string,
    statusCode = 200
  ): void {
    const payload: ApiPaginatedEnvelope<T> = {
      success: true,
      status: getStatusText(statusCode, false),
      data,
      pagination,
      ...(message ? { message } : {}),
    };
    res.status(statusCode).json(payload);
  }

  public static error(
    res: Response,
    message: string,
    statusCode = 400,
    code?: string,
    details?: unknown
  ): void {
    const payload: ApiErrorEnvelope = {
      success: false,
      status: getStatusText(statusCode, true),
      error: {
        message,
        ...(code ? { code } : {}),
        ...(details !== undefined ? { details } : {}),
      },
    };
    res.status(statusCode).json(payload);
  }
}
